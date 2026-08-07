import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import OrganizerHome from './pages/OrganizerHome';
import MyEvents from './pages/MyEvents';
import CreateEvent from './pages/CreateEvent';
import SellTickets from './pages/SellTickets';
import ManageAttendees from './pages/ManageAttendees';
import Analytics from './pages/Analytics';
import AccountSettings from '../AccountSettings';
import InviteStaff from './pages/InviteStaff';
import ManageVendors from './pages/ManageVendors';

const NAV = [
    { path: '/organizer', label: 'Dashboard', icon: '📊' },
    { path: '/organizer/events', label: 'My Events', icon: '🎪' },
    { path: '/organizer/create', label: 'Create Event', icon: '➕' },
    { path: '/organizer/tickets', label: 'Sell Tickets', icon: '🎟️' },
    { path: '/organizer/attendees', label: 'Manage Attendees', icon: '👥' },
    { path: '/organizer/vendors', label: 'Manage Vendors', icon: '🏪' },
    { path: '/organizer/staff', label: 'Invite Staff', icon: '👷' },
    { path: '/organizer/analytics', label: 'View Analytics', icon: '📈' },
    { path: '/organizer/settings', label: 'Account Settings', icon: '⚙️' },
];

export default function OrganizerDashboard() {
    return (
        <DashboardLayout navigation={NAV} roleLabel="Event Organizer" roleIcon="🎪" roleColor="#0ea5e9">
            <Routes>
                <Route index element={<OrganizerHome />} />
                <Route path="events" element={<MyEvents />} />
                <Route path="create" element={<CreateEvent />} />
                <Route path="tickets" element={<SellTickets />} />
                <Route path="attendees" element={<ManageAttendees />} />
                <Route path="vendors" element={<ManageVendors />} />
                <Route path="staff" element={<InviteStaff />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="settings" element={<AccountSettings />} />
            </Routes>
        </DashboardLayout>
    );
}
