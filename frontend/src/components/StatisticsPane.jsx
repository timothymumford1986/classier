import { useScenarioStore } from '../stores/scenarioStore';

export const StatisticsPane = () => {
  const { classes, students, assignments, requests } = useScenarioStore();

  // Calculate statistics
  const stats = classes.map(cls => {
    const classStudents = students.filter(student => {
      const assignment = assignments.find(a => a.student_id === student.id);
      return assignment && assignment.class_id === cls.id;
    });

    const genderStats = classStudents.reduce(
      (acc, s) => {
        if (s.gender === 'male') acc.male++;
        if (s.gender === 'female') acc.female++;
        acc.total++;
        return acc;
      },
      { male: 0, female: 0, total: 0 }
    );

    const academicStats = classStudents.reduce(
      (acc, s) => {
        if (s.academic_level === 'high') acc.high++;
        if (s.academic_level === 'medium') acc.medium++;
        if (s.academic_level === 'low') acc.low++;
        return acc;
      },
      { high: 0, medium: 0, low: 0 }
    );

    return {
      classId: cls.id,
      className: cls.name,
      teacherName: cls.teacher_name,
      targetSize: cls.target_size,
      ...genderStats,
      ...academicStats
    };
  });

  const totalStats = {
    totalStudents: students.length,
    totalAssigned: assignments.length,
    totalUnassigned: students.length - assignments.length,
    totalRequests: requests.length,
    hardRequests: requests.filter(r => r.priority === 'hard').length,
    softRequests: requests.filter(r => r.priority === 'soft').length
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h2>

        {/* Overall Stats */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Overview</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Students:</span>
              <span className="font-medium">{totalStats.totalStudents}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Assigned:</span>
              <span className="font-medium text-green-600">{totalStats.totalAssigned}</span>
            </div>
            {totalStats.totalUnassigned > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Unassigned:</span>
                <span className="font-medium text-red-600">{totalStats.totalUnassigned}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t">
              <span className="text-gray-600">Total Requests:</span>
              <span className="font-medium">{totalStats.totalRequests}</span>
            </div>
            <div className="flex justify-between pl-4">
              <span className="text-gray-600">Hard:</span>
              <span className="font-medium text-red-600">{totalStats.hardRequests}</span>
            </div>
            <div className="flex justify-between pl-4">
              <span className="text-gray-600">Soft:</span>
              <span className="font-medium text-yellow-600">{totalStats.softRequests}</span>
            </div>
          </div>
        </div>

        {/* Class-by-Class Stats */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Class Breakdown</h3>
          <div className="space-y-4">
            {stats.map(stat => (
              <div key={stat.classId} className="border border-gray-200 rounded-lg p-3">
                <div className="font-medium text-gray-900 mb-1">{stat.className}</div>
                {stat.teacherName && (
                  <div className="text-xs text-gray-600 mb-2">{stat.teacherName}</div>
                )}

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Size:</span>
                    <span className={`font-medium ${
                      stat.total === stat.targetSize ? 'text-green-600' :
                      stat.total < stat.targetSize ? 'text-orange-600' :
                      'text-red-600'
                    }`}>
                      {stat.total} / {stat.targetSize}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Gender:</span>
                    <span className="font-medium">
                      ♂ {stat.male} | ♀ {stat.female}
                    </span>
                  </div>

                  {(stat.high + stat.medium + stat.low) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Academic:</span>
                      <span className="font-medium text-xs">
                        H:{stat.high} M:{stat.medium} L:{stat.low}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
