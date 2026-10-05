const path = require('path');
const dotenv = require('dotenv');
const express = require('express');
const axios = require('axios');
const QRCode = require('qrcode');
const Ticket = require('../models/Ticket');
const Notification = require('../models/Notification');
const transporter = require('../config/email');
const sendTicketEmail = require("../utils/sendTicketEmail");
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const router = express.Router();

const CHAPA_BASE = 'https://api.chapa.co/v1';
const CALLBACK_URL = 'http://localhost:5000/api/payment/verify';
const RETURN_URL = 'http://localhost:5174/payment-success'; // user-app port

// ─────────────────────────────────────────────────────────
// POST /api/payment/initialize
// Body: { amount, email, firstName, lastName, eventId, eventTitle, eventDate, eventVenue, userId, userName }
// Returns: { checkout_url, tx_ref }
// ─────────────────────────────────────────────────────────
router.post('/initialize', async (req, res) => {
    try {
        const {
            amount, email, firstName, lastName,
            eventId, eventTitle, eventDate, eventVenue,
            userId, userName,
        } = req.body;

        if (!amount || !firstName || !lastName) {
            return res.status(400).json({ success: false, message: 'amount, firstName, lastName are required.' });
        }

        // Phone-only users may not have a real email — generate a safe fallback
        const safeEmail = (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            ? email
            : `user${Date.now()}@eventsphere.com`;

        // Sanitize eventId for tx_ref (Chapa requires alphanumeric + hyphens only)
        const safeEventId = String(eventId || 0).replace(/[^a-zA-Z0-9]/g, '');
        const shortEventId = safeEventId.slice(0, 12) || 'event';
        const txRef = `EVT-${shortEventId}-${Date.now().toString().slice(-6)}`;

        // Save pending ticket in DB
        await Ticket.create({
            txRef,
            userId: userId || null,
            userEmail: safeEmail,
            userName: `${firstName} ${lastName}`,
            eventId: String(eventId || 0),
            eventTitle: eventTitle || 'Event Ticket',
            eventDate: eventDate || '',
            eventVenue: eventVenue || '',
            amount: Number(amount),
            status: 'pending',
        });

        // Initialize with Chapa
        const chapaRes = await axios.post(
            `${CHAPA_BASE}/transaction/initialize`,
            {
                amount: String(amount),
                currency: 'ETB',
                email: safeEmail,
                first_name: firstName,
                last_name: lastName,
                tx_ref: txRef,
                callback_url: CALLBACK_URL,
                return_url: `${RETURN_URL}?tx_ref=${txRef}`,
                customization: {
                    title: 'EventSphere',       // max 16 chars — Chapa limit
                    description: 'Ticket purchase',
                },
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        res.json({
            success: true,
            checkout_url: chapaRes.data.data?.checkout_url,
            tx_ref: txRef,
        });

    } catch (err) {
        const chapaError = err.response?.data;
        const status = err.response?.status;
        console.error('Chapa init error:', chapaError || err.message);

        let message = 'Payment initialization failed.';
        if (!process.env.CHAPA_SECRET_KEY) {
            message = 'CHAPA_SECRET_KEY is not set in .env';
        } else if (status === 401 || status === 403) {
            message = 'Invalid Chapa API key. Check CHAPA_SECRET_KEY in .env';
        } else if (status === 422) {
            message = 'Invalid payment data sent to Chapa.';
        } else if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
            message = 'Cannot reach Chapa API. Check your internet connection.';
        }

        res.status(500).json({
            success: false,
            message,
            detail: chapaError || err.message
        });
    }
});

// ─────────────────────────────────────────────────────────
// GET /api/payment/verify?tx_ref=...   (Chapa callback + manual check)
// ─────────────────────────────────────────────────────────
router.get('/verify', async (req, res) => {
    const { tx_ref } = req.query;
    if (!tx_ref) return res.status(400).json({ success: false, message: 'tx_ref required.' });

    try {
        // Verify with Chapa
        const chapaRes = await axios.get(
            `${CHAPA_BASE}/transaction/verify/${tx_ref}`,
            {
                headers: { Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}` },
            }
        );

        const chapaData = chapaRes.data?.data;
        const isPaid = chapaData?.status === 'success';

        const ticket = await Ticket.findOne({ txRef: tx_ref });
        if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found.' });

        if (isPaid && ticket.status !== 'paid') {
            // Generate unique ticket code
            const ticketCode = `TKT-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

            // Generate QR Code (contains ticket code + event info)
            const qrData = JSON.stringify({
                ticketCode,
                event: ticket.eventTitle,
                holder: ticket.userName,
                email: ticket.userEmail,
                date: ticket.eventDate,
                venue: ticket.eventVenue,
            });
            const qrCode = await QRCode.toDataURL(qrData);

            ticket.status = 'paid';
            ticket.ticketCode = ticketCode;
            ticket.qrCode = qrCode;
            ticket.paymentMethod = "Chapa";
            ticket.paidAt = new Date();

            await ticket.save();
            console.log("================================");
console.log("Recipient Email:", ticket.userEmail);
console.log("Recipient Name :", ticket.userName);
console.log("================================");
            await sendTicketEmail({
    email: ticket.userEmail,
    userName: ticket.userName,
    eventName: ticket.eventTitle,
    eventDate: ticket.eventDate,
    venue: ticket.eventVenue,
    ticketId: ticket.ticketCode,
    qrCode: ticket.qrCode,
});

            await Notification.create({
                userEmail: ticket.userEmail,
                title: 'Ticket Purchased',
                message: `Your ticket for ${ticket.eventTitle} has been confirmed. Ticket ID: ${ticketCode}.`,
                type: 'ticket',
                isRead: false,
                createdAt: new Date(),
            });
        } else if (!isPaid) {
            ticket.status = 'failed';
            await ticket.save();
        }

        res.json({
            success: true,
            paid: ticket.status === 'paid',
            ticket,
        });

    } catch (err) {
        console.error('Chapa verify error:', err.response?.data || err.message);
        res.status(500).json({ success: false, message: 'Payment verification failed.' });
    }
});

// ─────────────────────────────────────────────────────────
// GET /api/payment/ticket/:txRef  — fetch ticket details
// ─────────────────────────────────────────────────────────
router.get('/ticket/:txRef', async (req, res) => {
    try {
        const ticket = await Ticket.findOne({ txRef: req.params.txRef });
        if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found.' });
        res.json({ success: true, ticket });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─────────────────────────────────────────────────────────
// GET /api/payment/my-tickets?email=...  — list user tickets
// ─────────────────────────────────────────────────────────
router.get('/my-tickets', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) return res.status(400).json({ success: false, message: 'email required.' });
        const tickets = await Ticket.find({ userEmail: email, status: 'paid' }).sort({ createdAt: -1 });
        res.json({ success: true, tickets });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
