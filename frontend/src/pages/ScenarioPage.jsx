import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useScenarioStore } from '../stores/scenarioStore';
import { KanbanBoard } from '../components/KanbanBoard';
import { ConflictPane } from '../components/ConflictPane';
import toast from 'react-hot-toast';

export const ScenarioPage = () => {
  const { scenarioId } = useParams();
  const {
    currentScenario,
    loading,
    fetchScenario,
    importStudents,
    importRequests,
    optimizeScenario
  } = useScenarioStore();

  const [showStudentImport, setShowStudentImport] = useState(false);
  const [showRequestImport, setShowRequestImport] = useState(false);
  const [studentText, setStudentText] = useState('');
  const [requestText, setRequestText] = useState('');

  useEffect(() => {
    if (scenarioId) {
      fetchScenario(scenarioId);
    }
  }, [scenarioId]);

  const handleStudentImport = async () => {
    try {
      await importStudents(scenarioId, studentText);
      setStudentText('');
      setShowStudentImport(false);
      fetchScenario(scenarioId); // Refresh
    } catch (error) {
      // Error already handled by store
    }
  };

  const handleRequestImport = async () => {
    try {
      await importRequests(scenarioId, requestText);
      setRequestText('');
      setShowRequestImport(false);
      fetchScenario(scenarioId); // Refresh
    } catch (error) {
      // Error already handled by store
    }
  };

  const handleOptimize = async () => {
    try {
      await optimizeScenario(scenarioId);
      fetchScenario(scenarioId); // Refresh to show new assignments
    } catch (error) {
      // Error already handled by store
    }
  };

  if (loading && !currentScenario) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading scenario...</p>
        </div>
      </div>
    );
  }

  if (!currentScenario) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Scenario not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-[320px]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{currentScenario.name}</h1>
              <p className="text-sm text-gray-600">Grade: {currentScenario.grade_level}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowStudentImport(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Import Students
              </button>
              <button
                onClick={() => setShowRequestImport(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Import Requests
              </button>
              <button
                onClick={handleOptimize}
                disabled={loading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400"
              >
                {loading ? 'Optimizing...' : 'Optimize Classes'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <KanbanBoard scenarioId={scenarioId} />
      </div>

      {/* Student Import Modal */}
      {showStudentImport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Import Students</h2>
            <p className="text-sm text-gray-600 mb-4">
              Paste your student list in any format. Our AI will extract the names and details.
            </p>
            <textarea
              value={studentText}
              onChange={(e) => setStudentText(e.target.value)}
              placeholder="Example:
John Smith (male, ID: 12345)
Jane Doe - female
Robert Johnson
..."
              className="w-full h-64 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleStudentImport}
                disabled={!studentText.trim() || loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                {loading ? 'Importing...' : 'Import'}
              </button>
              <button
                onClick={() => setShowStudentImport(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Import Modal */}
      {showRequestImport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Import Placement Requests</h2>
            <p className="text-sm text-gray-600 mb-4">
              Paste text from parent emails or communications. Our AI will extract the placement requests.
            </p>
            <textarea
              value={requestText}
              onChange={(e) => setRequestText(e.target.value)}
              placeholder="Example:
My kid, Leo, shouldn't be with Gary
Please keep Sarah and Emma together
John must not be in the same class as Mike
..."
              className="w-full h-64 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleRequestImport}
                disabled={!requestText.trim() || loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
              >
                {loading ? 'Importing...' : 'Import'}
              </button>
              <button
                onClick={() => setShowRequestImport(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Conflict Pane */}
      <ConflictPane />
    </div>
  );
};
