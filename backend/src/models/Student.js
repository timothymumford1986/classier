import { query } from '../config/database.js';

export const Student = {
  /**
   * Find student by ID
   */
  async findById(studentId) {
    const result = await query(
      'SELECT * FROM students WHERE id = $1',
      [studentId]
    );
    return result.rows[0];
  },

  /**
   * Find students by school and grade
   */
  async findBySchoolAndGrade(schoolId, gradeLevel) {
    const result = await query(
      'SELECT * FROM students WHERE school_id = $1 AND grade_level = $2 ORDER BY name',
      [schoolId, gradeLevel]
    );
    return result.rows;
  },

  /**
   * Find all students in a school
   */
  async findBySchool(schoolId) {
    const result = await query(
      'SELECT * FROM students WHERE school_id = $1 ORDER BY grade_level, name',
      [schoolId]
    );
    return result.rows;
  },

  /**
   * Create new student
   */
  async create({ name, schoolId, gradeLevel, gender, academicLevel, behavioralNotes, studentId }) {
    const result = await query(
      `INSERT INTO students (name, school_id, grade_level, gender, academic_level, behavioral_notes, student_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, schoolId, gradeLevel, gender, academicLevel, behavioralNotes, studentId]
    );
    return result.rows[0];
  },

  /**
   * Bulk create students
   */
  async bulkCreate(students) {
    const values = [];
    const placeholders = [];

    students.forEach((student, index) => {
      const offset = index * 7;
      placeholders.push(
        `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7})`
      );
      values.push(
        student.name,
        student.schoolId,
        student.gradeLevel,
        student.gender || null,
        student.academicLevel || null,
        student.behavioralNotes || null,
        student.studentId || null
      );
    });

    const result = await query(
      `INSERT INTO students (name, school_id, grade_level, gender, academic_level, behavioral_notes, student_id)
       VALUES ${placeholders.join(', ')}
       RETURNING *`,
      values
    );
    return result.rows;
  },

  /**
   * Update student
   */
  async update(studentId, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = ['name', 'gender', 'academic_level', 'behavioral_notes', 'student_id', 'grade_level'];

    Object.entries(updates).forEach(([key, value]) => {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (allowedFields.includes(snakeKey)) {
        fields.push(`${snakeKey} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    values.push(studentId);

    const result = await query(
      `UPDATE students SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    return result.rows[0];
  },

  /**
   * Delete student
   */
  async delete(studentId) {
    await query('DELETE FROM students WHERE id = $1', [studentId]);
  },

  /**
   * Delete multiple students
   */
  async bulkDelete(studentIds) {
    await query(
      'DELETE FROM students WHERE id = ANY($1)',
      [studentIds]
    );
  }
};
