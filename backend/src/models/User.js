import { query } from '../config/database.js';

export const User = {
  /**
   * Find user by ID
   */
  async findById(userId) {
    const result = await query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );
    return result.rows[0];
  },

  /**
   * Find user by email
   */
  async findByEmail(email) {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  },

  /**
   * Find user by OAuth provider
   */
  async findByOAuth(provider, providerId) {
    const result = await query(
      'SELECT * FROM users WHERE auth_provider = $1 AND auth_provider_id = $2',
      [provider, providerId]
    );
    return result.rows[0];
  },

  /**
   * Create new user
   */
  async create({ email, schoolId, role, authProvider, authProviderId, name }) {
    const result = await query(
      `INSERT INTO users (email, school_id, role, auth_provider, auth_provider_id, name)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [email, schoolId, role, authProvider, authProviderId, name]
    );
    return result.rows[0];
  },

  /**
   * Update user
   */
  async update(userId, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      fields.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    });

    values.push(userId);

    const result = await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0];
  },

  /**
   * Get all users in a school
   */
  async findBySchool(schoolId) {
    const result = await query(
      'SELECT id, email, role, name, created_at FROM users WHERE school_id = $1 ORDER BY created_at DESC',
      [schoolId]
    );
    return result.rows;
  },

  /**
   * Delete user
   */
  async delete(userId) {
    await query('DELETE FROM users WHERE id = $1', [userId]);
  }
};
