const BASE = 'http://localhost:5000/api/events';

export async function fetchEvents(params = {}) {
    const q = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE}${q ? '?' + q : ''}`);
    const data = await res.json();
    return data.events || [];
}

export async function fetchEvent(id) {
    const res = await fetch(`${BASE}/${id}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Event not found');
    return data.event;
}
