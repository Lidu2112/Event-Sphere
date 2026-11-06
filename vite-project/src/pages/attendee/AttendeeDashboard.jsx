import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import AttendeeHome from './pages/AttendeeHome';
import BrowseEvents from './pages/BrowseEvents';
import MyTickets from './pages/MyTickets';
import PurchaseHistory from './pages/PurchaseHistory';
import SubmitReview from './pages/SubmitReview';

const NAV = [
    { path: '/attendee', label: 'Dashboard', icon: "analytics" },
    { path: '/attendee/browse', label: 'Browse Events', icon: "search" },
    { path: '/attendee/tickets', label: 'My Tickets', icon: "ticket" },
    { path: '/attendee/history', label: 'Purchase History', icon: "list" },
    { path: '/attendee/reviews', label: 'Submit Review', icon: "star" },
];

export default function AttendeeDashboard() {
    return (
        <DashboardLayout navigation={NAV} roleLabel="Attendee" roleIcon="ticket" roleColor="#f59e0b">
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
