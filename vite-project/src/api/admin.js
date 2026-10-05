const BASE = 'http://localhost:5000/api/admin';

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

export const api = {
    // Stats
    getStats: () => req('GET', '/stats'),

    // Users
    getUsers: (params = {}) => req('GET', '/users?' + new URLSearchParams(params)),
    getUser: id => req('GET', `/users/${id}`),
    createUser: body => req('POST', '/users', body),
    updateUser: (id, body) => req('PUT', `/users/${id}`, body),
    setUserStatus: (id, status) => req('PATCH', `/users/${id}/status`, { status }),
    deleteUser: id => req('DELETE', `/users/${id}`),

    // Organizers
    getOrganizers: (params = {}) => req('GET', '/organizers?' + new URLSearchParams(params)),
    approveOrganizer: id => req('PATCH', `/organizers/${id}/approve`),
    rejectOrganizer: id => req('PATCH', `/organizers/${id}/reject`),

    // Vendors
    getVendors: (params = {}) => req('GET', '/vendors?' + new URLSearchParams(params)),
    approveVendor: id => req('PATCH', `/vendors/${id}/approve`),
    rejectVendor: id => req('PATCH', `/vendors/${id}/reject`),
    activateVendor: id => req('PATCH', `/vendors/${id}/activate`),
    suspendVendor: id => req('PATCH', `/vendors/${id}/suspend`),
    deleteVendor: id => req('DELETE', `/users/${id}`),
    updateVendor: (id, body) => req('PUT', `/users/${id}`, body),

    // Support
    getSupport: (params = {}) => req('GET', '/support?' + new URLSearchParams(params)),
    getSupportById: id => req('GET', `/support/${id}`),
    setSupportStatus: (id, status) => req('PATCH', `/support/${id}/status`, { status }),
    replySupport: (id, message) => req('POST', `/support/${id}/reply`, { message, from: 'Admin' }),
    closeSupport: id => req('PATCH', `/support/${id}/close`),

    // Activity
    getActivity: (params = {}) => req('GET', '/activity?' + new URLSearchParams(params)),

    // Tickets
    getTickets: (params = {}) => req('GET', '/tickets?' + new URLSearchParams(params)),
    refundTicket: id => req('PATCH', `/tickets/${id}/refund`),
    cancelTicket: id => req('PATCH', `/tickets/${id}/cancel`),

    // Entrances
    getEntrances: () => req('GET', '/entrances'),
    setEntranceStatus: (id, status) => req('PATCH', `/entrances/${id}/status`, { status }),
    assignEntrance: (id, staffEmail, staffName, staffId) => req('PATCH', `/entrances/${id}/assign`, { staffEmail, staffName, staffId }),
    unassignEntrance: (id) => req('PATCH', `/entrances/${id}/assign`, { staffEmail: null, staffName: null, staffId: null }),
    getEntranceHistory: (id) => req('GET', `/entrances/${id}/history`),
    getCheckinHistory: () => req('GET', '/entrances-checkin-history'),

    // Organizer extended
    suspendOrganizer: id => req('PATCH', `/organizers/${id}/suspend`),
    activateOrganizer: id => req('PATCH', `/organizers/${id}/activate`),
    getOrganizerEvents: id => req('GET', `/organizers/${id}/events`),
    getOrganizerRevenue: id => req('GET', `/organizers/${id}/revenue`),

    // Vendor detail
    getVendorServices: id => req('GET', `/vendors/${id}/services`),
    getVendorBookings: id => req('GET', `/vendors/${id}/bookings`),
    getVendorReviews: id => req('GET', `/vendors/${id}/reviews`),
    getVendorPayments: id => req('GET', `/vendors/${id}/payments`),

    // Events (admin)
    getAdminEvents: (params = {}) => req('GET', '/events?' + new URLSearchParams(params)),
    getAdminEvent: id => req('GET', `/events/${id}`),
    updateAdminEvent: (id, body) => req('PUT', `/events/${id}`, body),
    deleteAdminEvent: id => req('DELETE', `/events/${id}`),
    cancelAdminEvent: id => req('PATCH', `/events/${id}/cancel`),
    hideAdminEvent: id => req('PATCH', `/events/${id}/hide`),
    featureAdminEvent: id => req('PATCH', `/events/${id}/feature`),

    // Platform Settings
    // Platform Settings
    getSettings: () => req('GET', '/settings'),
    saveSettings: body => req('PUT', '/settings', body),
    changeAdminPassword: body => req('POST', '/settings/change-password', body),

    // Payments
    getPayments: (params = {}) => req('GET', '/payments?' + new URLSearchParams(params)),

    // Reports
    getReports: () => req('GET', '/reports'),
};
