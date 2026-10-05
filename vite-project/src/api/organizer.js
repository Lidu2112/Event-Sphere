const BASE = 'http://localhost:5000/api/organizer';

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

function q(email, extra = {}) {
    return '?' + new URLSearchParams({ organizerEmail: email, ...extra });
}

export const organizerApi = {
    getStats: email => req('GET', `/stats${q(email)}`),
    // Events
    getEvents: email => req('GET', `/events${q(email)}`),
    createEvent: body => req('POST', '/events', body),
    updateEvent: (id, body) => req('PUT', `/events/${id}`, body),
    togglePublish: id => req('PATCH', `/events/${id}/publish`),
    deleteEvent: id => req('DELETE', `/events/${id}`),
    // Tickets
    getTickets: email => req('GET', `/tickets${q(email)}`),
    // Attendees
    getAttendees: (email, search = '') => req('GET', `/attendees${q(email, search ? { search } : {})}`),
    checkInAttendee: ticketId => req('PATCH', `/attendees/${ticketId}/checkin`),
    // Vendors
    getVendors: (email, search = '') => req('GET', `/vendors${q(email, search ? { search } : {})}`),
    getVendorBookings: email => req('GET', `/vendor-bookings${q(email)}`),
    createVendorBooking: body => req('POST', '/vendor-bookings', body),
    payVendorBooking: id => req('PATCH', `/vendor-bookings/${id}/pay`),
    completeVendorBooking: id => req('PATCH', `/vendor-bookings/${id}/complete`),
    sendVendorBookingMessage: (id, body) => req('POST', `/vendor-bookings/${id}/messages`, body),
    // Staff
    getStaff: email => req('GET', `/staff${q(email)}`),
    // Analytics
    getAnalytics: email => req('GET', `/analytics${q(email)}`),
};
