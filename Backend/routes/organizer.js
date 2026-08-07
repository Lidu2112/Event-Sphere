const express = require('express');
const axios = require('axios');
const transporter = require('../config/email');
const router = express.Router();
const OrganizerEvent = require('../models/OrganizerEvent');
const Ticket = require('../models/Ticket');
const User = require('../models/user');
const Booking = require('../models/Booking');
const Notification = require("../models/Notification");
const CHAPA_BASE = 'https://api.chapa.co/v1';
const CHAPA_RETURN_URL = 'http://localhost:5173/organizer/manage-vendors';

function oe(req) { return req.query.organizerEmail || req.body?.organizerEmail || ''; }

function toBookingPayload(booking) {
    if (!booking) return booking;
    if (typeof booking.toObject === 'function') return booking.toObject();
    return { ...booking };
}

function addBookingMessage(booking, sender, text) {
    const messages = Array.isArray(booking?.messages) ? booking.messages : [];
    messages.push({
        sender,
        text,
        createdAt: new Date().toISOString()
    });
    return messages;
}

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
        console.error('Failed to send notification email:', err?.message || err);
    }
}

// ══════════════════════════════════════════════════════════
// EVENTS — CRUD
// ══════════════════════════════════════════════════════════
router.get('/events', async (req, res) => {
    try {
        const events = await OrganizerEvent.find({ organizerEmail: oe(req) }).sort({ createdAt: -1 });
        res.json({ success: true, events });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});
router.post('/events', async (req, res) => {
    try {
        console.log("Incoming body:", req.body);

        const {
            organizerEmail,
            organizerId,
            title,
            description,
            venue,
            date,
            time,
            ticketPrice,
            capacity,
            category,
            banner
        } = req.body;

        console.log("Banner received:", banner);

        const event = await OrganizerEvent.create({
            organizerEmail,
            organizerId,
            title,
            description,
            venue,
            date,
            time,
            ticketPrice: Number(ticketPrice) || 0,
            capacity: Number(capacity) || 100,
            category,
            banner,
            published: true
        });


await Notification.create({
    userEmail: organizerEmail,
    title: "New Event",
    message: `Your event "${title}" was created successfully.`,
    type: "event",
    isRead: false,
    createdAt: new Date()
});


        console.log("Saved event:", event);

        res.json({ success: true, event });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, message: e.message });
    }
});

router.put('/events/:id', async (req, res) => {
    try {

        const {
            title,
            description,
            venue,
            date,
            time,
            ticketPrice,
            capacity,
            category,
            banner
        } = req.body;

        const event = await OrganizerEvent.findByIdAndUpdate(
            req.params.id,
            {
                title,
                description,
                venue,
                date,
                time,
                ticketPrice: Number(ticketPrice) || 0,
                capacity: Number(capacity) || 100,
                category,
                banner
            },
            { new: true }
        );

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found"
            });
        }

        res.json({
            success: true,
            event
        });

    } catch (e) {
        res.status(500).json({
            success: false,
            message: e.message
        });
    }
});

router.patch('/events/:id/publish', async (req, res) => {
    try {
        const event = await OrganizerEvent.findById(req.params.id);
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
        event.published = !event.published;
        await event.save();
        res.json({ success: true, event });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.delete('/events/:id', async (req, res) => {
    try {
        await OrganizerEvent.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ══════════════════════════════════════════════════════════
// TICKETS — sold tickets for organizer's events
// ══════════════════════════════════════════════════════════
router.get('/tickets', async (req, res) => {
    try {
        const events = await OrganizerEvent.find({ organizerEmail: oe(req) }).select('_id title ticketPrice');
        const eventTitles = events.map(e => e.title);
        const eventIds = events.map(e => e._id.toString());
        // Match by title OR by eventId (covers both static-event tickets and DB-event tickets)
        const tickets = await Ticket.find({
            $or: [
                { eventTitle: { $in: eventTitles } },
                { eventId: { $in: eventIds } },
            ],
            status: 'paid',
        }).sort({ createdAt: -1 });
        res.json({ success: true, tickets });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ══════════════════════════════════════════════════════════
// ATTENDEES — checked-in and not for organizer's events
// ══════════════════════════════════════════════════════════
router.get('/attendees', async (req, res) => {
    try {
        const { search } = req.query;
        const events = await OrganizerEvent.find({ organizerEmail: oe(req) }).select('_id title');
        const eventTitles = events.map(e => e.title);
        const eventIds = events.map(e => e._id.toString());
        // Match by title OR by eventId
        let baseQuery = {
            $or: [
                { eventTitle: { $in: eventTitles } },
                { eventId: { $in: eventIds } },
            ],
            status: 'paid',
        };
        let query = baseQuery;
        if (search) {
            query = {
                ...baseQuery,
                $and: [
                    baseQuery,
                    {
                        $or: [
                            { userName: { $regex: search, $options: 'i' } },
                            { userEmail: { $regex: search, $options: 'i' } },
                            { ticketCode: { $regex: search, $options: 'i' } },
                        ],
                    },
                ],
            };
        }
        const tickets = await Ticket.find(query).sort({ createdAt: -1 });
        res.json({ success: true, attendees: tickets });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

router.patch('/attendees/:ticketId/checkin', async (req, res) => {
    try {
        const ticket = await Ticket.findByIdAndUpdate(
            req.params.ticketId,
            { checkedIn: true, checkedInAt: new Date() },
            { new: true }
        );
        if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
        res.json({ success: true, ticket });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ══════════════════════════════════════════════════════════
// VENDORS — fetch available vendors from Service/VendorProfile
// ══════════════════════════════════════════════════════════
router.get('/vendors', async (req, res) => {
    try {
        const { search } = req.query;
        let query = { role: 'vendor' };
        if (search) query.$or = [
            { name: { $regex: search, $options: 'i' } },
        ];
        const vendorUsers = await User.find(query).select('-password').sort({ name: 1 });
        res.json({ success: true, vendors: vendorUsers });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ══════════════════════════════════════════════════════════
// VENDOR BOOKINGS — organizer requests sent to vendors
// ══════════════════════════════════════════════════════════
router.get('/vendor-bookings', async (req, res) => {
    try {
        const bookings = await Booking.find({ organizerEmail: oe(req) }).sort({ createdAt: -1 });
        res.json({ success: true, bookings });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

router.post('/vendor-bookings', async (req, res) => {
    try {
        const {
            organizerEmail,
            organizerId,
            organizerName,
            vendorEmail,
            vendorId,
            vendorName,
            serviceName,
            eventName,
            eventDate,
            eventTime,
            location,
            amount,
            notes,
        } = req.body;

        if (!organizerEmail || !vendorEmail) {
            return res.status(400).json({
                success: false,
                message: 'organizerEmail and vendorEmail are required'
            });
        }

        const booking = await Booking.create({
            organizerEmail,
            organizerId,
            organizerName: organizerName || organizerEmail,
            vendorEmail,
            vendorId,
            vendorName: vendorName || vendorEmail,
            serviceName: serviceName || 'Service Request',
            eventName: eventName || 'Organizer Booking Request',
            eventDate: eventDate || '',
            eventTime: eventTime || '',
            location: location || '',
            clientName: organizerName || organizerEmail,
            clientEmail: organizerEmail,
            amount: Number(amount) || 0,
            paymentStatus: 'pending',
            status: 'pending',
            notes: notes || '',
            requestedBy: 'organizer',
            messages: [],
        });

        await Notification.create({
            userEmail: vendorEmail,
            title: 'New Booking Request',
            message: `You have a new booking request from ${organizerName || organizerEmail} for ${serviceName || 'a service'}.`,
            type: 'booking',
            isRead: false,
            createdAt: new Date(),
        });

        await Promise.all([
            sendNotificationEmail(
                vendorEmail,
                'EventSphere: New Booking Request',
                `Hello ${vendorName || 'Vendor'},\n\nYou have a new booking request from ${organizerName || organizerEmail} for ${serviceName || 'a service'} on ${eventDate || 'an upcoming date'} at ${eventTime || 'an upcoming time'} located at ${location || 'an unspecified location'}.\n\nNotes: ${notes || 'No additional notes.'}\n\nPlease log in to EventSphere to review the request.`
            ),
            sendNotificationEmail(
                organizerEmail,
                'EventSphere: Booking Request Sent',
                `Hello ${organizerName || 'Organizer'},\n\nYour request to book ${vendorName || vendorEmail} has been sent successfully. The vendor has been notified and will respond soon.`
            )
        ]);

        res.json({ success: true, booking });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

router.patch('/vendor-bookings/:id/pay', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

        if (booking.paymentStatus === 'paid') {
            return res.json({ success: true, booking: toBookingPayload(booking) });
        }

        const bookingIdRaw = String(booking._id || booking.id || req.params.id || 'booking').replace(/[^a-zA-Z0-9]/g, '');
        const shortBookingId = bookingIdRaw.slice(0, 12) || 'booking';
        const txRef = `VBOOK-${shortBookingId}-${Date.now().toString().slice(-6)}`;
        const amount = Math.max(1, Number(booking.amount) || 1);
        const organizerName = booking.organizerName || booking.clientName || 'Organizer';
        const [firstName, ...lastNameParts] = organizerName.split(' ');
        const lastName = lastNameParts.join(' ') || 'User';
        const bookingId = booking._id || booking.id || req.params.id;
        const rawEmail = booking.clientEmail || booking.organizerEmail || 'organizer@eventsphere.com';
        const safeEmail = String(rawEmail).trim().toLowerCase();
        const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(safeEmail)
            ? safeEmail
            : `organizer${Date.now()}@eventsphere.com`;

        booking.paymentTxRef = txRef;
        booking.paymentStatus = 'pending';
        booking.status = booking.status === 'pending' ? 'accepted' : booking.status;
        booking.messages = addBookingMessage(booking, 'system', 'Organizer started Chapa payment for this booking. Complete the payment to confirm the booking.');
        await booking.save();

        const chapaRes = await axios.post(
            `${CHAPA_BASE}/transaction/initialize`,
            {
                amount: String(amount),
                currency: 'ETB',
                email: validEmail,
                first_name: (firstName || 'Organizer').trim(),
                last_name: (lastName || 'User').trim(),
                tx_ref: txRef,
                callback_url: `http://localhost:5000/api/organizer/vendor-bookings/verify?bookingId=${bookingId}&tx_ref=${txRef}`,
                return_url: `http://localhost:5000/api/organizer/vendor-bookings/verify?bookingId=${bookingId}&tx_ref=${txRef}&source=browser`,
                customization: {
                    title: 'EventSphere',
                    description: 'Vendor booking payment',
                },
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const updated = await Booking.findById(req.params.id);
        res.json({
            success: true,
            booking: toBookingPayload(updated),
            checkout_url: chapaRes.data?.data?.checkout_url || null,
            tx_ref: txRef,
            message: 'Redirecting to Chapa for payment.',
        });
    } catch (e) {
        const chapaError = e.response?.data;
        const status = e.response?.status;
        let message = 'Payment initialization failed.';
        if (!process.env.CHAPA_SECRET_KEY) {
            message = 'CHAPA_SECRET_KEY is not set in .env';
        } else if (status === 401 || status === 403) {
            message = 'Invalid Chapa API key. Check CHAPA_SECRET_KEY in .env';
        } else if (status === 422) {
            message = 'Invalid payment data sent to Chapa.';
        } else if (e.code === 'ECONNREFUSED' || e.code === 'ENOTFOUND') {
            message = 'Cannot reach Chapa API. Check your internet connection.';
        }
        res.status(500).json({ success: false, message, detail: chapaError || e.message });
    }
});

router.get('/vendor-bookings/verify', async (req, res) => {
    try {
        const txRef = req.query.tx_ref || req.query.txref || req.query.reference || req.query.transaction_id || req.query.transactionId || req.query.txRef;
        const bookingId = req.query.bookingId;

        if (!txRef && !bookingId) {
            return res.status(400).json({ success: false, message: 'tx_ref or bookingId required.' });
        }

        let booking = null;
        if (txRef) {
            booking = await Booking.findOne({ paymentTxRef: txRef });
        }
        if (!booking && bookingId) {
            booking = await Booking.findById(bookingId);
        }

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found.' });
        }

        let isPaid = false;
        let chapaData = null;
        const txRefToVerify = txRef || booking.paymentTxRef;
        if (txRefToVerify) {
            const chapaRes = await axios.get(`${CHAPA_BASE}/transaction/verify/${txRefToVerify}`, {
                headers: { Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}` },
            });
            chapaData = chapaRes.data?.data;
            const statusString = String(chapaData?.status || chapaData?.transaction_status || chapaData?.status_detail || '').toLowerCase();
            isPaid = statusString === 'success' || statusString === 'successful' || statusString === 'paid';
        } else {
            isPaid = booking.paymentStatus === 'paid';
        }

        if (isPaid) {
            booking.paymentStatus = 'paid';
            booking.status = booking.status === 'pending' ? 'accepted' : booking.status;
            booking.paymentVerifiedAt = new Date();
            booking.messages = addBookingMessage(booking, 'system', 'Chapa payment succeeded. The vendor has been notified and the booking is confirmed.');

            await Notification.create({
                userEmail: booking.vendorEmail,
                title: 'Payment Completed',
                message: `Organizer payment for ${booking.serviceName} has been completed. Please proceed with the booking.`,
                type: 'booking',
                isRead: false,
                createdAt: new Date(),
            });

            await sendNotificationEmail(
                booking.vendorEmail,
                'EventSphere: Payment Completed',
                `Hello ${booking.vendorName || 'Vendor'},\n\nPayment has been successfully processed for the booking request from ${booking.organizerName || booking.organizerEmail}. Please check your booking dashboard.`
            );
        } else {
            booking.paymentStatus = 'failed';
            booking.messages = addBookingMessage(booking, 'system', 'Chapa payment could not be verified. Please try again.');
        }

        await booking.save();

        const redirectUrl = `http://localhost:5173/organizer/manage-vendors?payment=${isPaid ? 'success' : 'failed'}&bookingId=${booking._id || booking.id || bookingId}`;
        res.redirect(redirectUrl);
    } catch (e) {
        console.error('Vendor booking verify error:', e?.response?.data || e.message || e);
        res.status(500).json({ success: false, message: e.message });
    }
});

router.patch('/vendor-bookings/:id/complete', async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

        booking.status = 'completed';
        booking.completedAt = new Date();
        booking.messages = addBookingMessage(booking, 'system', 'Organizer confirmed this booking as completed.');
        const updated = await booking.save();

        res.json({ success: true, booking: updated });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

router.post('/vendor-bookings/:id/messages', async (req, res) => {
    try {
        const { message, sender = 'organizer' } = req.body;
        if (!message) return res.status(400).json({ success: false, message: 'Message is required' });

        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

        booking.messages = addBookingMessage(booking, sender, message);
        await booking.save();
        const updated = await Booking.findById(req.params.id);

        res.json({ success: true, booking: toBookingPayload(updated) });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

// ══════════════════════════════════════════════════════════
// STAFF — users with role=event-staff
// ══════════════════════════════════════════════════════════
router.get('/staff', async (req, res) => {
    try {
        const staff = await User.find({ role: 'event-staff' }).select('-password').sort({ name: 1 });
        res.json({ success: true, staff });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ══════════════════════════════════════════════════════════
// ANALYTICS — aggregate stats for organizer
// ══════════════════════════════════════════════════════════
router.get('/analytics', async (req, res) => {
    try {
        const events = await OrganizerEvent.find({ organizerEmail: oe(req) });
        const eventTitles = events.map(e => e.title);
        const eventIds = events.map(e => e._id.toString());
        const tickets = await Ticket.find({
            $or: [{ eventTitle: { $in: eventTitles } }, { eventId: { $in: eventIds } }],
            status: 'paid',
        });
        const totalRevenue = tickets.reduce((s, t) => s + (t.amount || 0), 0);
        const totalTicketsSold = tickets.length;
        const totalAttendance = tickets.filter(t => t.checkedIn).length;
        const popularEvents = events.map(ev => ({
            id: ev._id,
            title: ev.title,
            sold: tickets.filter(t => t.eventTitle === ev.title || t.eventId === ev._id.toString()).length,
            revenue: tickets.filter(t => t.eventTitle === ev.title || t.eventId === ev._id.toString()).reduce((s, t) => s + (t.amount || 0), 0),
        })).sort((a, b) => b.sold - a.sold);
        res.json({ success: true, totalRevenue, totalTicketsSold, totalAttendance, popularEvents });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ══════════════════════════════════════════════════════════
// DASHBOARD STATS
// ══════════════════════════════════════════════════════════
router.get('/stats', async (req, res) => {
    try {
        const email = oe(req);
        const events = await OrganizerEvent.find({ organizerEmail: email });
        const publishedEvents = events.filter(e => e.published).length;
        const eventTitles = events.map(e => e.title);
        const eventIds = events.map(e => e._id.toString());
        const tickets = await Ticket.find({
            $or: [{ eventTitle: { $in: eventTitles } }, { eventId: { $in: eventIds } }],
            status: 'paid',
        });
        const totalRevenue = tickets.reduce((s, t) => s + (t.amount || 0), 0);
        const staffCount = await User.countDocuments({ role: 'event-staff' });
        res.json({
            success: true,
            stats: {
                totalEvents: events.length,
                publishedEvents,
                ticketsSold: tickets.length,
                totalAttendees: tickets.filter(t => t.checkedIn).length,
                revenue: totalRevenue,
                staffMembers: staffCount,
                averageRating: '4.7',
            }
        });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
