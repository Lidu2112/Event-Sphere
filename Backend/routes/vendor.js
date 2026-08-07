const upload = require('../middleware/serviceUpload');
const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const Availability = require('../models/Availability');
const VendorProfile = require('../models/VendorProfile');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const transporter = require('../config/email');


// ── helpers ──────────────────────────────────────────────
function ve(req) { return req.query.vendorEmail || req.body?.vendorEmail || ''; }

async function sendNotificationEmail(to, subject, text) {
    if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(to).trim())) return;
    try {
        await transporter.sendMail({
            from: 'EventSphere@gmail.com',
            to: String(to).trim(),
            subject,
            text,
        });
    } catch (err) {
        console.error('Failed to send booking notification email:', err?.message || err);
    }
}

const toPlain = doc => {
    if (!doc) return null;
    const { save, ...rest } = doc;
    return rest;
};

function addBookingMessage(booking, sender, text) {
    const messages = Array.isArray(booking?.messages) ? booking.messages : [];
    messages.push({
        sender,
        text,
        createdAt: new Date().toISOString()
    });
    return messages;
}

// ══════════════════════════════════════════════════════════
// SERVICES
// ══════════════════════════════════════════════════════════

router.get('/services', async (req, res) => {
    try {
        console.log("========== GET SERVICES ==========");
        console.log("Query:", req.query);

        const filter = req.query.vendorEmail
            ? { vendorEmail: req.query.vendorEmail }
            : { status: 'active' };

        console.log("Filter:", filter);

        const services = await Service.find(filter).sort({ createdAt: -1 });

        console.log("Services:", services);

        res.json({
            success: true,
            services
        });

    } catch (e) {
        console.error("GET SERVICES ERROR:");
        console.error(e);
        console.error(e.stack);

        res.status(500).json({
            success: false,
            message: e.message
        });
    }
});

router.get('/services/:id', async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) return res.status(404).json({ success: false, message: 'Service not found' });

        const bookings = await Booking.countDocuments({ serviceId: service._id });
        const revenue = await Booking.aggregate([
            { $match: { serviceId: service._id, paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);
        const ratings = await Booking.find({ serviceId: service._id, rating: { $exists: true } });
        const avgRating = ratings.length
            ? (ratings.reduce((a, b) => a + (b.rating || 0), 0) / ratings.length).toFixed(1)
            : null;

        res.json({
            success: true,
            service: { ...toPlain(service), bookings, revenue: revenue[0]?.total || 0, rating: avgRating },
        });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

router.post(
    '/services',
    upload.single('image'),
    async (req, res) => {
        try {
            const {
                vendorEmail,
                vendorId,
                name,
                category,
                description,
                price,
                priceUnit,
                status
            } = req.body;

            if (!vendorId) {
                return res.status(400).json({
                    success: false,
                    message: 'vendorId is required'
                });
            }

            const image = req.file
                ? `/uploads/services/${req.file.filename}`
                : '';

            const s = await Service.create({
                vendorEmail,
                vendorId,
                name,
                category,
                description,
                price,
                priceUnit,
                status,
                image
            });

            res.json({
                success: true,
                service: s
            });

        } catch (e) {
            console.error('CREATE SERVICE ERROR:', e);

            res.status(500).json({
                success: false,
                message: e.message
            });
        }
    }
);

router.put('/services/:id', async (req, res) => {
    try {
        const s = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!s) return res.status(404).json({ success: false, message: 'Service not found' });
        res.json({ success: true, service: s });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.delete('/services/:id', async (req, res) => {
    try {
        await Service.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ══════════════════════════════════════════════════════════
// BOOKINGS
// ══════════════════════════════════════════════════════════
router.get('/bookings', async (req, res) => {
    try {
        const { vendorEmail, status } = req.query;
        const q = { vendorEmail };
        if (status && status !== 'all') q.status = status;
        const bookings = await Booking.find(q).sort({ createdAt: -1 });
        res.json({ success: true, bookings });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.get('/bookings/:id', async (req, res) => {
    try {
        const b = await Booking.findById(req.params.id).populate('serviceId');
        if (!b) return res.status(404).json({ success: false, message: 'Booking not found' });
        res.json({ success: true, booking: b });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.patch('/bookings/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

        let systemText = '';
        if (status === 'accepted') {
            systemText = 'Vendor accepted this booking request. Please pay now to confirm the booking.';
        } else if (status === 'rejected') {
            systemText = 'Vendor rejected this booking request. Please choose another vendor if needed.';
        } else if (status === 'completed') {
            systemText = 'Vendor marked this booking as completed. Thank you for using the service.';
        }

        booking.status = status;
        booking.messages = systemText
            ? addBookingMessage(booking, 'system', systemText)
            : (Array.isArray(booking.messages) ? booking.messages : []);

        const updated = await booking.save();

        if (status === 'accepted' || status === 'rejected') {
            await Notification.create({
                userEmail: booking.organizerEmail,
                title: `Booking ${status === 'accepted' ? 'Accepted' : 'Rejected'}`,
                message: `Your vendor ${booking.vendorName || booking.vendorEmail} has ${status} your request for ${booking.serviceName}.`,
                type: 'booking',
                isRead: false,
                createdAt: new Date()
            });

            await sendNotificationEmail(
                booking.organizerEmail,
                `EventSphere: Booking ${status === 'accepted' ? 'Accepted' : 'Rejected'}`,
                `Hello ${booking.organizerName || 'Organizer'},\n\nYour booking request for ${booking.serviceName} with ${booking.vendorName || booking.vendorEmail} has been ${status}.\n\nVisit EventSphere to view the request details.`
            );
        }

        res.json({ success: true, booking: updated });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/bookings/:id/messages', async (req, res) => {
    try {
        const { message, sender = 'vendor' } = req.body;
        if (!message) return res.status(400).json({ success: false, message: 'Message is required' });
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

        booking.messages = addBookingMessage(booking, sender, message);
        const updated = await booking.save();
        res.json({ success: true, booking: updated });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.patch('/bookings/:id/complete', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

        booking.status = 'completed';
        booking.completedAt = new Date();
        booking.messages = addBookingMessage(booking, 'system', 'Vendor marked this booking as completed. Thank you for using the service.');

        const updated = await booking.save();
        res.json({ success: true, booking: updated });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.patch('/bookings/:id/pay', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

        booking.paymentStatus = 'paid';
        booking.messages = addBookingMessage(booking, 'system', 'Payment has been marked successful for this booking.');

        const updated = await booking.save();
        res.json({ success: true, booking: updated });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ══════════════════════════════════════════════════════════
// AVAILABILITY
// ══════════════════════════════════════════════════════════
router.get('/availability', async (req, res) => {
    try {
        let av = await Availability.findOne({ vendorEmail: ve(req) });
        if (!av) av = { availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], bookedDates: [] };
        // Attach upcoming accepted bookings as booked dates
        const bookings = await Booking.find({ vendorEmail: ve(req), status: 'accepted' }).select('eventDate eventName');
        res.json({ success: true, availability: av, upcomingBookings: bookings });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.put('/availability', async (req, res) => {
    try {
        const { vendorEmail, vendorId, availableDays } = req.body;
        const av = await Availability.findOneAndUpdate(
            { vendorEmail },
            { vendorEmail, vendorId, availableDays },
            { new: true, upsert: true }
        );
        res.json({ success: true, availability: av });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ══════════════════════════════════════════════════════════
// STATS (dashboard home)
// ══════════════════════════════════════════════════════════
router.get('/stats', async (req, res) => {
    try {
        const email = ve(req);
        const [activeServices, newRequests, completedBookings, revenueData] = await Promise.all([
            Service.countDocuments({ vendorEmail: email, status: 'active' }),
            Booking.countDocuments({ vendorEmail: email, status: 'pending' }),
            Booking.countDocuments({ vendorEmail: email, status: 'completed' }),
            Booking.aggregate([
                { $match: { vendorEmail: email, paymentStatus: 'paid' } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
        ]);
        res.json({
            success: true,
            stats: {
                activeServices,
                newRequests,
                completedBookings,
                totalRevenue: revenueData[0]?.total || 0,
            },
        });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ══════════════════════════════════════════════════════════
// PAYMENTS (vendor's paid bookings)
// ══════════════════════════════════════════════════════════
router.get('/payments', async (req, res) => {
    try {
        const bookings = await Booking.find({ vendorEmail: ve(req) }).sort({ createdAt: -1 });
        const paid = bookings.filter(b => b.paymentStatus === 'paid').reduce((s, b) => s + b.amount, 0);
        const pending = bookings.filter(b => b.paymentStatus !== 'paid').reduce((s, b) => s + b.amount, 0);
        res.json({ success: true, bookings, totalPaid: paid, totalPending: pending });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ══════════════════════════════════════════════════════════
// VENDOR PROFILE
// ══════════════════════════════════════════════════════════
router.get('/profile', async (req, res) => {
    try {
        const email = ve(req);
        let profile = await VendorProfile.findOne({ vendorEmail: email });
        res.json({ success: true, profile: profile || null });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.put('/profile', async (req, res) => {
    try {
        const { vendorEmail, vendorId, companyName, ownerName, phone, category,
            description, address, website, facebook, instagram, telegram, logo } = req.body;
        const profile = await VendorProfile.findOneAndUpdate(
            { vendorEmail },
            {
                vendorEmail, vendorId, companyName, ownerName, phone, category,
                description, address, website, facebook, instagram, telegram, logo
            },
            { new: true, upsert: true }
        );
        res.json({ success: true, profile });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ══════════════════════════════════════════════════════════
// PORTFOLIO / GALLERY
// ══════════════════════════════════════════════════════════
router.get('/portfolio', async (req, res) => {
    try {
        const profile = await VendorProfile.findOne({ vendorEmail: ve(req) });
        res.json({ success: true, portfolio: profile?.portfolio || [] });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/portfolio', async (req, res) => {
    try {
        const { vendorEmail, vendorId, url, caption } = req.body;
        if (!url) return res.status(400).json({ success: false, message: 'Image URL is required' });
        const profile = await VendorProfile.findOneAndUpdate(
            { vendorEmail },
            { $push: { portfolio: { url, caption: caption || '' } }, $setOnInsert: { vendorId } },
            { new: true, upsert: true }
        );
        res.json({ success: true, portfolio: profile.portfolio });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.delete('/portfolio/:itemId', async (req, res) => {
    try {
        const { vendorEmail } = req.body;
        const profile = await VendorProfile.findOneAndUpdate(
            { vendorEmail },
            { $pull: { portfolio: { _id: req.params.itemId } } },
            { new: true }
        );
        res.json({ success: true, portfolio: profile?.portfolio || [] });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ══════════════════════════════════════════════════════════
// REVIEWS & RATINGS
// ══════════════════════════════════════════════════════════
router.get('/reviews', async (req, res) => {
    try {
        const reviews = await Review.find({ vendorEmail: ve(req) }).sort({ createdAt: -1 });
        res.json({ success: true, reviews });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.post('/reviews', async (req, res) => {
    try {
        const { vendorEmail, vendorId, reviewerName, reviewerEmail, rating, comment, bookingId } = req.body;
        if (!rating || rating < 1 || rating > 5) return res.status(400).json({ success: false, message: 'Rating must be 1-5' });
        const review = await Review.create({ vendorEmail, vendorId, reviewerName, reviewerEmail, rating, comment, bookingId: bookingId || null });
        // Recalculate average rating
        const all = await Review.find({ vendorEmail });
        const avg = all.length ? (all.reduce((s, r) => s + r.rating, 0) / all.length) : 0;
        await VendorProfile.findOneAndUpdate(
            { vendorEmail },
            { averageRating: Math.round(avg * 10) / 10, totalReviews: all.length },
            { upsert: true }
        );
        res.json({ success: true, review });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.delete('/reviews/:id', async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
        // Recalculate average
        const all = await Review.find({ vendorEmail: review.vendorEmail });
        const avg = all.length ? (all.reduce((s, r) => s + r.rating, 0) / all.length) : 0;
        await VendorProfile.findOneAndUpdate(
            { vendorEmail: review.vendorEmail },
            { averageRating: all.length ? Math.round(avg * 10) / 10 : 0, totalReviews: all.length }
        );
        res.json({ success: true });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
