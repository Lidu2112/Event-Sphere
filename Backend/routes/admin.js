const express = require('express');
const router = express.Router();
const User = require('../models/user');
const SupportRequest = require('../models/SupportRequest');
const Ticket = require('../models/Ticket');
const Notification = require('../models/Notification');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Entrance = require('../models/Entrance');

// ─────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────

// GET all users
router.get('/users', async (req, res) => {
    try {
        const { role, search } = req.query;
        let query = {};
        if (role && role !== 'all') query.role = role;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        const users = await User.find(query).select('-password').sort({ createdAt: -1 });
        res.json({ success: true, users });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET single user
router.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST create user
router.post('/users', async (req, res) => {
    try {
        const bcrypt = require('bcryptjs');
        const { name, email, phone, role, password } = req.body;
        const existing = await User.findOne({ $or: [{ email }, { phone }] });
        if (existing) return res.status(400).json({ success: false, message: 'Email or phone already exists' });
        const hashedPassword = await bcrypt.hash(password || 'EventSphere@123', 10);
        const user = await User.create({ name, email, phone, role: role || 'attendee', password: hashedPassword, provider: 'local' });
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// PUT edit user
router.put('/users/:id', async (req, res) => {
    try {
        const { name, email, phone, role, status } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { name, email, phone, role, status },
            { new: true }
        ).select('-password');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// PATCH activate/deactivate user
router.patch('/users/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true }).select('-password');
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE user
router.delete('/users/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─────────────────────────────────────────────
// ORGANIZERS  (users with role=event-organizer)
// ─────────────────────────────────────────────

router.get('/organizers', async (req, res) => {
    try {
        const { status } = req.query;
        let query = { role: 'event-organizer' };
        if (status) query.status = status;
        const organizers = await User.find(query).select('-password').sort({ createdAt: -1 });
        res.json({ success: true, organizers });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.patch('/organizers/:id/approve', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { status: 'active' }, { new: true }).select('-password');
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.patch('/organizers/:id/reject', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true }).select('-password');
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─────────────────────────────────────────────
// VENDORS  (users with role=vendor)
// ─────────────────────────────────────────────

router.get('/vendors', async (req, res) => {
    try {
        const { search } = req.query;
        let query = { role: 'vendor' };
        if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }];

        const vendorUsers = await User.find(query).select('-password').sort({ createdAt: -1 });
        const vendors = await Promise.all(vendorUsers.map(async (vendor) => {
            const email = vendor.email || vendor.userEmail || '';
            const [services, bookings, reviews] = await Promise.all([
                Service.find({ vendorEmail: email }).exec().catch(() => []),
                Booking.find({ vendorEmail: email }).exec().catch(() => []),
                Review.find({ vendorEmail: email }).exec().catch(() => [])
            ]);

            const revenueValue = bookings
                .filter(item => item.paymentStatus === 'paid')
                .reduce((sum, item) => sum + Number(item.amount || 0), 0);
            const ratingValue = reviews.length
                ? Number((reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) / reviews.length).toFixed(1))
                : 0;

            return {
                ...vendor,
                service: vendor.category || vendor.service || 'Service Provider',
                bookings: bookings.length,
                services: services.length,
                ratings: reviews.length,
                rating: ratingValue,
                revenue: `ETB ${revenueValue.toLocaleString()}`,
                revenueValue,
                status: vendor.status || 'active'
            };
        }));

        res.json({ success: true, vendors });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.patch('/vendors/:id/approve', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { status: 'active' }, { new: true }).select('-password');
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.patch('/vendors/:id/reject', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true }).select('-password');
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.patch('/vendors/:id/activate', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { status: 'active' }, { new: true }).select('-password');
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.patch('/vendors/:id/suspend', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { status: 'suspended' }, { new: true }).select('-password');
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─────────────────────────────────────────────
// DASHBOARD STATS
// ─────────────────────────────────────────────

router.get('/stats', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ status: 'active' });
        const pendingOrganizers = await User.countDocuments({ role: 'event-organizer', status: 'pending' });
        const vendors = await User.countDocuments({ role: 'vendor' });
        const openSupport = await SupportRequest.countDocuments({ status: 'open' });
        res.json({
            success: true,
            stats: { totalUsers, activeUsers, pendingOrganizers, vendors, openSupport }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─────────────────────────────────────────────
// ENTRANCES
// ─────────────────────────────────────────────

router.get('/entrances', async (req, res) => {
    try {
        const entrances = await Entrance.find({}).sort({ updatedAt: -1 });
        const ticketCounts = await Ticket.aggregate([
            { $match: { checkedIn: true, entranceId: { $exists: true, $ne: null } } },
            { $group: { _id: '$entranceId', count: { $sum: 1 } } },
        ]);
        const countsByEntrance = ticketCounts.reduce((acc, item) => ({ ...acc, [item._id.toString()]: item.count }), {});

        const enriched = await Promise.all(entrances.map(async (entrance) => {
            const entry = entrance.toObject();
            const assignedUser = entry.staffId
                ? await User.findById(entry.staffId).select('name email').catch(() => null)
                : null;
            return {
                ...entry,
                checkedInCount: countsByEntrance[entry._id.toString()] || entry.checkedInCount || 0,
                assignedStaffName: entry.staffName || assignedUser?.name || (entry.staffEmail ? entry.staffEmail.split('@')[0] : 'Unassigned'),
            };
        }));

        res.json({ success: true, entrances: enriched });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.patch('/entrances/:id/status', async (req, res) => {
    try {
        const { status, staffEmail, staffName } = req.body;
        const entrance = await Entrance.findById(req.params.id);
        if (!entrance) return res.status(404).json({ success: false, message: 'Entrance not found' });

        entrance.status = status;
        entrance.lastUpdatedBy = staffEmail || entrance.lastUpdatedBy || 'admin';
        entrance.lastUpdatedByName = staffName || entrance.lastUpdatedByName || 'Admin';
        entrance.activityLog = [
            {
                type: 'status-change',
                action: status === 'open' ? 'opened' : 'closed',
                changedBy: staffName || staffEmail || 'Admin',
                changedAt: new Date(),
            },
            ...(Array.isArray(entrance.activityLog) ? entrance.activityLog : [])
        ].slice(0, 50);
        await entrance.save();

        res.json({ success: true, entrance });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.patch('/entrances/:id/assign', async (req, res) => {
    try {
        const { staffEmail, staffName, staffId } = req.body;
        const entrance = await Entrance.findById(req.params.id);
        if (!entrance) return res.status(404).json({ success: false, message: 'Entrance not found' });

        // Allow unassign (empty staffId) or assign
        entrance.staffEmail = staffEmail || null;
        entrance.staffName = staffName || (staffEmail ? staffEmail.split('@')[0] : null);
        entrance.staffId = staffId || null;
        entrance.assignedAt = staffId ? new Date() : null;
        entrance.activityLog = [
            {
                type: 'assignment',
                action: staffId ? 'assigned' : 'unassigned',
                changedBy: staffName || staffEmail || 'Admin',
                changedAt: new Date(),
            },
            ...(Array.isArray(entrance.activityLog) ? entrance.activityLog : [])
        ].slice(0, 100);
        await entrance.save();

        res.json({ success: true, entrance });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET entrance check-in history for a specific entrance
router.get('/entrances/:id/history', async (req, res) => {
    try {
        const entrance = await Entrance.findById(req.params.id);
        if (!entrance) return res.status(404).json({ success: false, message: 'Entrance not found' });

        const tickets = await Ticket.find({ checkedIn: true, entranceId: req.params.id })
            .sort({ checkedInAt: -1 })
            .limit(100);

        res.json({
            success: true,
            entrance,
            checkIns: tickets.map(t => ({
                ticketCode: t.ticketCode || t.txRef,
                attendeeName: t.userName || t.userEmail || 'Guest',
                eventTitle: t.eventTitle,
                checkedInAt: t.checkedInAt,
                checkedInByName: t.checkedInByName || t.checkedInBy,
            })),
            activityLog: entrance.activityLog || [],
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET global check-in history across all entrances
router.get('/entrances-checkin-history', async (req, res) => {
    try {
        const tickets = await Ticket.find({ checkedIn: true })
            .sort({ checkedInAt: -1 })
            .limit(200);

        const entrances = await Entrance.find({});
        const entranceMap = entrances.reduce((acc, e) => ({ ...acc, [e._id]: e.name }), {});

        res.json({
            success: true,
            history: tickets.map(t => ({
                ticketCode: t.ticketCode || t.txRef,
                attendeeName: t.userName || t.userEmail || 'Guest',
                eventTitle: t.eventTitle,
                entranceName: entranceMap[t.entranceId] || 'Unknown',
                checkedInAt: t.checkedInAt,
                checkedInByName: t.checkedInByName || t.checkedInBy || 'Staff',
            })),
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─────────────────────────────────────────────
// SUPPORT REQUESTS
// ─────────────────────────────────────────────

// GET all support requests
router.get('/support', async (req, res) => {
    try {
        const { status, search } = req.query;
        let query = {};
        if (status && status !== 'all') query.status = status;
        if (search) {
            query.$or = [
                { userName: { $regex: search, $options: 'i' } },
                { requestId: { $regex: search, $options: 'i' } },
                { subject: { $regex: search, $options: 'i' } }
            ];
        }
        const requests = await SupportRequest.find(query).sort({ createdAt: -1 });
        res.json({ success: true, requests });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET single support request
router.get('/support/:id', async (req, res) => {
    try {
        const request = await SupportRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
        res.json({ success: true, request });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST create support request (from user side - available for direct submission too)
router.post('/support', async (req, res) => {
    try {
        const { userId, userName, userEmail, userRole, subject, description, priority } = req.body;
        const sr = await SupportRequest.create({
            user: userId,
            userName, userEmail, userRole,
            subject, description, priority
        });
        res.json({ success: true, request: sr });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// PATCH change status
router.patch('/support/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const sr = await SupportRequest.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.json({ success: true, request: sr });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST reply to request
router.post('/support/:id/reply', async (req, res) => {
    try {
        const { message, from } = req.body;
        const sr = await SupportRequest.findByIdAndUpdate(
            req.params.id,
            {
                $push: { replies: { from: from || 'Admin', message } },
                status: 'in-progress'
            },
            { new: true }
        );
        res.json({ success: true, request: sr });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE close request
router.patch('/support/:id/close', async (req, res) => {
    try {
        const sr = await SupportRequest.findByIdAndUpdate(req.params.id, { status: 'closed' }, { new: true });
        res.json({ success: true, request: sr });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/activity', async (req, res) => {
    try {
        const { limit = 20 } = req.query;
        const notifications = await Notification.find({}).sort({ createdAt: -1 }).limit(Number(limit));
        res.json({ success: true, activity: notifications });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─────────────────────────────────────────────
// PLATFORM SETTINGS (singleton)
// ─────────────────────────────────────────────
const Settings = require('../models/Settings');
router.get('/settings', async (req, res) => {
    try {
        let settings = await Settings.findOne({ singleton: 'global' });
        if (!settings) settings = await Settings.create({ singleton: 'global' });
        res.json({ success: true, settings });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// PUT update settings
router.put('/settings', async (req, res) => {
    try {
        const allowed = [
            'platformName', 'supportEmail', 'commissionRate',
            'allowSelfRegistration', 'requireOrganizerApproval',
            'emailNotifications', 'smsNotifications',
            'bookingConfirmation', 'paymentNotification', 'newOrganizerAlert',
            'twoFactorAuth', 'maintenanceMode', 'sessionTimeout',
        ];
        const update = {};
        allowed.forEach(key => { if (key in req.body) update[key] = req.body[key]; });

        const settings = await Settings.findOneAndUpdate(
            { singleton: 'global' },
            { $set: update },
            { new: true, upsert: true }
        );
        res.json({ success: true, settings });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST admin change password
router.post('/settings/change-password', async (req, res) => {
    try {
        const bcrypt = require('bcryptjs');
        const { adminId, currentPassword, newPassword } = req.body;
        if (!adminId || !currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'adminId, currentPassword and newPassword are required.' });
        }
        const admin = await User.findById(adminId);
        if (!admin) return res.status(404).json({ success: false, message: 'Admin not found.' });
        const match = await bcrypt.compare(currentPassword, admin.password);
        if (!match) return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
        const hashed = await bcrypt.hash(newPassword, 10);
        await User.findByIdAndUpdate(adminId, { password: hashed }, { new: true });
        res.json({ success: true, message: 'Password changed successfully.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─────────────────────────────────────────────
// ADMIN EVENT MANAGEMENT
// ─────────────────────────────────────────────
const OrganizerEvent = require('../models/OrganizerEvent');

router.get('/events', async (req, res) => {
    try {
        const { search, status, category } = req.query;
        let query = {};
        if (search) query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { venue: { $regex: search, $options: 'i' } },
            { organizerEmail: { $regex: search, $options: 'i' } },
        ];
        if (category && category !== 'all') query.category = category;

        let events = await OrganizerEvent.find(query).sort({ createdAt: -1 });

        // Status filter (in-memory since mysqlBase doesn't support complex queries)
        if (status && status !== 'all') {
            if (status === 'hidden') events = events.filter(e => e.hidden);
            else if (status === 'featured') events = events.filter(e => e.featured);
            else if (status === 'cancelled') events = events.filter(e => e.status === 'cancelled');
            else if (status === 'upcoming') events = events.filter(e => e.status !== 'cancelled' && !e.hidden);
            else if (status === 'completed') events = events.filter(e => e.status === 'completed');
        }

        const enriched = await Promise.all(events.map(async ev => {
            const soldCount = await Ticket.countDocuments({ eventTitle: ev.title, status: 'paid' });
            const allPaid = await Ticket.find({ eventTitle: ev.title, status: 'paid' });
            const revenue = allPaid.reduce((s, t) => s + Number(t.amount || 0), 0);
            return { ...ev, ticketsSold: soldCount, revenue };
        }));
        res.json({ success: true, events: enriched });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/events/:id', async (req, res) => {
    try {
        const ev = await OrganizerEvent.findById(req.params.id);
        if (!ev) return res.status(404).json({ success: false, message: 'Event not found' });
        res.json({ success: true, event: ev });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/events/:id', async (req, res) => {
    try {
        const { title, description, venue, date, time, capacity, ticketPrice, category, banner } = req.body;
        const ev = await OrganizerEvent.findByIdAndUpdate(
            req.params.id,
            { title, description, venue, date, time, capacity: Number(capacity) || 100, ticketPrice: Number(ticketPrice) || 0, category, banner },
            { new: true }
        );
        if (!ev) return res.status(404).json({ success: false, message: 'Event not found' });
        res.json({ success: true, event: ev });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/events/:id', async (req, res) => {
    try {
        await OrganizerEvent.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.patch('/events/:id/cancel', async (req, res) => {
    try {
        const ev = await OrganizerEvent.findByIdAndUpdate(req.params.id, { status: 'cancelled', published: false }, { new: true });
        res.json({ success: true, event: ev });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.patch('/events/:id/hide', async (req, res) => {
    try {
        const ev = await OrganizerEvent.findById(req.params.id);
        if (!ev) return res.status(404).json({ success: false, message: 'Event not found' });
        await OrganizerEvent.findByIdAndUpdate(req.params.id, { hidden: !ev.hidden }, { new: true });
        const updated = await OrganizerEvent.findById(req.params.id);
        res.json({ success: true, event: updated });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.patch('/events/:id/feature', async (req, res) => {
    try {
        const ev = await OrganizerEvent.findById(req.params.id);
        if (!ev) return res.status(404).json({ success: false, message: 'Event not found' });
        await OrganizerEvent.findByIdAndUpdate(req.params.id, { featured: !ev.featured }, { new: true });
        const updated = await OrganizerEvent.findById(req.params.id);
        res.json({ success: true, event: updated });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ─────────────────────────────────────────────
// TICKETS — admin full management
// ─────────────────────────────────────────────

router.get('/tickets', async (req, res) => {
    try {
        const { status, search } = req.query;
        let query = {};
        if (status && status !== 'all') query.status = status;
        if (search) query.$or = [
            { ticketCode: { $regex: search, $options: 'i' } },
            { txRef: { $regex: search, $options: 'i' } },
            { userName: { $regex: search, $options: 'i' } },
            { userEmail: { $regex: search, $options: 'i' } },
            { eventTitle: { $regex: search, $options: 'i' } },
        ];
        const tickets = await Ticket.find(query).sort({ createdAt: -1 }).limit(500);
        res.json({ success: true, tickets });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.patch('/tickets/:id/refund', async (req, res) => {
    try {
        const ticket = await Ticket.findByIdAndUpdate(req.params.id, { status: 'refunded' }, { new: true });
        if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
        res.json({ success: true, ticket });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.patch('/tickets/:id/cancel', async (req, res) => {
    try {
        const ticket = await Ticket.findByIdAndUpdate(req.params.id, { status: 'cancelled' }, { new: true });
        if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
        res.json({ success: true, ticket });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ─────────────────────────────────────────────
// ORGANIZER EXTENDED ACTIONS
// ─────────────────────────────────────────────

router.patch('/organizers/:id/suspend', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { status: 'suspended' }, { new: true }).select('-password');
        res.json({ success: true, user });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.patch('/organizers/:id/activate', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { status: 'active' }, { new: true }).select('-password');
        res.json({ success: true, user });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/organizers/:id/events', async (req, res) => {
    try {
        const organizer = await User.findById(req.params.id).select('email name');
        if (!organizer) return res.status(404).json({ success: false, message: 'Organizer not found' });
        const events = await OrganizerEvent.find({ organizerEmail: organizer.email }).sort({ createdAt: -1 });
        res.json({ success: true, events, organizer });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/organizers/:id/revenue', async (req, res) => {
    try {
        const organizer = await User.findById(req.params.id).select('email name');
        if (!organizer) return res.status(404).json({ success: false, message: 'Organizer not found' });
        const events = await OrganizerEvent.find({ organizerEmail: organizer.email }).select('title');
        const titles = events.map(e => e.title);
        const tickets = await Ticket.find({ eventTitle: { $in: titles }, status: 'paid' });
        const total = tickets.reduce((s, t) => s + (t.amount || 0), 0);
        res.json({ success: true, revenue: total, ticketCount: tickets.length, organizer });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ─────────────────────────────────────────────
// VENDOR DETAIL ACTIONS
// ─────────────────────────────────────────────

router.get('/vendors/:id/services', async (req, res) => {
    try {
        const vendor = await User.findById(req.params.id).select('email name');
        if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
        const services = await Service.find({ vendorEmail: vendor.email }).sort({ createdAt: -1 });
        res.json({ success: true, services, vendor });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/vendors/:id/bookings', async (req, res) => {
    try {
        const vendor = await User.findById(req.params.id).select('email name');
        if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
        const bookings = await Booking.find({ vendorEmail: vendor.email }).sort({ createdAt: -1 });
        res.json({ success: true, bookings, vendor });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/vendors/:id/reviews', async (req, res) => {
    try {
        const vendor = await User.findById(req.params.id).select('email name');
        if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
        const reviews = await Review.find({ vendorEmail: vendor.email }).sort({ createdAt: -1 });
        res.json({ success: true, reviews, vendor });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/vendors/:id/payments', async (req, res) => {
    try {
        const vendor = await User.findById(req.params.id).select('email name');
        if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
        const bookings = await Booking.find({ vendorEmail: vendor.email }).sort({ createdAt: -1 });
        const paid = bookings.filter(b => b.paymentStatus === 'paid').reduce((s, b) => s + (b.amount || 0), 0);
        res.json({ success: true, bookings, totalPaid: paid, vendor });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ─────────────────────────────────────────────
// PAYMENTS — real ticket transactions
// ─────────────────────────────────────────────

router.get('/payments', async (req, res) => {
    try {
        const { status, search } = req.query;
        let allTickets = await Ticket.find({}).sort({ createdAt: -1 });

        // Filter in memory (mysqlBase doesn't support all Mongoose query operators)
        if (status && status !== 'all') {
            allTickets = allTickets.filter(t => t.status === status);
        }
        if (search) {
            const s = search.toLowerCase();
            allTickets = allTickets.filter(t =>
                (t.eventTitle || '').toLowerCase().includes(s) ||
                (t.userName || '').toLowerCase().includes(s) ||
                (t.txRef || '').toLowerCase().includes(s)
            );
        }

        const tickets = allTickets.slice(0, 200);
        const paidAll = await Ticket.find({ status: 'paid' });
        const pendingAll = await Ticket.find({ status: 'pending' });
        const failedAll = await Ticket.find({ status: 'failed' });

        res.json({
            success: true,
            payments: tickets,
            summary: {
                totalProcessed: paidAll.reduce((s, t) => s + Number(t.amount || 0), 0),
                totalPending: pendingAll.reduce((s, t) => s + Number(t.amount || 0), 0),
                failedCount: failedAll.length,
            }
        });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ─────────────────────────────────────────────
// REPORTS — aggregate real data from MySQL
// ─────────────────────────────────────────────

router.get('/reports', async (req, res) => {
    try {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        // Fetch all records
        const [allUsers, allTickets, allBookings] = await Promise.all([
            User.find({}).exec(),
            Ticket.find({}).exec(),
            Booking.find({}).exec(),
        ]);

        // User growth — group by month
        const userGrowthMap = {};
        allUsers.forEach(u => {
            const d = new Date(u.createdAt);
            if (d >= sixMonthsAgo) {
                const key = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
                userGrowthMap[key] = (userGrowthMap[key] || 0) + 1;
            }
        });
        const userGrowth = Object.entries(userGrowthMap).map(([_id, count]) => ({ _id, count }));

        // Revenue by month from paid tickets
        const revenueMap = {};
        allTickets.filter(t => t.status === 'paid').forEach(t => {
            const d = new Date(t.createdAt);
            if (d >= sixMonthsAgo) {
                const key = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
                revenueMap[key] = (revenueMap[key] || 0) + Number(t.amount || 0);
            }
        });
        const revenueData = Object.entries(revenueMap).map(([_id, revenue]) => ({ _id, revenue }));

        // Top events by tickets sold
        const eventMap = {};
        allTickets.filter(t => t.status === 'paid').forEach(t => {
            if (!eventMap[t.eventTitle]) eventMap[t.eventTitle] = { _id: t.eventTitle, sold: 0, revenue: 0 };
            eventMap[t.eventTitle].sold += 1;
            eventMap[t.eventTitle].revenue += Number(t.amount || 0);
        });
        const topEvents = Object.values(eventMap).sort((a, b) => b.sold - a.sold).slice(0, 10);

        // Vendor performance
        const vendorMap = {};
        allBookings.forEach(b => {
            if (!b.vendorEmail) return;
            if (!vendorMap[b.vendorEmail]) vendorMap[b.vendorEmail] = { _id: b.vendorEmail, bookings: 0, revenue: 0 };
            vendorMap[b.vendorEmail].bookings += 1;
            vendorMap[b.vendorEmail].revenue += Number(b.amount || 0);
        });
        const vendorPerf = Object.values(vendorMap).sort((a, b) => b.bookings - a.bookings).slice(0, 10);

        // Totals
        const totalUsers = allUsers.length;
        const paidTickets = allTickets.filter(t => t.status === 'paid');
        const totalTickets = paidTickets.length;
        const totalRevenue = paidTickets.reduce((s, t) => s + Number(t.amount || 0), 0);

        res.json({
            success: true,
            userGrowth,
            revenueData,
            topEvents,
            vendorPerf,
            totals: { totalUsers, totalTickets, totalRevenue }
        });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
