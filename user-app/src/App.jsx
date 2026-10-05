import { BrowserRouter, Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useEffect } from 'react';
import Profile from './pages/dashboard/pages/Profile';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Hero from './components/Hero';
import FeaturedEvents from './components/FeaturedEvents';
import Categories from './components/Categories';
import Vendors from './components/Vendors';
import About from './components/About';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import EventDetail from './pages/EventDetail';
import EventsPage from './pages/EventsPage';
import VendorsPage from './pages/VendorsPage';
import VendorDetail from './pages/VendorDetail';
import PaymentSuccess from './pages/PaymentSuccess';
import CategoriesPage from './pages/CategoriesPage';
import AboutPage from './pages/AboutPage';
import AttendeeDashboard from './pages/dashboard/AttendeeDashboard';
import MyTickets from './pages/dashboard/pages/MyTickets';
import MyQRCodes from './pages/dashboard/pages/MyQRCodes';
import PurchaseHistory from './pages/dashboard/pages/PurchaseHistory';
import ReviewsRatings from './pages/dashboard/pages/ReviewsRatings';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

import './App.css';

function Landing() {
  return (
    <>
      <Hero />
      <FeaturedEvents />
      <Categories />
      <Vendors />
      <About />
    </>
  );
}

// Redirect logged-in users away from login/register
function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return children;
}

// Require login
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Block browser back/forward button from re-entering protected pages after logout
  useEffect(() => {
    function handlePop() {
      const saved = localStorage.getItem('es_user');
      if (!saved) {
        window.history.pushState(null, '', '/login');
        navigate('/login', { replace: true });
      }
    }
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, [navigate]);

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppShell() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <div className="app">
      {!isDashboard && <Navbar />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/vendors" element={<VendorsPage />} />
        <Route path="/vendors/:id" element={<VendorDetail />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />

        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

        <Route path="/dashboard/*" element={
          <PrivateRoute><AttendeeDashboard /></PrivateRoute>
        } />
        <Route path="/attendee" element={<PrivateRoute><Navigate to="/attendee/tickets" replace /></PrivateRoute>} />
        <Route path="/attendee/tickets" element={<PrivateRoute><MyTickets /></PrivateRoute>} />
        <Route path="/attendee/qrcodes" element={<PrivateRoute><MyQRCodes /></PrivateRoute>} />
        <Route path="/attendee/history" element={<PrivateRoute><PurchaseHistory /></PrivateRoute>} />
        <Route path="/attendee/reviews" element={<PrivateRoute><ReviewsRatings /></PrivateRoute>} />
        <Route
          path="/attendee/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />


        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />
      </Routes>
      {!isDashboard && <Footer />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
