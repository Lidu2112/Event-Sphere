const BASE = 'http://localhost:5000/api/staff';

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

export const staffApi = {
    getTicket: ticketCode => req('GET', `/tickets/${ticketCode}`),
    getTickets: params => req('GET', '/tickets?' + new URLSearchParams(params || {})),
    checkInTicket: body => req('POST', '/tickets/checkin', body),
    getStats: () => req('GET', '/stats'),
    getEntrances: () => req('GET', '/entrances'),
    setEntranceStatus: (id, status, staffEmail, staffName) => req('PATCH', `/entrances/${id}/status`, { status, staffEmail, staffName }),
    assignEntrance: (id, staffEmail, staffName, staffId) => req('PATCH', `/entrances/${id}/assign`, { staffEmail, staffName, staffId }),
    unassignEntrance: (id) => req('PATCH', `/entrances/${id}/assign`, { unassign: true }),
    getEntranceHistory: (id) => req('GET', `/entrances/${id}/history`),
    getAssignedEvents: params => req('GET', '/assigned?' + new URLSearchParams(params || {})),
    getEventList: () => req('GET', '/events'),
};
