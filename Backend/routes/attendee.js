const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Booking = require('../models/Booking');
const Ticket = require('../models/Ticket');
const Review = require('../models/Review');
const bcrypt = require('bcryptjs');

// helper: get user id from query or body
function uid(req) { return req.query.userId || req.body?.userId || ''; }

// ══════════════════════════════════════════════════════════
// PROFILE — get & update
// ══════════════════════════════════════════════════════════
router.get('/profile', async (req, res) => {
    try {
        const user = await User.findById(uid(req)).select('-password -resetToken -resetTokenExpire');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, user });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.put('/profile', async (req, res) => {
    try {
        const { userId, name, phone, location, bio } = req.body;
        const user = await User.findByIdAndUpdate(
            userId,
            { name, phone, location, bio },
            { new: true }
        ).select('-password -resetToken -resetTokenExpire');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, user });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.put('/profile/password', async (req, res) => {
    try {
        const { userId, currentPassword, newPassword } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        if (user.provider === 'google') return res.status(400).json({ success: false, message: 'Google accounts cannot change password here' });
        const match = await bcrypt.compare(currentPassword, user.password);
        if (!match) return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.json({ success: true, message: 'Password updated successfully' });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ══════════════════════════════════════════════════════════
// TICKETS — list by user email from the database
// ══════════════════════════════════════════════════════════
router.get('/tickets', async (req, res) => {
    try {
        const { userEmail, email, userId } = req.query;
        const lookup = userEmail || email || userId;

        if (!lookup) {
            return res.status(400).json({ success: false, message: 'userEmail is required.' });
        }

        const allTickets = await Ticket.find({
            $or: [{ userEmail: lookup }, { userId: lookup }],
            status: 'paid'
        }).sort({ createdAt: -1 });

        const normalized = allTickets.map(t => ({
            _id: t._id,
            ticketId: t.ticketCode || t.txRef,
            eventName: t.eventTitle,
            eventDate: t.eventDate,
            venue: t.eventVenue,
            ticketType: t.ticketType || 'General',
            amount: t.amount,
            status: 'confirmed',
            qrCode: t.qrCode,
            txRef: t.txRef,
        }));
        res.json({ success: true, tickets: normalized });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ══════════════════════════════════════════════════════════
// PURCHASE HISTORY — read directly from the ticket records
// ══════════════════════════════════════════════════════════
router.get('/purchases', async (req, res) => {
    try {
        const { userEmail, email, userId } = req.query;
        const lookup = userEmail || email || userId;

        if (!lookup) {
            return res.status(400).json({ success: false, message: 'userEmail is required.' });
        }

        const tickets = await Ticket.find({
            $or: [{ userEmail: lookup }, { userId: lookup }],
            status: 'paid'
        }).sort({ createdAt: -1 });

        const total = tickets.reduce((s, t) => s + (t.amount || 0), 0);
        const bookings = tickets.map(t => ({
            _id: t._id,
            eventName: t.eventTitle,
            serviceName: t.ticketType || 'General Ticket',
            eventDate: t.eventDate,
            amount: t.amount,
            status: 'completed',
            paymentStatus: 'paid',
            txRef: t.txRef,
        }));
        res.json({ success: true, bookings, totalSpent: total });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ══════════════════════════════════════════════════════════
// FAVORITES — stored on user document
// ══════════════════════════════════════════════════════════
router.get('/favorites', async (req, res) => {
    try {
        const user = await User.findById(uid(req)).select('favorites');
        res.json({ success: true, favorites: user?.favorites || [] });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/favorites', async (req, res) => {
    try {
        const { userId, eventId, eventData } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        const exists = (user.favorites || []).find(f => f.eventId === eventId);
        if (exists) return res.json({ success: true, favorites: user.favorites, message: 'Already in favorites' });
        user.favorites = [...(user.favorites || []), { eventId, ...eventData, savedAt: new Date() }];
        await user.save();
        res.json({ success: true, favorites: user.favorites });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.delete('/favorites/:eventId', async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        user.favorites = (user.favorites || []).filter(f => f.eventId !== req.params.eventId);
        await user.save();
        res.json({ success: true, favorites: user.favorites });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ══════════════════════════════════════════════════════════
// NOTIFICATIONS — stored on user document
// ══════════════════════════════════════════════════════════
router.get('/notifications', async (req, res) => {
    try {
        const user = await User.findById(uid(req)).select('notifications');
        res.json({ success: true, notifications: user?.notifications || [] });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.patch('/notifications/:id/read', async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        user.notifications = (user.notifications || []).map(n =>
            n._id?.toString() === req.params.id ? { ...n.toObject(), read: true } : n
        );
        await user.save();
        res.json({ success: true, notifications: user.notifications });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.patch('/notifications/read-all', async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        user.notifications = (user.notifications || []).map(n => ({ ...n.toObject(), read: true }));
        await user.save();
        res.json({ success: true, notifications: user.notifications });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ══════════════════════════════════════════════════════════
// DASHBOARD STATS
// ══════════════════════════════════════════════════════════
router.get('/stats', async (req, res) => {
    try {
        const { userEmail, userId } = req.query;
        const [ticketCount, bookings, user] = await Promise.all([
            Ticket.countDocuments({ userEmail, status: 'paid' }),
            Booking.find({ clientEmail: userEmail }),
            User.findById(userId).select('favorites'),
        ]);
        const totalSpent = bookings.reduce((s, b) => s + (b.amount || 0), 0);
        const favorites = user?.favorites?.length || 0;
        const upcoming = bookings.filter(b => b.status === 'accepted').length;
        res.json({ success: true, stats: { tickets: ticketCount, upcoming, favorites, totalSpent } });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ══════════════════════════════════════════════════════════
// ATTENDEE REVIEWS (reviews submitted by this user)
// ══════════════════════════════════════════════════════════
router.get('/reviews', async (req, res) => {
    try {
        const reviews = await Review.find({ reviewerEmail: req.query.userEmail }).sort({ createdAt: -1 });
        res.json({ success: true, reviews });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/reviews', async (req, res) => {
    try {
        const { reviewerName, reviewerEmail, rating, comment, bookingId, serviceName, vendorEmail } = req.body;
        if (!rating || rating < 1 || rating > 5) return res.status(400).json({ success: false, message: 'Rating must be 1-5' });
        // find vendor id from booking
        const booking = bookingId ? await Booking.findById(bookingId) : null;
        const review = await Review.create({
            vendorEmail: vendorEmail || booking?.vendorEmail || '',
            vendorId: booking?.vendorId || null,
            reviewerName, reviewerEmail, rating, comment,
            bookingId: bookingId || null,
            serviceName,
        });
        res.json({ success: true, review });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
