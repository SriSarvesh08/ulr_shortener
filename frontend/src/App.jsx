import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import PublicStats from './pages/PublicStats';
import Settings from './pages/Settings';
import QrCenter from './pages/QrCenter';
import ActivityCenter from './pages/ActivityCenter';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';

const App = () => {
  const { loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <LoadingSpinner size="xl" text="Loading LinkIQ..." />
      </div>
    );
  }

  // Determine if we are on a route that should use the public Navbar
  const isPublicRoute = ['/', '/login', '/signup'].includes(location.pathname) || location.pathname.startsWith('/stats');

  return (
    <div className="min-h-screen bg-zinc-50">
      {isPublicRoute && <Navbar />}
      
      <ErrorBoundary>
        <Routes>
          {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Landing />} />
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="/signup"
          element={user ? <Navigate to="/" replace /> : <Signup />}
        />
        <Route path="/stats/:shortCode" element={<PublicStats />} />

        {/* Authenticated Routes wrapped in DashboardLayout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard activeTabOverride="dashboard" />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-links"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard activeTabOverride="links" />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/insights"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard activeTabOverride="analytics" />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/safety-center"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard activeTabOverride="public-stats" />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/qr-center"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <QrCenter />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/activity"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ActivityCenter />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics/:id"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Analytics />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Settings />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </ErrorBoundary>
    </div>
  );
};

export default App;
