const BASE = 'http://localhost:5000/api/attendee';

async function req(method, path, body) {
    const res = await fetch(`${BASE}${path}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    if (!data.success && res.status >= 400) throw new Error(data.message || 'Request failed');
    return data;
}

function normalizeTickets(rawTickets = []) {
    return (rawTickets || []).map((ticket, index) => ({
        ...ticket,
        ticketId: ticket.ticketId || ticket.ticketCode || ticket.txRef || `TKT-${index + 1}`,
        eventName: ticket.eventName || ticket.eventTitle || 'Event Ticket',
        eventDate: ticket.eventDate || '',
        venue: ticket.venue || ticket.eventVenue || '',
        ticketType: ticket.ticketType || 'General',
        status: ticket.status === 'paid' ? 'confirmed' : (ticket.status || 'confirmed'),
        qrCode: ticket.qrCode || null,
    }));
}

function normalizePurchases(rawTickets = []) {
    return (rawTickets || []).map(ticket => ({
        ...ticket,
        eventName: ticket.eventName || ticket.eventTitle || 'Event Ticket',
        serviceName: ticket.serviceName || ticket.ticketType || 'General Ticket',
        eventDate: ticket.eventDate || '',
        amount: ticket.amount || 0,
        status: 'completed',
        paymentStatus: 'paid',
        txRef: ticket.txRef || ticket.ticketId || ticket.ticketCode,
    }));
}

export const attendeeApi = {
    getStats: (userId, userEmail) =>
        req('GET', `/stats?userId=${encodeURIComponent(userId)}&userEmail=${encodeURIComponent(userEmail)}`),
    getProfile: userId => req('GET', `/profile?userId=${encodeURIComponent(userId)}`),
    updateProfile: body => req('PUT', '/profile', body),
    changePassword: body => req('PUT', '/profile/password', body),
    getTickets: async userEmail => {
        try {
            const data = await req('GET', `/tickets?userEmail=${encodeURIComponent(userEmail)}`);
            return { success: true, tickets: normalizeTickets(data?.tickets || []) };
        } catch (err) {
            console.warn('Attendee ticket lookup failed, trying payment fallback.', err.message);
            try {
                const fallback = await req('GET', `/payment/my-tickets?email=${encodeURIComponent(userEmail)}`);
                return { success: true, tickets: normalizeTickets(fallback?.tickets || []) };
            } catch (fallbackErr) {
                console.warn('Payment fallback lookup failed.', fallbackErr.message);
                return { success: true, tickets: [] };
            }
        }
    },
    getPurchases: async userEmail => {
        try {
            const data = await req('GET', `/purchases?userEmail=${encodeURIComponent(userEmail)}`);
            const bookings = normalizePurchases(data?.bookings || []);
            return { success: true, bookings, totalSpent: data?.totalSpent || bookings.reduce((sum, item) => sum + (item.amount || 0), 0) };
        } catch (err) {
            console.warn('Attendee purchase lookup failed, trying payment fallback.', err.message);
            try {
                const fallback = await req('GET', `/payment/my-tickets?email=${encodeURIComponent(userEmail)}`);
                const bookings = normalizePurchases(fallback?.tickets || []);
                return { success: true, bookings, totalSpent: bookings.reduce((sum, item) => sum + (item.amount || 0), 0) };
            } catch (fallbackErr) {
                console.warn('Payment fallback purchase lookup failed.', fallbackErr.message);
                return { success: true, bookings: [], totalSpent: 0 };
            }
        }
    },
    getFavorites: userId => req('GET', `/favorites?userId=${encodeURIComponent(userId)}`),
    addFavorite: body => req('POST', '/favorites', body),
    removeFavorite: (eventId, userId) => req('DELETE', `/favorites/${eventId}`, { userId }),
    getNotifications: userId => req('GET', `/notifications?userId=${encodeURIComponent(userId)}`),
    markRead: (notifId, userId) => req('PATCH', `/notifications/${notifId}/read`, { userId }),
    markAllRead: userId => req('PATCH', '/notifications/read-all', { userId }),
};
