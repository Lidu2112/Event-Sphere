const express = require('express');
const router = express.Router();
const OrganizerEvent = require('../models/OrganizerEvent');
const Ticket = require('../models/Ticket');

const CATEGORY_COLORS = {
    Concert: '#8b5cf6', Music: '#8b5cf6', Conference: '#0ea5e9', Business: '#0ea5e9',
    Sports: '#10b981', Exhibition: '#f59e0b', Art: '#f59e0b', Workshop: '#06b6d4',
    Festival: '#ec4899', Wedding: '#ec4899', Food: '#ef4444', Networking: '#64748b',
    Cultural: '#f97316', Seminar: '#6366f1', Webinar: '#8b5cf6',
};

function normalizeEvent(ev, soldCount) {
    const price = ev.ticketPrice === 0 ? 'Free' : `ETB ${ev.ticketPrice.toLocaleString()}`;
    return {
        id: ev._id.toString(),
        title: ev.title,
        location: ev.venue,
        date: ev.date,
        time: ev.time || '',
        price,
        ticketPrice: ev.ticketPrice,
        badge: ev.category || 'Event',
        badgeColor: CATEGORY_COLORS[ev.category] || '#6366f1',
        img: ev.banner || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80',
        organizer: ev.organizerEmail,
        capacity: ev.capacity,
        sold: soldCount,
        description: ev.description || '',
        highlights: [],
        tags: [ev.category].filter(Boolean),
        source: 'db',
        organizerEmail: ev.organizerEmail,
    };
}

// GET /api/events — only published DB events (no static events)
router.get('/', async (req, res) => {
    try {
        const { search, category } = req.query;
        const dbEvents = await OrganizerEvent.find({ published: true }).sort({ createdAt: -1 });

        const normalized = await Promise.all(dbEvents.map(async ev => {
            const soldCount = await Ticket.countDocuments({ eventTitle: ev.title, status: 'paid' });
            return normalizeEvent(ev, soldCount);
        }));

        let all = normalized;

        if (search) {
            const s = search.toLowerCase();
            all = all.filter(e => e.title.toLowerCase().includes(s) || e.location.toLowerCase().includes(s));
        }
        if (category && category !== 'All Categories') {
            all = all.filter(e => e.badge === category);
        }

        res.json({ success: true, events: all });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// GET /api/events/:id — single DB event by MySQL id
router.get('/:id', async (req, res) => {
    try {
        const ev = await OrganizerEvent.findById(req.params.id);
        if (!ev) return res.status(404).json({ success: false, message: 'Event not found' });
        const soldCount = await Ticket.countDocuments({ eventTitle: ev.title, status: 'paid' });
        res.json({ success: true, event: normalizeEvent(ev, soldCount) });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
