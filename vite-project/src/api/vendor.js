import { apiUrl } from './config';

const BASE = apiUrl('/api/vendor');

function getToken() {
    return localStorage.getItem('es_token');
}

async function req(method, path, body) {
    const token = getToken();

    const headers = {};

    if (body) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || 'Request failed');
    }

    return data;
}

export const vendorApi = {

    // ===============================
    // STATS
    // ===============================
    getStats: email =>
        req('GET', `/stats?vendorEmail=${encodeURIComponent(email)}`),


    // ===============================
    // SERVICES
    // ===============================
    getServices: email =>
        req('GET', `/services?vendorEmail=${encodeURIComponent(email)}`),

    createService: body =>
        req('POST', '/services', body),

    createServiceWithImage: async (formData) => {

        const token = getToken();

        const headers = {};

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`${BASE}/services`, {
            method: 'POST',
            headers,
            body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || 'Request failed');
        }

        return data;
    },

    updateService: (id, body) =>
        req('PUT', `/services/${id}`, body),

    deleteService: id =>
        req('DELETE', `/services/${id}`),


    // ===============================
    // BOOKINGS
    // ===============================
    getBookings: (email, status) =>
        req(
            'GET',
            `/bookings?vendorEmail=${encodeURIComponent(email)}${status ? `&status=${status}` : ''}`
        ),

    getBooking: id =>
        req('GET', `/bookings/${id}`),

    updateBookingStatus: (id, status) =>
        req('PATCH', `/bookings/${id}/status`, { status }),

    addBookingMessage: (id, message) =>
        req('POST', `/bookings/${id}/messages`, { message }),

    completeBooking: id =>
        req('PATCH', `/bookings/${id}/complete`),

    payBooking: id =>
        req('PATCH', `/bookings/${id}/pay`),


    // ===============================
    // AVAILABILITY
    // ===============================
    getAvailability: email =>
        req('GET', `/availability?vendorEmail=${encodeURIComponent(email)}`),

    saveAvailability: body =>
        req('PUT', '/availability', body),


    // ===============================
    // PAYMENTS
    // ===============================
    getPayments: email =>
        req('GET', `/payments?vendorEmail=${encodeURIComponent(email)}`),


    // ===============================
    // PROFILE
    // ===============================
    getProfile: email =>
        req('GET', `/profile?vendorEmail=${encodeURIComponent(email)}`),

    saveProfile: body =>
        req('PUT', '/profile', body),


    // ===============================
    // PORTFOLIO
    // ===============================
    getPortfolio: email =>
        req('GET', `/portfolio?vendorEmail=${encodeURIComponent(email)}`),

    addPortfolioItem: body =>
        req('POST', '/portfolio', body),

    deletePortfolioItem: (itemId, vendorEmail) =>
        req('DELETE', `/portfolio/${itemId}`, {
            vendorEmail
        }),


    // ===============================
    // REVIEWS
    // ===============================
    getReviews: email =>
        req('GET', `/reviews?vendorEmail=${encodeURIComponent(email)}`),

    submitReview: body =>
        req('POST', '/reviews', body),

    deleteReview: id =>
        req('DELETE', `/reviews/${id}`)
};