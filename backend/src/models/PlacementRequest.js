import { query } from '../config/database.js';

export const PlacementRequest = {
  /**
   * Find request by ID
   */
  async findById(requestId) {
    const result = await query(
      'SELECT * FROM placement_requests WHERE id = $1',
      [requestId]
    );
    return result.rows[0];
  },

  /**
   * Find requests by scenario
   */
  async findByScenario(scenarioId) {
    const result = await query(
      `SELECT pr.*,
        s1.name as student_name,
        s2.name as target_student_name
       FROM placement_requests pr
       JOIN students s1 ON s1.id = pr.student_id
       JOIN students s2 ON s2.id = pr.target_student_id
       WHERE pr.scenario_id = $1
       ORDER BY pr.priority DESC, pr.created_at`,
      [scenarioId]
    );
    return result.rows;
  },

  /**
   * Create new request
   */
  async create({
    schoolId,
    scenarioId,
    studentId,
    targetStudentId,
    type,
    priority,
    source,
    originalText,
    createdBy
  }) {
    const result = await query(
      `INSERT INTO placement_requests
       (school_id, scenario_id, student_id, target_student_id, type, priority, source, original_text, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [schoolId, scenarioId, studentId, targetStudentId, type, priority, source, originalText, createdBy]
    );
    return result.rows[0];
  },

  /**
   * Bulk create requests
   */
  async bulkCreate(requests) {
    if (requests.length === 0) return [];

    const values = [];
    const placeholders = [];

    requests.forEach((request, index) => {
      const offset = index * 9;
      placeholders.push(
        `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9})`
      );
      values.push(
        request.schoolId,
        request.scenarioId,
        request.studentId,
        request.targetStudentId,
        request.type,
        request.priority,
        request.source,
        request.originalText || null,
        request.createdBy || null
      );
    });

    const result = await query(
      `INSERT INTO placement_requests
       (school_id, scenario_id, student_id, target_student_id, type, priority, source, original_text, created_by)
       VALUES ${placeholders.join(', ')}
       RETURNING *`,
      values
    );
    return result.rows;
  },

  /**
   * Update request
   */
  async update(requestId, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = ['type', 'priority', 'original_text'];

    Object.entries(updates).forEach(([key, value]) => {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (allowedFields.includes(snakeKey)) {
        fields.push(`${snakeKey} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    values.push(requestId);

    const result = await query(
      `UPDATE placement_requests SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0];
  },

  /**
   * Delete request
   */
  async delete(requestId) {
    await query('DELETE FROM placement_requests WHERE id = $1', [requestId]);
  },

  /**
   * Delete all requests for a scenario
   */
  async deleteByScenario(scenarioId) {
    await query('DELETE FROM placement_requests WHERE scenario_id = $1', [scenarioId]);
  },

  /**
   * Detect conflicting requests
   */
  async findConflicts(scenarioId) {
    // Find pairs of requests that contradict each other
    const result = await query(
      `SELECT
        pr1.id as request1_id,
        pr1.type as request1_type,
        pr1.priority as request1_priority,
        s1.name as student1_name,
        s2.name as student2_name,
        pr2.id as request2_id,
        pr2.type as request2_type,
        pr2.priority as request2_priority
       FROM placement_requests pr1
       JOIN placement_requests pr2 ON
         pr1.student_id = pr2.target_student_id AND
         pr1.target_student_id = pr2.student_id AND
         pr1.id < pr2.id
       JOIN students s1 ON s1.id = pr1.student_id
       JOIN students s2 ON s2.id = pr1.target_student_id
       WHERE pr1.scenario_id = $1 AND pr1.type != pr2.type`,
      [scenarioId]
    );

    return result.rows;
  }
};
