import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useScenarioStore } from '../stores/scenarioStore';

const StudentCard = ({ student, index }) => {
  return (
    <Draggable draggableId={student.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`
            p-3 mb-2 bg-white rounded-lg shadow-sm border
            ${snapshot.isDragging ? 'border-blue-500 shadow-lg' : 'border-gray-200'}
            hover:shadow-md transition-shadow cursor-move
          `}
        >
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
      )}
    </Draggable>
  );
};

const ClassColumn = ({ classData, students }) => {
  const genderBalance = students.reduce(
    (acc, s) => {
      if (s.gender === 'male') acc.male++;
      if (s.gender === 'female') acc.female++;
      return acc;
    },
    { male: 0, female: 0 }
  );

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
            {students.map((student, index) => (
              <StudentCard key={student.id} student={student} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export const KanbanBoard = ({ scenarioId }) => {
  const { classes, getStudentsByClass, updateAssignment, calculateConflicts } = useScenarioStore();

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
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {classes.map((classData) => {
          const students = getStudentsByClass(classData.id);
          return (
            <ClassColumn
              key={classData.id}
              classData={classData}
              students={students}
            />
          );
        })}
      </div>
    </DragDropContext>
  );
};
