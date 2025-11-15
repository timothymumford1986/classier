import { Scenario } from '../models/Scenario.js';
import { Student } from '../models/Student.js';
import { Class, ClassAssignment } from '../models/Class.js';
import { PlacementRequest } from '../models/PlacementRequest.js';
import { parseStudentList, parsePlacementRequests } from '../services/nlpService.js';
import { optimizeClassAssignments } from '../services/optimizationService.js';
import { School } from '../models/School.js';
import { query } from '../config/database.js';

/**
 * Get all scenarios for a school
 */
export const getScenarios = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const scenarios = await Scenario.findBySchool(schoolId);
    res.json(scenarios);
  } catch (error) {
    console.error('Get scenarios error:', error);
    res.status(500).json({ error: 'Failed to get scenarios' });
  }
};

/**
 * Get single scenario with all details
 */
export const getScenario = async (req, res) => {
  try {
    const { scenarioId } = req.params;

    const scenario = await Scenario.findById(scenarioId);
    if (!scenario) {
      return res.status(404).json({ error: 'Scenario not found' });
    }

    const classes = await Class.findByScenario(scenarioId);
    const students = await Student.findBySchoolAndGrade(scenario.school_id, scenario.grade_level);
    const requests = await PlacementRequest.findByScenario(scenarioId);
    const assignments = await ClassAssignment.findByScenario(scenarioId);

    res.json({
      ...scenario,
      classes,
      students,
      requests,
      assignments
    });
  } catch (error) {
    console.error('Get scenario error:', error);
    res.status(500).json({ error: 'Failed to get scenario' });
  }
};

/**
 * Create new scenario
 */
export const createScenario = async (req, res) => {
  try {
    const { schoolId, gradeLevel, name, numClasses, classNames, teacherNames, targetSize } = req.body;

    // Create scenario
    const scenario = await Scenario.create({
      schoolId,
      gradeLevel,
      name: name || `${gradeLevel} - ${new Date().toISOString().split('T')[0]}`,
      createdBy: req.user.userId
    });

    // Create classes
    const classesToCreate = [];
    for (let i = 0; i < numClasses; i++) {
      classesToCreate.push({
        schoolId,
        scenarioId: scenario.id,
        name: classNames?.[i] || `Class ${String.fromCharCode(65 + i)}`,
        teacherName: teacherNames?.[i] || null,
        targetSize: targetSize || 25,
        gradeLevel
      });
    }

    const classes = await Class.bulkCreate(classesToCreate);

    res.json({
      ...scenario,
      classes
    });
  } catch (error) {
    console.error('Create scenario error:', error);
    res.status(500).json({ error: 'Failed to create scenario' });
  }
};

/**
 * Parse and import students from text
 */
export const importStudents = async (req, res) => {
  try {
    const { scenarioId } = req.params;
    const { text } = req.body;

    const scenario = await Scenario.findById(scenarioId);
    if (!scenario) {
      return res.status(404).json({ error: 'Scenario not found' });
    }

    // Parse students using NLP
    const parsedStudents = await parseStudentList(text, scenario.grade_level);

    // Add school ID to each student
    const studentsToCreate = parsedStudents.map(s => ({
      ...s,
      schoolId: scenario.school_id
    }));

    // Create students
    const students = await Student.bulkCreate(studentsToCreate);

    res.json({
      students,
      count: students.length
    });
  } catch (error) {
    console.error('Import students error:', error);
    res.status(500).json({ error: 'Failed to import students: ' + error.message });
  }
};

/**
 * Parse and import placement requests from text
 */
export const importRequests = async (req, res) => {
  try {
    const { scenarioId } = req.params;
    const { text } = req.body;

    const scenario = await Scenario.findById(scenarioId);
    if (!scenario) {
      return res.status(404).json({ error: 'Scenario not found' });
    }

    // Get students for matching
    const students = await Student.findBySchoolAndGrade(scenario.school_id, scenario.grade_level);

    // Parse requests using NLP
    const parsedRequests = await parsePlacementRequests(text, students);

    // Filter out unmatched requests and add metadata
    const requestsToCreate = parsedRequests
      .filter(r => r.matched)
      .map(r => ({
        schoolId: scenario.school_id,
        scenarioId: scenario.id,
        studentId: r.studentId,
        targetStudentId: r.targetStudentId,
        type: r.type,
        priority: r.priority,
        source: 'text_paste',
        originalText: r.originalText,
        createdBy: req.user.userId
      }));

    // Create requests
    const requests = await PlacementRequest.bulkCreate(requestsToCreate);

    // Also return unmatched for user review
    const unmatched = parsedRequests.filter(r => !r.matched);

    res.json({
      requests,
      unmatched,
      matchedCount: requests.length,
      unmatchedCount: unmatched.length
    });
  } catch (error) {
    console.error('Import requests error:', error);
    res.status(500).json({ error: 'Failed to import requests: ' + error.message });
  }
};

/**
 * Run optimization algorithm
 */
export const optimizeScenario = async (req, res) => {
  try {
    const { scenarioId } = req.params;

    const scenario = await Scenario.findById(scenarioId);
    if (!scenario) {
      return res.status(404).json({ error: 'Scenario not found' });
    }

    // Get all data needed for optimization
    const students = await Student.findBySchoolAndGrade(scenario.school_id, scenario.grade_level);
    const classes = await Class.findByScenario(scenarioId);
    const requests = await PlacementRequest.findByScenario(scenarioId);
    const currentAssignments = await ClassAssignment.findByScenario(scenarioId);

    // Get frozen assignments
    const frozenAssignments = currentAssignments.filter(a => a.frozen);

    // Get school settings
    const school = await School.findById(scenario.school_id);

    // Run optimization
    const result = await optimizeClassAssignments(
      students,
      classes,
      requests,
      frozenAssignments,
      school.settings
    );

    // Save new assignments
    await ClassAssignment.deleteByScenario(scenarioId);
    await ClassAssignment.bulkUpsert(result.assignments);

    // Update scenario last_optimized_at
    await Scenario.update(scenarioId, { lastOptimizedAt: new Date() });

    res.json({
      assignments: result.assignments,
      conflicts: result.conflicts,
      statistics: result.statistics,
      optimizedAt: new Date()
    });
  } catch (error) {
    console.error('Optimize scenario error:', error);
    res.status(500).json({ error: 'Failed to optimize scenario: ' + error.message });
  }
};

/**
 * Update class assignment (drag & drop)
 */
export const updateAssignment = async (req, res) => {
  try {
    const { scenarioId } = req.params;
    const { studentId, classId, frozen, manuallyPlaced } = req.body;

    // Delete old assignment for this student
    await query(
      `DELETE FROM class_assignments WHERE student_id = $1 AND class_id IN
       (SELECT id FROM classes WHERE scenario_id = $2)`,
      [studentId, scenarioId]
    );

    // Create new assignment
    const assignment = await ClassAssignment.create({
      studentId,
      classId,
      frozen: frozen || false,
      manuallyPlaced: manuallyPlaced !== undefined ? manuallyPlaced : true
    });

    res.json(assignment);
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ error: 'Failed to update assignment' });
  }
};

/**
 * Delete scenario
 */
export const deleteScenario = async (req, res) => {
  try {
    const { scenarioId } = req.params;
    await Scenario.delete(scenarioId);
    res.json({ message: 'Scenario deleted' });
  } catch (error) {
    console.error('Delete scenario error:', error);
    res.status(500).json({ error: 'Failed to delete scenario' });
  }
};
