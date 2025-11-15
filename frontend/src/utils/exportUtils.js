import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Export class assignments to PDF
 */
export const exportToPDF = (scenario, classes, students, assignments) => {
  const doc = new jsPDF();

  // Title
  doc.setFontSize(20);
  doc.text(scenario.name, 14, 22);

  doc.setFontSize(12);
  doc.text(`Grade: ${scenario.grade_level}`, 14, 30);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 36);

  let yOffset = 50;

  // For each class
  classes.forEach((cls, index) => {
    // Get students in this class
    const classStudents = students.filter(student => {
      const assignment = assignments.find(a => a.student_id === student.id);
      return assignment && assignment.class_id === cls.id;
    });

    // Add class heading
    doc.setFontSize(14);
    doc.text(`${cls.name}${cls.teacher_name ? ` - ${cls.teacher_name}` : ''}`, 14, yOffset);
    yOffset += 8;

    // Add statistics
    const genderStats = classStudents.reduce((acc, s) => {
      if (s.gender === 'male') acc.male++;
      if (s.gender === 'female') acc.female++;
      return acc;
    }, { male: 0, female: 0 });

    doc.setFontSize(10);
    doc.text(`Total: ${classStudents.length} | Male: ${genderStats.male} | Female: ${genderStats.female}`, 14, yOffset);
    yOffset += 10;

    // Add student table
    const tableData = classStudents.map((student, idx) => [
      idx + 1,
      student.name,
      student.gender || '-',
      student.academic_level || '-'
    ]);

    doc.autoTable({
      startY: yOffset,
      head: [['#', 'Name', 'Gender', 'Level']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [66, 139, 202] },
      margin: { left: 14 }
    });

    yOffset = doc.lastAutoTable.finalY + 15;

    // Add new page if needed
    if (index < classes.length - 1 && yOffset > 250) {
      doc.addPage();
      yOffset = 20;
    }
  });

  // Save PDF
  doc.save(`${scenario.name}.pdf`);
};

/**
 * Export class assignments to CSV
 */
export const exportToCSV = (scenario, classes, students, assignments) => {
  const rows = [['Class', 'Teacher', 'Student Name', 'Gender', 'Academic Level']];

  classes.forEach(cls => {
    const classStudents = students.filter(student => {
      const assignment = assignments.find(a => a.student_id === student.id);
      return assignment && assignment.class_id === cls.id;
    });

    classStudents.forEach(student => {
      rows.push([
        cls.name,
        cls.teacher_name || '',
        student.name,
        student.gender || '',
        student.academic_level || ''
      ]);
    });
  });

  const csvContent = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${scenario.name}.csv`;
  link.click();
};
