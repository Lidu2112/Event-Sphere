const path = require('path');
const dotenv = require('dotenv');
const express = require('express');
const axios = require('axios');
const QRCode = require('qrcode');
const Ticket = require('../models/Ticket');
const Notification = require('../models/Notification');
const sendTicketEmail = require("../utils/sendTicketEmail");
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const router = express.Router();

const CHAPA_BASE = 'https://api.chapa.co/v1';

const CALLBACK_URL = `${process.env.BACKEND_URL}/api/payment/verify`;
const RETURN_URL = `${process.env.FRONTEND_URL}/payment-success`;
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
    const tx_ref = String(req.query.tx_ref || '');

    if (!tx_ref) {
        return res.status(400).json({
            success: false,
            message: 'tx_ref required.',
        });
    }

    if (!process.env.CHAPA_SECRET_KEY) {
        return res.status(500).json({
            success: false,
            message: 'Payment verification is not configured.',
        });
    }

    try {
        // 1. Verify payment with Chapa, with a timeout.
        const chapaRes = await axios.get(
            `${CHAPA_BASE}/transaction/verify/${encodeURIComponent(tx_ref)}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
                },
                timeout: 15000,
            }
        );

        const chapaData = chapaRes.data?.data;

        if (chapaData?.status !== 'success' &&
            chapaData?.status !== 'failed') {
            return res.json({
                success: true,
                paid: false,
                status: chapaData?.status || 'pending',
                message: 'Payment is not confirmed yet.',
            });
        }

        // 2. Find the existing ticket.
        const ticket = await Ticket.findOne({ txRef: tx_ref });

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found.',
            });
        }

        // 3. Only mark the ticket paid after Chapa confirms it.
        if (chapaData.status === 'success') {
            if (ticket.status !== 'paid') {
                // Check the transaction reference returned by Chapa.
                if (chapaData.tx_ref && chapaData.tx_ref !== tx_ref) {
                    return res.status(400).json({
                        success: false,
                        message: 'Transaction reference mismatch.',
                    });
                }

                // Check amount before accepting payment.
                if (
                    chapaData.amount != null &&
                    Number(chapaData.amount) !== Number(ticket.amount)
                ) {
                    return res.status(400).json({
                        success: false,
                        message: 'Payment amount mismatch.',
                    });
                }

                const ticketCode =
                    `TKT-${Date.now()}-${Math.random()
                        .toString(36)
                        .substring(2, 7)
                        .toUpperCase()}`;

                const qrData = JSON.stringify({
                    ticketCode,
                    event: ticket.eventTitle,
                    holder: ticket.userName,
                    email: ticket.userEmail,
                    date: ticket.eventDate,
                    venue: ticket.eventVenue,
                });

                ticket.ticketCode = ticketCode;
                ticket.qrCode = await QRCode.toDataURL(qrData);
                ticket.paymentMethod = 'Chapa';
                ticket.paidAt = new Date();
                ticket.status = 'paid';

                await ticket.save();

                console.log('Ticket marked paid:', tx_ref);

                try {
                    await Notification.create({
                        userEmail: ticket.userEmail,
                        title: 'Ticket Purchased',
                        message: `Your ticket for ${ticket.eventTitle} has been confirmed. Ticket ID: ${ticketCode}.`,
                        type: 'ticket',
                        isRead: false,
                        createdAt: new Date(),
                    });
                } catch (notificationError) {
                    console.error(
                        'NOTIFICATION FAILED:',
                        notificationError.message
                    );
                }
            }

            // 4. Retry email on later verification requests if needed.
            if (ticket.emailSent !== true) {
                try {
                  setImmediate(async () => {
    try {
        await sendTicketEmail({
            email: ticket.userEmail,
            userName: ticket.userName,
            eventName: ticket.eventTitle,
            eventDate: ticket.eventDate,
            venue: ticket.eventVenue,
            ticketId: ticket.ticketCode,
            qrCode: ticket.qrCode,
        });

        console.log("Ticket email sent:", ticket.userEmail);
    } catch (err) {
        console.error("Background email error:", err);
    }
});

                    ticket.emailSent = true;
                    await ticket.save();

                    console.log('Ticket email sent for:', tx_ref);
                } catch (emailError) {
                    console.error(
                        'TICKET EMAIL FAILED:',
                        emailError.message
                    );
                    // Payment remains paid even if email sending fails.
                }
            }
        } else if (ticket.status !== 'paid') {
            ticket.status = 'failed';
            await ticket.save();
        }

        // 5. Return the payment result without waiting on another email call.
        return res.json({
            success: true,
            paid: ticket.status === 'paid',
            ticket,
        });
    } catch (err) {
        console.error(
            'PAYMENT VERIFICATION ERROR:',
            err.response?.data || err.message
        );

        return res.status(500).json({
            success: false,
            message: 'Payment verification failed.',
        });
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
