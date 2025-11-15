import { query } from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function seed() {
  console.log('🌱 Seeding database...\n');

  try {
    // Create a test school
    const schoolResult = await query(
      `INSERT INTO schools (name, settings)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING
       RETURNING id`,
      ['Demo Elementary School', JSON.stringify({ academic_streaming_enabled: false, default_class_size: 25 })]
    );

    let schoolId;
    if (schoolResult.rows.length > 0) {
      schoolId = schoolResult.rows[0].id;
      console.log('✅ Created school:', schoolId);
    } else {
      const existing = await query('SELECT id FROM schools WHERE name = $1', ['Demo Elementary School']);
      schoolId = existing.rows[0].id;
      console.log('ℹ️  Using existing school:', schoolId);
    }

    // Create a test user
    const userResult = await query(
      `INSERT INTO users (email, school_id, role, auth_provider, auth_provider_id, name)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      ['teacher@demo.edu', schoolId, 'admin', 'google', 'demo-123', 'Demo Teacher']
    );

    let userId;
    if (userResult.rows.length > 0) {
      userId = userResult.rows[0].id;
      console.log('✅ Created user:', userId);
    } else {
      const existing = await query('SELECT id FROM users WHERE email = $1', ['teacher@demo.edu']);
      userId = existing.rows[0].id;
      console.log('ℹ️  Using existing user:', userId);
    }

    // Create sample students
    const students = [
      { name: 'Emma Johnson', gender: 'female', academic_level: 'high' },
      { name: 'Liam Smith', gender: 'male', academic_level: 'medium' },
      { name: 'Olivia Brown', gender: 'female', academic_level: 'medium' },
      { name: 'Noah Davis', gender: 'male', academic_level: 'high' },
      { name: 'Ava Wilson', gender: 'female', academic_level: 'low' },
      { name: 'Ethan Martinez', gender: 'male', academic_level: 'medium' },
      { name: 'Sophia Anderson', gender: 'female', academic_level: 'high' },
      { name: 'Mason Taylor', gender: 'male', academic_level: 'low' },
      { name: 'Isabella Thomas', gender: 'female', academic_level: 'medium' },
      { name: 'Lucas Garcia', gender: 'male', academic_level: 'high' },
      { name: 'Mia Rodriguez', gender: 'female', academic_level: 'medium' },
      { name: 'Oliver Lee', gender: 'male', academic_level: 'low' },
      { name: 'Charlotte White', gender: 'female', academic_level: 'high' },
      { name: 'James Harris', gender: 'male', academic_level: 'medium' },
      { name: 'Amelia Clark', gender: 'female', academic_level: 'high' },
    ];

    console.log('\n📚 Creating students...');
    const studentIds = [];
    for (const student of students) {
      const result = await query(
        `INSERT INTO students (name, school_id, grade_level, gender, academic_level)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [student.name, schoolId, 'Grade 5', student.gender, student.academic_level]
      );
      studentIds.push(result.rows[0].id);
    }
    console.log(`✅ Created ${studentIds.length} students`);

    // Create a scenario
    const scenarioResult = await query(
      `INSERT INTO scenarios (school_id, grade_level, name, created_by)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [schoolId, 'Grade 5', 'Demo Scenario - Grade 5', userId]
    );
    const scenarioId = scenarioResult.rows[0].id;
    console.log('✅ Created scenario:', scenarioId);

    // Create classes
    const classNames = ['Class A', 'Class B', 'Class C'];
    const classIds = [];
    console.log('\n🏫 Creating classes...');
    for (const className of classNames) {
      const result = await query(
        `INSERT INTO classes (school_id, scenario_id, name, teacher_name, target_size, grade_level)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [schoolId, scenarioId, className, `Teacher ${className.split(' ')[1]}`, 5, 'Grade 5']
      );
      classIds.push(result.rows[0].id);
    }
    console.log(`✅ Created ${classIds.length} classes`);

    // Create some sample placement requests
    console.log('\n📝 Creating placement requests...');
    const requests = [
      { student1: 0, student2: 1, type: 'together', priority: 'hard' }, // Emma & Liam must be together
      { student1: 2, student2: 3, type: 'not_together', priority: 'hard' }, // Olivia & Noah must NOT be together
      { student1: 4, student2: 5, type: 'together', priority: 'soft' }, // Ava & Ethan prefer to be together
      { student1: 6, student2: 7, type: 'not_together', priority: 'soft' }, // Sophia & Mason prefer NOT together
    ];

    for (const req of requests) {
      await query(
        `INSERT INTO placement_requests (school_id, scenario_id, student_id, target_student_id, type, priority, source, original_text, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          schoolId,
          scenarioId,
          studentIds[req.student1],
          studentIds[req.student2],
          req.type,
          req.priority,
          'manual',
          `${students[req.student1].name} ${req.type === 'together' ? 'should be with' : 'should not be with'} ${students[req.student2].name}`,
          userId
        ]
      );
    }
    console.log(`✅ Created ${requests.length} placement requests`);

    console.log('\n🎉 Seed data created successfully!\n');
    console.log('📊 Summary:');
    console.log(`   School: Demo Elementary School`);
    console.log(`   User: teacher@demo.edu (password: use mock login)`);
    console.log(`   Students: ${studentIds.length}`);
    console.log(`   Classes: ${classIds.length}`);
    console.log(`   Requests: ${requests.length}`);
    console.log('\n💡 You can now run the optimization algorithm on this scenario!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
