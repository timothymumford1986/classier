import { query } from '../config/database.js';

export const Scenario = {
  /**
   * Find scenario by ID
   */
  async findById(scenarioId) {
    const result = await query(
      'SELECT * FROM scenarios WHERE id = $1',
      [scenarioId]
    );
    return result.rows[0];
  },

  /**
   * Find scenarios by school
   */
  async findBySchool(schoolId) {
    const result = await query(
      'SELECT * FROM scenarios WHERE school_id = $1 ORDER BY created_at DESC',
      [schoolId]
    );
    return result.rows;
  },

  /**
   * Find scenarios by school and grade
   */
  async findBySchoolAndGrade(schoolId, gradeLevel) {
    const result = await query(
      'SELECT * FROM scenarios WHERE school_id = $1 AND grade_level = $2 ORDER BY created_at DESC',
      [schoolId, gradeLevel]
    );
    return result.rows;
  },

  /**
   * Create new scenario
   */
  async create({ schoolId, gradeLevel, name, createdBy }) {
    const result = await query(
      `INSERT INTO scenarios (school_id, grade_level, name, created_by)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [schoolId, gradeLevel, name, createdBy]
    );
    return result.rows[0];
  },

  /**
   * Update scenario
   */
  async update(scenarioId, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      fields.push(`${snakeKey} = $${paramCount}`);
      values.push(value);
      paramCount++;
    });

    values.push(scenarioId);

    const result = await query(
      `UPDATE scenarios SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0];
  },

  /**
   * Delete scenario
   */
  async delete(scenarioId) {
    await query('DELETE FROM scenarios WHERE id = $1', [scenarioId]);
  }
};
