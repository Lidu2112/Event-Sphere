import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import AttendeeHome from './pages/AttendeeHome';
import BrowseEvents from './pages/BrowseEvents';
import MyTickets from './pages/MyTickets';
import PurchaseHistory from './pages/PurchaseHistory';
import SubmitReview from './pages/SubmitReview';

const NAV = [
    { path: '/attendee', label: 'Dashboard', icon: '📊' },
    { path: '/attendee/browse', label: 'Browse Events', icon: '🔍' },
    { path: '/attendee/tickets', label: 'My Tickets', icon: '🎟️' },
    { path: '/attendee/history', label: 'Purchase History', icon: '📋' },
    { path: '/attendee/reviews', label: 'Submit Review', icon: '⭐' },
];

export default function AttendeeDashboard() {
    return (
        <DashboardLayout navigation={NAV} roleLabel="Attendee" roleIcon="🎟️" roleColor="#f59e0b">
            <Routes>
                <Route index element={<AttendeeHome />} />
                <Route path="browse" element={<BrowseEvents />} />
                <Route path="tickets" element={<MyTickets />} />
                <Route path="history" element={<PurchaseHistory />} />
                <Route path="reviews" element={<SubmitReview />} />
            </Routes>
        </DashboardLayout>
    );
}
