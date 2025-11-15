import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useScenarioStore } from '../stores/scenarioStore';
import toast from 'react-hot-toast';

const StudentCard = ({ student, index, isFrozen, matchesSearch }) => {
  return (
    <Draggable
      draggableId={student.id}
      index={index}
      isDragDisabled={isFrozen}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`
            p-3 mb-2 bg-white rounded-lg shadow-sm border
            ${snapshot.isDragging ? 'border-blue-500 shadow-lg' : 'border-gray-200'}
            ${isFrozen ? 'border-l-4 border-l-purple-500 cursor-not-allowed' : 'cursor-move'}
            ${!matchesSearch ? 'opacity-30' : ''}
            hover:shadow-md transition-all
          `}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="font-medium text-gray-900">{student.name}</div>
              {student.gender && (
                <div className="text-xs text-gray-500 mt-1">
                  {student.gender === 'male' ? '♂' : '♀'} {student.gender}
                </div>
              )}
              {student.academic_level && (
                <div className="text-xs text-gray-500">
                  Level: {student.academic_level}
                </div>
              )}
            </div>
            {isFrozen && (
              <div className="text-purple-600 text-xs font-medium">
                🔒 Frozen
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

const ClassColumn = ({ classData, students, assignments, searchTerm }) => {
  const genderBalance = students.reduce(
    (acc, s) => {
      if (s.gender === 'male') acc.male++;
      if (s.gender === 'female') acc.female++;
      return acc;
    },
    { male: 0, female: 0 }
  );

  // Filter students based on search
  const displayStudents = searchTerm
    ? students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : students;

  return (
    <div className="flex-1 min-w-[280px] bg-gray-50 rounded-lg p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{classData.name}</h3>
        {classData.teacher_name && (
          <p className="text-sm text-gray-600">{classData.teacher_name}</p>
        )}
        <div className="flex gap-4 mt-2 text-sm text-gray-600">
          <span>Total: {students.length}</span>
          <span>♂ {genderBalance.male}</span>
          <span>♀ {genderBalance.female}</span>
        </div>
        {searchTerm && displayStudents.length !== students.length && (
          <div className="text-xs text-blue-600 mt-1">
            Showing {displayStudents.length} of {students.length}
          </div>
        )}
      </div>

      <Droppable droppableId={classData.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`
              min-h-[400px] p-2 rounded-md transition-colors
              ${snapshot.isDraggingOver ? 'bg-blue-50 border-2 border-blue-300' : 'bg-white border-2 border-gray-200'}
            `}
          >
            {students.map((student, index) => {
              const assignment = assignments.find(a => a.student_id === student.id);
              const isFrozen = assignment?.frozen || false;
              const matchesSearch = !searchTerm || student.name.toLowerCase().includes(searchTerm.toLowerCase());

              return (
                <StudentCard
                  key={student.id}
                  student={student}
                  index={index}
                  isFrozen={isFrozen}
                  matchesSearch={matchesSearch}
                />
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export const KanbanBoard = ({ scenarioId, searchTerm = '' }) => {
  const { classes, assignments, getStudentsByClass, updateAssignment, calculateConflicts } = useScenarioStore();

  const handleDragStart = (start) => {
    const studentId = start.draggableId;
    const assignment = assignments.find(a => a.student_id === studentId);

    if (assignment?.frozen) {
      toast.error('This student is frozen and cannot be moved');
      return false;
    }
  };

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    // Dropped outside a droppable area
    if (!destination) return;

    // Dropped in the same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Check if frozen
    const assignment = assignments.find(a => a.student_id === draggableId);
    if (assignment?.frozen) {
      toast.error('Cannot move frozen student');
      return;
    }

    // Update assignment
    try {
      await updateAssignment(scenarioId, draggableId, destination.droppableId, {
        manuallyPlaced: true
      });

      // Calculate conflicts for this student
      calculateConflicts(draggableId);
    } catch (error) {
      console.error('Drag and drop error:', error);
    }
  };

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {classes.map((classData) => {
          const students = getStudentsByClass(classData.id);
          return (
            <ClassColumn
              key={classData.id}
              classData={classData}
              students={students}
              assignments={assignments}
              searchTerm={searchTerm}
            />
          );
        })}
      </div>
    </DragDropContext>
  );
};
