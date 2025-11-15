import { query } from '../config/database.js';

export const School = {
  /**
   * Find school by ID
   */
  async findById(schoolId) {
    const result = await query(
      'SELECT * FROM schools WHERE id = $1',
      [schoolId]
    );
    return result.rows[0];
  },

  /**
   * Find school by name
   */
  async findByName(name) {
    const result = await query(
      'SELECT * FROM schools WHERE name = $1',
      [name]
    );
    return result.rows[0];
  },

  /**
   * Create new school
   */
  async create({ name, settings = {} }) {
    const defaultSettings = {
      academic_streaming_enabled: false,
      default_class_size: 25,
      ...settings
    };

    const result = await query(
      'INSERT INTO schools (name, settings) VALUES ($1, $2) RETURNING *',
      [name, JSON.stringify(defaultSettings)]
    );
    return result.rows[0];
  },

  /**
   * Update school
   */
  async update(schoolId, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (key === 'settings') {
        fields.push(`settings = $${paramCount}`);
        values.push(JSON.stringify(value));
      } else {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
      }
      paramCount++;
    });

    values.push(schoolId);

    const result = await query(
      `UPDATE schools SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0];
  },

  /**
   * Get all schools
   */
  async findAll() {
    const result = await query(
      'SELECT * FROM schools ORDER BY created_at DESC'
    );
    return result.rows;
  },

  /**
   * Delete school
   */
  async delete(schoolId) {
    await query('DELETE FROM schools WHERE id = $1', [schoolId]);
  }
};
