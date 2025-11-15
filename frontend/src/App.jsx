import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useAuthStore } from './stores/authStore';
import { DashboardPage } from './pages/DashboardPage';
import { ScenarioPage } from './pages/ScenarioPage';

const LoginPage = () => {
  const { setAuth } = useAuthStore();

  const handleMockLogin = () => {
    // Mock login for development
    // In production, this would handle Google/Microsoft OAuth
    const mockToken = 'mock-jwt-token-' + Date.now();
    const mockUser = {
      id: 'user-1',
      email: 'teacher@school.edu',
      name: 'Test Teacher',
      role: 'admin',
      schoolId: 'school-1',
      school: {
        id: 'school-1',
        name: 'Test School',
        settings: {
          academic_streaming_enabled: false,
          default_class_size: 25
        }
      }
    };
    setAuth(mockToken, mockUser);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Classier</h1>
          <p className="text-gray-600">Intelligent Class Sorting Tool</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleMockLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="font-medium text-gray-700">Sign in with Google (Mock)</span>
          </button>

          <button
            onClick={handleMockLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#f25022" d="M0 0h11.377v11.372H0z"/>
              <path fill="#00a4ef" d="M12.623 0H24v11.372H12.623z"/>
              <path fill="#7fba00" d="M0 12.628h11.377V24H0z"/>
              <path fill="#ffb900" d="M12.623 12.628H24V24H12.623z"/>
            </svg>
            <span className="font-medium text-gray-700">Sign in with Microsoft (Mock)</span>
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-6">
          Note: Using mock authentication for development
        </p>
      </div>
    </div>
  );
};

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, fetchCurrentUser } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCurrentUser();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/scenario/:scenarioId"
          element={
            <PrivateRoute>
              <ScenarioPage />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
