import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useScenarioStore } from '../stores/scenarioStore';
import { KanbanBoard } from '../components/KanbanBoard';
import { ConflictPane } from '../components/ConflictPane';
import { StatisticsPane } from '../components/StatisticsPane';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { exportToPDF, exportToCSV } from '../utils/exportUtils';
import toast from 'react-hot-toast';

export const ScenarioPage = () => {
  const { scenarioId } = useParams();
  const navigate = useNavigate();

  const {
    currentScenario,
    students,
    classes,
    assignments,
    loading,
    canUndo,
    canRedo,
    fetchScenario,
    importStudents,
    importRequests,
    optimizeScenario,
    undo,
    redo,
    saveToHistory
  } = useScenarioStore();

  const [showStudentImport, setShowStudentImport] = useState(false);
  const [showRequestImport, setShowRequestImport] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [studentText, setStudentText] = useState('');
  const [requestText, setRequestText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showStats, setShowStats] = useState(true);

  useEffect(() => {
    if (scenarioId) {
      fetchScenario(scenarioId);
    }
  }, [scenarioId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + Z = Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) undo();
      }

      // Ctrl/Cmd + Shift + Z = Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        if (canRedo) redo();
      }

      // Ctrl/Cmd + K = Focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('student-search')?.focus();
      }

      // Ctrl/Cmd + O = Optimize
      if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault();
        handleOptimize();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo]);

  const handleStudentImport = async () => {
    try {
      await importStudents(scenarioId, studentText);
      setStudentText('');
      setShowStudentImport(false);
      fetchScenario(scenarioId);
    } catch (error) {
      // Error handled by store
    }
  };

  const handleRequestImport = async () => {
    try {
      await importRequests(scenarioId, requestText);
      setRequestText('');
      setShowRequestImport(false);
      fetchScenario(scenarioId);
    } catch (error) {
      // Error handled by store
    }
  };

  const handleOptimize = async () => {
    try {
      // Save state before optimization
      saveToHistory();

      toast.loading('Running optimization algorithm... This is purely local math, no AI!', {
        duration: 2000
      });

      await optimizeScenario(scenarioId);
      fetchScenario(scenarioId);
    } catch (error) {
      // Error handled by store
    }
  };

  const handleExportPDF = () => {
    exportToPDF(currentScenario, classes, students, assignments);
    toast.success('PDF exported!');
  };

  const handleExportCSV = () => {
    exportToCSV(currentScenario, classes, students, assignments);
    toast.success('CSV exported!');
  };

  const handleDelete = async () => {
    try {
      // API call would go here
      toast.success('Scenario deleted');
      navigate('/');
    } catch (error) {
      toast.error('Failed to delete scenario');
    }
  };

  const handleDuplicate = async () => {
    try {
      // API call to duplicate scenario
      toast.success('Scenario duplicated');
      // Refresh list
    } catch (error) {
      toast.error('Failed to duplicate scenario');
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
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-20">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{currentScenario.name}</h1>
                <p className="text-sm text-gray-600">Grade: {currentScenario.grade_level}</p>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              {/* Undo/Redo */}
              <button
                onClick={undo}
                disabled={!canUndo}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                title="Undo (Ctrl+Z)"
              >
                ↶ Undo
              </button>
              <button
                onClick={redo}
                disabled={!canRedo}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                title="Redo (Ctrl+Shift+Z)"
              >
                ↷ Redo
              </button>

              {/* Actions */}
              <button
                onClick={() => setShowStudentImport(true)}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Import Students
              </button>
              <button
                onClick={() => setShowRequestImport(true)}
                className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                Import Requests
              </button>
              <button
                onClick={handleOptimize}
                disabled={loading}
                className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 text-sm"
                title="Optimize (Ctrl+O)"
              >
                {loading ? 'Optimizing...' : '⚡ Optimize'}
              </button>

              {/* Export */}
              <div className="relative group">
                <button className="px-3 py-1.5 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm">
                  Export ▾
                </button>
                <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border hidden group-hover:block">
                  <button
                    onClick={handleExportPDF}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                  >
                    📄 PDF
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                  >
                    📊 CSV
                  </button>
                </div>
              </div>

              {/* More Actions */}
              <div className="relative group">
                <button className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm">
                  ⋯
                </button>
                <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border hidden group-hover:block">
                  <button
                    onClick={handleDuplicate}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                  >
                    📋 Duplicate
                  </button>
                  <button
                    onClick={() => setShowStats(!showStats)}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                  >
                    📊 {showStats ? 'Hide' : 'Show'} Stats
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 text-sm"
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2">
            <input
              id="student-search"
              type="text"
              placeholder="Search students... (Ctrl+K)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 max-w-md px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Statistics Pane */}
        {showStats && <StatisticsPane />}

        {/* Kanban Board */}
        <div className="flex-1 overflow-x-auto p-6">
          <KanbanBoard scenarioId={scenarioId} searchTerm={searchTerm} />
        </div>
      </div>

      {/* Student Import Modal */}
      {showStudentImport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Import Students</h2>
            <p className="text-sm text-gray-600 mb-4">
              <strong>Note:</strong> AI (Google Gemini) is only used to parse this text into structured data.
              The optimization itself is pure local mathematics!
            </p>
            <textarea
              value={studentText}
              onChange={(e) => setStudentText(e.target.value)}
              placeholder="Paste student list in any format..."
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
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Import Placement Requests</h2>
            <p className="text-sm text-gray-600 mb-4">
              <strong>Note:</strong> AI (Google Gemini) is only used to extract requests from text.
              The optimization uses pure mathematical algorithms!
            </p>
            <textarea
              value={requestText}
              onChange={(e) => setRequestText(e.target.value)}
              placeholder="Paste parent emails/requests..."
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

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Scenario"
        message="Are you sure you want to delete this scenario? This action cannot be undone."
        confirmText="Delete"
        confirmStyle="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {/* Conflict Pane */}
      <ConflictPane />
    </div>
  );
};
