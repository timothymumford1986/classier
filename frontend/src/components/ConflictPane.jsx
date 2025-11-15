import { useScenarioStore } from '../stores/scenarioStore';

export const ConflictPane = () => {
  const { conflicts } = useScenarioStore();

  if (conflicts.length === 0) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-green-50 border-t-2 border-green-200 p-4">
        <div className="container mx-auto flex items-center gap-2">
          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-green-800 font-medium">No conflicts - All requests satisfied!</span>
        </div>
      </div>
    );
  }

  const hardConflicts = conflicts.filter(c => c.priority === 'hard');
  const softConflicts = conflicts.filter(c => c.priority === 'soft');

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-lg max-h-[300px] overflow-y-auto">
      <div className="container mx-auto p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Conflicts Detected ({conflicts.length})
        </h3>

        <div className="space-y-3">
          {hardConflicts.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-1">
                <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                Hard Constraints Violated ({hardConflicts.length})
              </h4>
              <div className="space-y-1">
                {hardConflicts.map((conflict, index) => (
                  <div
                    key={index}
                    className="text-sm bg-red-50 border border-red-200 rounded p-2 text-red-800"
                  >
                    {conflict.message}
                  </div>
                ))}
              </div>
            </div>
          )}

          {softConflicts.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-yellow-700 mb-2 flex items-center gap-1">
                <span className="w-2 h-2 bg-yellow-600 rounded-full"></span>
                Soft Constraints Unmet ({softConflicts.length})
              </h4>
              <div className="space-y-1">
                {softConflicts.map((conflict, index) => (
                  <div
                    key={index}
                    className="text-sm bg-yellow-50 border border-yellow-200 rounded p-2 text-yellow-800"
                  >
                    {conflict.message}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
