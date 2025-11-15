import Genetic from 'genetic-js';

/**
 * Class assignment optimizer using genetic algorithms
 * Priority order: Class size → Gender → Hard constraints → Soft constraints
 */

export class ClassOptimizer {
  constructor(students, classes, requests, frozenAssignments = [], settings = {}) {
    this.students = students;
    this.classes = classes;
    this.requests = requests;
    this.frozenAssignments = frozenAssignments;
    this.settings = {
      academicStreamingEnabled: settings.academicStreamingEnabled || false,
      targetClassSize: settings.targetClassSize || 25,
      ...settings
    };

    // Create student ID to index mapping
    this.studentIdToIndex = {};
    students.forEach((student, index) => {
      this.studentIdToIndex[student.id] = index;
    });
  }

  /**
   * Main optimization function
   */
  async optimize(maxGenerations = 100) {
    const numStudents = this.students.length;
    const numClasses = this.classes.length;

    // Initialize genetic algorithm
    const genetic = Genetic.create();

    genetic.optimize = Genetic.Optimize.Maximize;
    genetic.select1 = Genetic.Select1.Tournament2;
    genetic.select2 = Genetic.Select2.Tournament2;

    // Seed: Create initial random assignment
    genetic.seed = () => {
      const assignment = new Array(numStudents).fill(0);

      // First, place frozen students
      this.frozenAssignments.forEach(frozen => {
        const studentIndex = this.studentIdToIndex[frozen.studentId];
        const classIndex = this.classes.findIndex(c => c.id === frozen.classId);
        if (studentIndex !== undefined && classIndex !== -1) {
          assignment[studentIndex] = classIndex;
        }
      });

      // Then assign remaining students randomly
      for (let i = 0; i < numStudents; i++) {
        const isFrozen = this.frozenAssignments.some(
          f => this.studentIdToIndex[f.studentId] === i
        );
        if (!isFrozen) {
          assignment[i] = Math.floor(Math.random() * numClasses);
        }
      }

      return assignment;
    };

    // Mutate: Randomly move a non-frozen student to a different class
    genetic.mutate = (entity) => {
      const clone = entity.slice(0);
      const unFrozenIndices = [];

      for (let i = 0; i < numStudents; i++) {
        const isFrozen = this.frozenAssignments.some(
          f => this.studentIdToIndex[f.studentId] === i
        );
        if (!isFrozen) {
          unFrozenIndices.push(i);
        }
      }

      if (unFrozenIndices.length > 0) {
        const randomIndex = unFrozenIndices[Math.floor(Math.random() * unFrozenIndices.length)];
        clone[randomIndex] = Math.floor(Math.random() * numClasses);
      }

      return clone;
    };

    // Crossover: Combine two parent assignments
    genetic.crossover = (mother, father) => {
      const son = mother.slice(0);
      const daughter = father.slice(0);

      const crossoverPoint = Math.floor(Math.random() * numStudents);

      for (let i = crossoverPoint; i < numStudents; i++) {
        const isFrozen = this.frozenAssignments.some(
          f => this.studentIdToIndex[f.studentId] === i
        );
        if (!isFrozen) {
          son[i] = father[i];
          daughter[i] = mother[i];
        }
      }

      return [son, daughter];
    };

    // Fitness function: Score the assignment
    genetic.fitness = (entity) => {
      return this.calculateFitness(entity);
    };

    genetic.generation = (pop, generation, stats) => {
      // Optional: Log progress
      if (generation % 10 === 0) {
        console.log(`Generation ${generation}, Best fitness: ${stats.maximum}`);
      }
      return generation < maxGenerations;
    };

    // Run optimization
    const config = {
      size: 50,
      crossover: 0.7,
      mutation: 0.3,
      iterations: maxGenerations
    };

    genetic.evolve(config, this.students);

    // Get best solution
    const bestEntity = genetic.best();
    return this.entityToAssignments(bestEntity);
  }

  /**
   * Calculate fitness score for an assignment
   * Higher score = better assignment
   */
  calculateFitness(assignment) {
    let score = 0;

    // Get class distributions
    const classDistributions = this.getClassDistributions(assignment);

    // 1. Class size balance (highest priority) - weight: 1000
    const classSizeScore = this.calculateClassSizeBalance(classDistributions);
    score += classSizeScore * 1000;

    // 2. Gender balance - weight: 500
    const genderScore = this.calculateGenderBalance(classDistributions);
    score += genderScore * 500;

    // 3. Hard constraints - weight: 10000 (severe penalty for violations)
    const hardConstraintScore = this.calculateConstraintScore(assignment, 'hard');
    score += hardConstraintScore * 10000;

    // 4. Soft constraints - weight: 100
    const softConstraintScore = this.calculateConstraintScore(assignment, 'soft');
    score += softConstraintScore * 100;

    // 5. Academic streaming (if enabled) - weight: 200
    if (this.settings.academicStreamingEnabled) {
      const academicScore = this.calculateAcademicBalance(classDistributions);
      score += academicScore * 200;
    }

    return score;
  }

  /**
   * Calculate class size balance score
   */
  calculateClassSizeBalance(distributions) {
    const classSizes = distributions.map(d => d.total);
    const avgSize = classSizes.reduce((a, b) => a + b, 0) / classSizes.length;
    const variance = classSizes.reduce((sum, size) => sum + Math.pow(size - avgSize, 2), 0) / classSizes.length;

    // Lower variance = better balance = higher score
    return 1 / (1 + variance);
  }

  /**
   * Calculate gender balance score
   */
  calculateGenderBalance(distributions) {
    let totalScore = 0;

    distributions.forEach(dist => {
      if (dist.total === 0) return;

      const maleRatio = dist.male / dist.total;
      const femaleRatio = dist.female / dist.total;

      // Ideal is 0.5/0.5, calculate deviation
      const deviation = Math.abs(maleRatio - 0.5) + Math.abs(femaleRatio - 0.5);
      totalScore += 1 - deviation; // Lower deviation = higher score
    });

    return totalScore / distributions.length;
  }

  /**
   * Calculate constraint satisfaction score
   */
  calculateConstraintScore(assignment, priority) {
    const relevantRequests = this.requests.filter(r => r.priority === priority);
    if (relevantRequests.length === 0) return 1;

    let satisfied = 0;

    relevantRequests.forEach(request => {
      const studentIndex = this.studentIdToIndex[request.studentId];
      const targetIndex = this.studentIdToIndex[request.targetStudentId];

      if (studentIndex === undefined || targetIndex === undefined) return;

      const studentClass = assignment[studentIndex];
      const targetClass = assignment[targetIndex];

      if (request.type === 'together' && studentClass === targetClass) {
        satisfied++;
      } else if (request.type === 'not_together' && studentClass !== targetClass) {
        satisfied++;
      }
    });

    return satisfied / relevantRequests.length;
  }

  /**
   * Calculate academic balance score
   */
  calculateAcademicBalance(distributions) {
    let totalScore = 0;

    distributions.forEach(dist => {
      if (dist.total === 0) return;

      // For academic streaming, we want variance (separation)
      // For balanced, we want equal distribution
      const levels = [dist.academicHigh, dist.academicMedium, dist.academicLow];
      const avgLevel = levels.reduce((a, b) => a + b, 0) / 3;

      if (this.settings.academicStreamingEnabled) {
        // Want high variance (classes separated by level)
        const variance = levels.reduce((sum, count) => sum + Math.pow(count - avgLevel, 2), 0);
        totalScore += variance;
      } else {
        // Want low variance (even distribution)
        const variance = levels.reduce((sum, count) => sum + Math.pow(count - avgLevel, 2), 0);
        totalScore += 1 / (1 + variance);
      }
    });

    return totalScore / distributions.length;
  }

  /**
   * Get class distributions (gender, academic levels, etc.)
   */
  getClassDistributions(assignment) {
    const distributions = this.classes.map(() => ({
      total: 0,
      male: 0,
      female: 0,
      academicHigh: 0,
      academicMedium: 0,
      academicLow: 0
    }));

    this.students.forEach((student, index) => {
      const classIndex = assignment[index];
      const dist = distributions[classIndex];

      dist.total++;

      if (student.gender === 'male') dist.male++;
      if (student.gender === 'female') dist.female++;

      if (student.academicLevel === 'high') dist.academicHigh++;
      if (student.academicLevel === 'medium') dist.academicMedium++;
      if (student.academicLevel === 'low') dist.academicLow++;
    });

    return distributions;
  }

  /**
   * Convert entity array to assignment objects
   */
  entityToAssignments(entity) {
    return this.students.map((student, index) => ({
      studentId: student.id,
      classId: this.classes[entity[index]].id,
      frozen: this.frozenAssignments.some(f => f.studentId === student.id),
      manuallyPlaced: false
    }));
  }

  /**
   * Detect conflicts in current assignment
   */
  detectConflicts(assignments) {
    const conflicts = [];
    const assignmentMap = {};

    assignments.forEach(a => {
      assignmentMap[a.studentId] = a.classId;
    });

    this.requests.forEach(request => {
      const studentClass = assignmentMap[request.studentId];
      const targetClass = assignmentMap[request.targetStudentId];

      if (request.type === 'together' && studentClass !== targetClass) {
        conflicts.push({
          requestId: request.id,
          type: 'together_violated',
          priority: request.priority,
          studentId: request.studentId,
          targetStudentId: request.targetStudentId,
          message: `${request.studentName} should be with ${request.targetStudentName}`
        });
      } else if (request.type === 'not_together' && studentClass === targetClass) {
        conflicts.push({
          requestId: request.id,
          type: 'not_together_violated',
          priority: request.priority,
          studentId: request.studentId,
          targetStudentId: request.targetStudentId,
          message: `${request.studentName} should not be with ${request.targetStudentName}`
        });
      }
    });

    return conflicts;
  }
}

/**
 * Quick helper to run optimization
 */
export const optimizeClassAssignments = async (students, classes, requests, frozenAssignments, settings) => {
  const optimizer = new ClassOptimizer(students, classes, requests, frozenAssignments, settings);
  const assignments = await optimizer.optimize();
  const conflicts = optimizer.detectConflicts(assignments);

  return {
    assignments,
    conflicts,
    statistics: calculateStatistics(students, classes, assignments)
  };
};

/**
 * Calculate statistics for a set of assignments
 */
function calculateStatistics(students, classes, assignments) {
  const classStats = classes.map(cls => ({
    classId: cls.id,
    className: cls.name,
    total: 0,
    male: 0,
    female: 0,
    academicHigh: 0,
    academicMedium: 0,
    academicLow: 0
  }));

  const assignmentMap = {};
  assignments.forEach(a => {
    assignmentMap[a.studentId] = a.classId;
  });

  students.forEach(student => {
    const classId = assignmentMap[student.id];
    const stat = classStats.find(s => s.classId === classId);

    if (stat) {
      stat.total++;
      if (student.gender === 'male') stat.male++;
      if (student.gender === 'female') stat.female++;
      if (student.academicLevel === 'high') stat.academicHigh++;
      if (student.academicLevel === 'medium') stat.academicMedium++;
      if (student.academicLevel === 'low') stat.academicLow++;
    }
  });

  return classStats;
}
