import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import VendorHome from './pages/VendorHome';
import MyServices from './pages/MyServices';
import BookingRequests from './pages/BookingRequests';
import Availability from './pages/Availability';
import Payments from './pages/Payments';
import VendorProfile from './pages/VendorProfile';
import Portfolio from './pages/Portfolio';
import Reviews from './pages/Reviews';
import AccountSettings from '../AccountSettings';

const NAV = [
    { path: '/vendor', label: 'Dashboard', icon: '📊' },
    { path: '/vendor/profile', label: 'Vendor Profile', icon: '🪪' },
    { path: '/vendor/services', label: 'My Services', icon: '🏪' },
    { path: '/vendor/bookings', label: 'Booking Requests', icon: '📩' },
    { path: '/vendor/portfolio', label: 'Portfolio / Gallery', icon: '🖼️' },
    { path: '/vendor/reviews', label: 'Reviews & Ratings', icon: '⭐' },
    { path: '/vendor/availability', label: 'Manage Availability', icon: '📅' },
    { path: '/vendor/payments', label: 'Receive Payments', icon: '💰' },
    { path: '/vendor/settings', label: 'Account Settings', icon: '⚙️' },
];

export default function VendorDashboard() {
    return (
        <DashboardLayout navigation={NAV} roleLabel="Vendor" roleIcon="🏪" roleColor="#ec4899">
            <Routes>
                <Route index element={<VendorHome />} />
                <Route path="profile" element={<VendorProfile />} />
                <Route path="services" element={<MyServices />} />
                <Route path="bookings" element={<BookingRequests />} />
                <Route path="portfolio" element={<Portfolio />} />
                <Route path="reviews" element={<Reviews />} />
                <Route path="availability" element={<Availability />} />
                <Route path="payments" element={<Payments />} />
                <Route path="settings" element={<AccountSettings />} />
            </Routes>
        </DashboardLayout>
    );
}
