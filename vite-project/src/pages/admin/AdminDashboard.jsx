import { Routes, Route } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import DashboardHome from './pages/DashboardHome';
import ManageUsers from './pages/ManageUsers';
import ApproveOrganizers from './pages/ApproveOrganizers';
import ManageVendors from './pages/ManageVendors';
import EventManagement from './pages/EventManagement';
import TicketManagement from './pages/TicketManagement';
import RealTimeActivity from './pages/RealTimeActivity';
import PlatformSettings from './pages/PlatformSettings';
import EntrancesManagement from './pages/EntrancesManagement';
import MonitorPayments from './pages/MonitorPayments';
import ViewReports from './pages/ViewReports';
import SupportRequests from './pages/SupportRequests';

export default function AdminDashboard() {
    return (
        <AdminLayout>
            <Routes>
                <Route index element={<DashboardHome />} />
                <Route path="users" element={<ManageUsers />} />
                <Route path="organizers" element={<ApproveOrganizers />} />
                <Route path="vendors" element={<ManageVendors />} />
                <Route path="events" element={<EventManagement />} />
                <Route path="tickets" element={<TicketManagement />} />
                <Route path="entrances" element={<EntrancesManagement />} />
                <Route path="activity" element={<RealTimeActivity />} />
                <Route path="settings" element={<PlatformSettings />} />
                <Route path="payments" element={<MonitorPayments />} />
                <Route path="reports" element={<ViewReports />} />
                <Route path="support" element={<SupportRequests />} />
            </Routes>
        </AdminLayout>
    );
}
