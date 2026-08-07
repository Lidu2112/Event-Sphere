import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { useEffect } from 'react';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import OrganizerDashboard from './pages/organizer/OrganizerDashboard';
import StaffDashboard from './pages/staff/StaffDashboard';
import VendorDashboard from './pages/vendor/VendorDashboard';
import AttendeeDashboard from './pages/attendee/AttendeeDashboard';
import './App.css';

function ProtectedRoute({ children, allowedRole }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Block browser back/forward navigation into protected pages after logout
  useEffect(() => {
    function handlePop() {
      const saved = localStorage.getItem('vs_user');
      if (!saved) {
        window.history.pushState(null, '', '/login');
        navigate('/login', { replace: true });
      }
    }
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, [navigate]);

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontSize: 24 }}>⏳</div>;
  if (!user) return <Navigate to="/login" replace />;

  const isAdmin = user.role === 'platform-admin';
  const isAllowed = !allowedRole || user.role === allowedRole || isAdmin;

  if (!isAllowed) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return null;

  const getDefaultRoute = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'platform-admin': return '/admin';
      case 'event-organizer': return '/organizer';
      case 'event-staff': return '/staff';
      case 'vendor': return '/vendor';
      case 'attendee': return '/attendee';
      default: return '/login';
    }
  };

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={getDefaultRoute()} replace /> : <Login />} />

      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRole="platform-admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/organizer/*"
        element={
          <ProtectedRoute allowedRole="event-organizer">
            <OrganizerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/staff/*"
        element={
          <ProtectedRoute allowedRole="event-staff">
            <StaffDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/vendor/*"
        element={
          <ProtectedRoute allowedRole="vendor">
            <VendorDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/attendee/*"
        element={
          <ProtectedRoute allowedRole="attendee">
            <AttendeeDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider>
          <AppRoutes />
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
