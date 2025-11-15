import { query } from '../config/database.js';

export const Class = {
  /**
   * Find class by ID
   */
  async findById(classId) {
    const result = await query(
      'SELECT * FROM classes WHERE id = $1',
      [classId]
    );
    return result.rows[0];
  },

  /**
   * Find classes by scenario
   */
  async findByScenario(scenarioId) {
    const result = await query(
      'SELECT * FROM classes WHERE scenario_id = $1 ORDER BY name',
      [scenarioId]
    );
    return result.rows;
  },

  /**
   * Create new class
   */
  async create({ schoolId, scenarioId, name, teacherName, targetSize, gradeLevel }) {
    const result = await query(
      `INSERT INTO classes (school_id, scenario_id, name, teacher_name, target_size, grade_level)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [schoolId, scenarioId, name, teacherName, targetSize, gradeLevel]
    );
    return result.rows[0];
  },

  /**
   * Bulk create classes
   */
  async bulkCreate(classes) {
    const values = [];
    const placeholders = [];

    classes.forEach((cls, index) => {
      const offset = index * 6;
      placeholders.push(
        `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6})`
      );
      values.push(
        cls.schoolId,
        cls.scenarioId,
        cls.name,
        cls.teacherName || null,
        cls.targetSize,
        cls.gradeLevel
      );
    });

    const result = await query(
      `INSERT INTO classes (school_id, scenario_id, name, teacher_name, target_size, grade_level)
       VALUES ${placeholders.join(', ')}
       RETURNING *`,
      values
    );
    return result.rows;
  },

  /**
   * Update class
   */
  async update(classId, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = ['name', 'teacher_name', 'target_size'];

    Object.entries(updates).forEach(([key, value]) => {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (allowedFields.includes(snakeKey)) {
        fields.push(`${snakeKey} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    values.push(classId);

    const result = await query(
      `UPDATE classes SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0];
  },

  /**
   * Delete class
   */
  async delete(classId) {
    await query('DELETE FROM classes WHERE id = $1', [classId]);
  },

  /**
   * Get class with assigned students
   */
  async findWithStudents(classId) {
    const result = await query(
      `SELECT c.*,
        json_agg(
          json_build_object(
            'id', s.id,
            'name', s.name,
            'gender', s.gender,
            'academicLevel', s.academic_level,
            'frozen', ca.frozen,
            'manuallyPlaced', ca.manually_placed
          )
        ) FILTER (WHERE s.id IS NOT NULL) as students
       FROM classes c
       LEFT JOIN class_assignments ca ON ca.class_id = c.id
       LEFT JOIN students s ON s.id = ca.student_id
       WHERE c.id = $1
       GROUP BY c.id`,
      [classId]
    );
    return result.rows[0];
  }
};

export const ClassAssignment = {
  /**
   * Find assignments by scenario
   */
  async findByScenario(scenarioId) {
    const result = await query(
      `SELECT ca.* FROM class_assignments ca
       JOIN classes c ON c.id = ca.class_id
       WHERE c.scenario_id = $1`,
      [scenarioId]
    );
    return result.rows;
  },

  /**
   * Create assignment
   */
  async create({ studentId, classId, frozen = false, manuallyPlaced = false }) {
    const result = await query(
      `INSERT INTO class_assignments (student_id, class_id, frozen, manually_placed)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (student_id, class_id) DO UPDATE
       SET frozen = $3, manually_placed = $4
       RETURNING *`,
      [studentId, classId, frozen, manuallyPlaced]
    );
    return result.rows[0];
  },

  /**
   * Bulk create/update assignments
   */
  async bulkUpsert(assignments) {
    const values = [];
    const placeholders = [];

    assignments.forEach((assignment, index) => {
      const offset = index * 4;
      placeholders.push(
        `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4})`
      );
      values.push(
        assignment.studentId,
        assignment.classId,
        assignment.frozen || false,
        assignment.manuallyPlaced || false
      );
    });

    const result = await query(
      `INSERT INTO class_assignments (student_id, class_id, frozen, manually_placed)
       VALUES ${placeholders.join(', ')}
       ON CONFLICT (student_id, class_id) DO UPDATE
       SET frozen = EXCLUDED.frozen, manually_placed = EXCLUDED.manually_placed
       RETURNING *`,
      values
    );
    return result.rows;
  },

  /**
   * Delete all assignments for a scenario
   */
  async deleteByScenario(scenarioId) {
    await query(
      `DELETE FROM class_assignments WHERE class_id IN
       (SELECT id FROM classes WHERE scenario_id = $1)`,
      [scenarioId]
    );
  },

  /**
   * Update assignment (move student, toggle freeze, etc.)
   */
  async update(studentId, classId, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      fields.push(`${snakeKey} = $${paramCount}`);
      values.push(value);
      paramCount++;
    });

    values.push(studentId, classId);

    const result = await query(
      `UPDATE class_assignments
       SET ${fields.join(', ')}
       WHERE student_id = $${paramCount} AND class_id = $${paramCount + 1}
       RETURNING *`,
      values
    );
    return result.rows[0];
  }
};
