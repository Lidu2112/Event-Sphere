import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import StaffHome from './pages/StaffHome';
import ScanTickets from './pages/ScanTickets';
import CheckIn from './pages/CheckIn';
import AttendeeList from './pages/AttendeeList';
import Entrances from './pages/Entrances';
import AccountSettings from '../AccountSettings';

const NAV = [
    { path: '/staff', label: 'Dashboard', icon: '📊' },
    { path: '/staff/scan', label: 'Scan Tickets', icon: '📱' },
    { path: '/staff/checkin', label: 'Check In', icon: '✅' },
    { path: '/staff/attendees', label: 'Attendee List', icon: '📋' },
    { path: '/staff/entrances', label: 'Manage Entrances', icon: '🚪' },
    { path: '/staff/settings', label: 'Account Settings', icon: '⚙️' },
];

export default function StaffDashboard() {
    return (
        <DashboardLayout navigation={NAV} roleLabel="Event Staff" roleIcon="👷" roleColor="#059669">
            <Routes>
                <Route index element={<StaffHome />} />
                <Route path="scan" element={<ScanTickets />} />
                <Route path="checkin" element={<CheckIn />} />
                <Route path="attendees" element={<AttendeeList />} />
                <Route path="entrances" element={<Entrances />} />
                <Route path="settings" element={<AccountSettings />} />
            </Routes>
        </DashboardLayout>
    );
}
