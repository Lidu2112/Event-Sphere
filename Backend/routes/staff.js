const express = require('express');
const Ticket = require('../models/Ticket');
const Entrance = require('../models/Entrance');

const router = express.Router();

// ── Fast QR Validation endpoint (< 2s guaranteed via index)
// POST /api/staff/qr-validate  body: { ticketCode }
router.post('/qr-validate', async (req, res) => {
    const start = Date.now();
    try {
        const { ticketCode } = req.body;
        if (!ticketCode) {
            return res.status(400).json({ success: false, message: 'ticketCode is required.' });
        }

        // Single indexed lookup — should complete in < 50ms
        const ticket = await Ticket.findOne(
            { $or: [{ ticketCode }, { txRef: ticketCode }] },
            {
                ticketCode: 1, txRef: 1, status: 1, checkedIn: 1, checkedInAt: 1,
                userName: 1, userEmail: 1, eventTitle: 1, eventDate: 1, eventVenue: 1
            }
        ).lean();

        const elapsed = Date.now() - start;

        if (!ticket) {
            return res.json({ success: false, valid: false, message: 'Ticket not found.', elapsed });
        }
        if (ticket.status !== 'paid') {
            return res.json({ success: false, valid: false, message: 'Ticket not paid.', elapsed });
        }
        if (ticket.checkedIn) {
            return res.json({
                success: false, valid: false, alreadyUsed: true,
                message: 'Ticket already checked in.', ticket, elapsed
            });
        }

        return res.json({ success: true, valid: true, ticket, elapsed });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

// Get ticket by code or txRef
router.get('/tickets/:ticketCode', async (req, res) => {
    try {
        const ticket = await Ticket.findOne({
            $or: [{ ticketCode: req.params.ticketCode }, { txRef: req.params.ticketCode }],
        });
        if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found.' });
        return res.json({ success: true, ticket });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

// Get all tickets (with filters)
router.get('/tickets', async (req, res) => {
    try {
        const { status, eventTitle, checkedIn, limit, search, eventId } = req.query;
        const query = {};

        if (status) query.status = status;
        if (eventTitle) query.eventTitle = eventTitle;
        if (eventId) query.eventId = eventId;
        if (checkedIn === 'true' || checkedIn === 'false') query.checkedIn = checkedIn === 'true';
        if (search) {
            query.$or = [
                { ticketCode: new RegExp(search, 'i') },
                { txRef: new RegExp(search, 'i') },
                { userName: new RegExp(search, 'i') },
                { userEmail: new RegExp(search, 'i') },
            ];
        }

        const tickets = await Ticket.find(query)
            .sort({ updatedAt: -1 })
            .limit(Number(limit) || 500);

        return res.json({ success: true, tickets });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

// Get statistics for check-in page
router.get('/stats', async (req, res) => {
    try {
        const totalTickets = await Ticket.countDocuments({ status: 'paid' });
        const checkedInCount = await Ticket.countDocuments({ checkedIn: true });
        const pendingCount = totalTickets - checkedInCount;
        const attendanceRate = totalTickets > 0 ? ((checkedInCount / totalTickets) * 100).toFixed(1) : 0;

        return res.json({
            success: true,
            stats: {
                totalTickets,
                checkedInCount,
                pendingCount,
                attendanceRate,
            },
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

// Check in a ticket
router.post('/tickets/checkin', async (req, res) => {
    try {
        const { ticketCode, staffEmail, staffName, staffId, entranceId } = req.body;
        const resolvedStaffEmail = staffEmail || 'staff@eventsphere.com';
        const resolvedStaffName = staffName || resolvedStaffEmail.split('@')[0];
        if (!ticketCode) {
            return res.status(400).json({ success: false, message: 'ticketCode is required.' });
        }

        const ticket = await Ticket.findOne({
            $or: [{ ticketCode }, { txRef: ticketCode }],
        });
        if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found.' });
        if (ticket.status !== 'paid') return res.status(400).json({ success: false, message: 'Ticket has not been paid.' });
        if (ticket.checkedIn) {
            return res.status(400).json({
                success: false,
                message: 'This ticket has already been checked in.',
                ticket,
            });
        }

        ticket.checkedIn = true;
        ticket.checkedInAt = new Date();
        ticket.checkedInBy = resolvedStaffEmail;
        ticket.checkedInByName = resolvedStaffName;
        ticket.checkedInById = staffId || null;
        if (entranceId) ticket.entranceId = entranceId;
        await ticket.save();

        if (entranceId) {
            const entrance = await Entrance.findById(entranceId);
            if (entrance) {
                entrance.checkedInCount = Number(entrance.checkedInCount || 0) + 1;
                entrance.lastCheckedInAt = new Date();
                entrance.lastCheckedInBy = resolvedStaffEmail;
                entrance.lastCheckedInByName = resolvedStaffName;
                entrance.lastCheckedInTicket = ticket.ticketCode || ticket.txRef;
                entrance.history = [
                    {
                        type: 'checkin',
                        ticketCode: ticket.ticketCode || ticket.txRef,
                        attendeeName: ticket.userName || ticket.userEmail || 'Guest',
                        staffName: resolvedStaffName,
                        staffEmail: resolvedStaffEmail,
                        checkedInAt: new Date(),
                    },
                    ...(Array.isArray(entrance.history) ? entrance.history : [])
                ].slice(0, 50);
                await entrance.save();
            }
        }

        return res.json({ success: true, ticket });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

// Get entrances
router.get('/entrances', async (req, res) => {
    try {
        const entrances = await Entrance.find({});
        const ticketCounts = await Ticket.aggregate([
            { $match: { checkedIn: true, entranceId: { $exists: true, $ne: null } } },
            { $group: { _id: '$entranceId', count: { $sum: 1 } } },
        ]);
        const countsByEntrance = ticketCounts.reduce((acc, item) => ({ ...acc, [item._id.toString()]: item.count }), {});
        const enriched = entrances.map(ent => ({
            ...ent.toObject(),
            checkedInCount: countsByEntrance[ent._id.toString()] || 0,
        }));
        return res.json({ success: true, entrances: enriched });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

// Update entrance status
router.patch('/entrances/:id/status', async (req, res) => {
    try {
        const { status, staffEmail, staffName } = req.body;
        const entrance = await Entrance.findById(req.params.id);
        if (!entrance) return res.status(404).json({ success: false, message: 'Entrance not found.' });

        entrance.status = status;
        entrance.lastUpdatedBy = staffEmail || entrance.lastUpdatedBy || 'staff';
        entrance.lastUpdatedByName = staffName || entrance.lastUpdatedByName || 'Staff';
        entrance.activityLog = [
            {
                type: 'status-change',
                action: status === 'open' ? 'opened' : 'closed',
                changedBy: staffName || staffEmail || 'Staff',
                changedAt: new Date(),
            },
            ...(Array.isArray(entrance.activityLog) ? entrance.activityLog : [])
        ].slice(0, 50);
        await entrance.save();

        return res.json({ success: true, entrance });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

// Assign staff to entrance (or unassign if no staffId provided)
router.patch('/entrances/:id/assign', async (req, res) => {
    try {
        const { staffEmail, staffName, staffId, unassign } = req.body;
        const entrance = await Entrance.findById(req.params.id);
        if (!entrance) return res.status(404).json({ success: false, message: 'Entrance not found.' });

        if (unassign) {
            entrance.staffEmail = null;
            entrance.staffName = null;
            entrance.staffId = null;
            entrance.assignedAt = null;
        } else {
            entrance.staffEmail = staffEmail || null;
            entrance.staffName = staffName || (staffEmail ? staffEmail.split('@')[0] : null);
            entrance.staffId = staffId || null;
            entrance.assignedAt = new Date();
        }

        entrance.activityLog = [
            {
                type: 'assignment',
                action: unassign ? 'unassigned' : 'assigned',
                changedBy: staffName || staffEmail || 'Staff',
                changedAt: new Date(),
            },
            ...(Array.isArray(entrance.activityLog) ? entrance.activityLog : [])
        ].slice(0, 100);
        await entrance.save();

        return res.json({ success: true, entrance });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

// GET check-in history for a specific entrance (staff view)
router.get('/entrances/:id/history', async (req, res) => {
    try {
        const entrance = await Entrance.findById(req.params.id);
        if (!entrance) return res.status(404).json({ success: false, message: 'Entrance not found.' });

        const tickets = await Ticket.find({ checkedIn: true, entranceId: req.params.id })
            .sort({ checkedInAt: -1 })
            .limit(50);

        return res.json({
            success: true,
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
        return res.status(500).json({ success: false, message: err.message });
    }
});

// Create entrance
router.post('/entrances', async (req, res) => {
    try {
        const { name, eventId, eventTitle } = req.body;
        const entrance = await Entrance.create({ name, eventId: eventId || 0, eventTitle: eventTitle || 'General' });
        return res.json({ success: true, entrance });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

// Seed default entrances (call once to populate DB)
router.post('/entrances/seed', async (req, res) => {
    try {
        const count = await Entrance.countDocuments();
        if (count > 0) return res.json({ success: true, message: `Already has ${count} entrances.` });
        const defaults = [
            { name: 'Main Gate', status: 'open' },
            { name: 'VIP Entrance', status: 'open' },
            { name: 'West Gate', status: 'open' },
            { name: 'Emergency Exit', status: 'closed' },
        ];
        const entrances = await Entrance.insertMany(defaults);
        return res.json({ success: true, message: `Seeded ${entrances.length} entrances.`, entrances });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

// Get assigned events for staff
router.get('/assigned', async (req, res) => {
    try {
        const { staffEmail } = req.query;
        const entrances = await Entrance.find(staffEmail ? { staffEmail } : {});
        const eventIds = [...new Set(entrances.map(e => e.eventId))];
        return res.json({ success: true, eventIds, entrances });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

// Get event list
router.get('/events', async (req, res) => {
    try {
        const events = await Ticket.find({}, { eventId: 1, eventTitle: 1 }).distinct('eventId');
        return res.json({ success: true, events });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;