const STORAGE_KEYS = {
  events: 'organizer-events',
  tickets: 'organizer-tickets',
  reviews: 'organizer-reviews',
};

export const ORGANIZER_CATEGORIES = [
  'Concert',
  'Conference',
  'Exhibition',
  'Workshop',
  'Seminar',
  'Festival',
  'Networking',
  'Webinar',
  'Sports',
  'Cultural',
  'Food',
];

const INITIAL_EVENTS = [
  {
    id: 1,
    organizerId: 'organizer-1',
    title: 'Addis Music Festival',
    description: 'A large outdoor concert with featured artists.',
    venue: 'Meskel Square',
    date: '2026-07-15',
    time: '18:00',
    ticketPrice: 100,
    capacity: 2000,
    banner: 'festival-banner.png',
    category: 'Concert',
    published: true,
  },
  {
    id: 2,
    organizerId: 'organizer-1',
    title: 'Tech Summit 2026',
    description: 'A technology and innovation conference.',
    venue: 'Skylight Hotel',
    date: '2026-08-05',
    time: '09:00',
    ticketPrice: 150,
    capacity: 1000,
    banner: 'tech-banner.png',
    category: 'Conference',
    published: true,
  },
  {
    id: 3,
    organizerId: 'organizer-1',
    title: 'Cultural Expo',
    description: 'Showcasing culture, food, and art.',
    venue: 'Unity Park',
    date: '2026-09-12',
    time: '10:00',
    ticketPrice: 50,
    capacity: 500,
    banner: 'expo-banner.png',
    category: 'Exhibition',
    published: false,
  },
];

const INITIAL_TICKETS = [
  { id: 'TKT001', eventId: 1, customerName: 'John', customerEmail: 'john@gmail.com', amount: 500, status: 'paid', checkedIn: true, checkedAt: '2026-07-15T16:30:00' },
  { id: 'TKT002', eventId: 1, customerName: 'Sara', customerEmail: 'sara@gmail.com', amount: 700, status: 'paid', checkedIn: false, checkedAt: null },
  { id: 'TKT003', eventId: 2, customerName: 'Dawit', customerEmail: 'dawit@gmail.com', amount: 600, status: 'paid', checkedIn: false, checkedAt: null },
  { id: 'TKT004', eventId: 3, customerName: 'Hana', customerEmail: 'hana@gmail.com', amount: 300, status: 'pending', checkedIn: false, checkedAt: null },
];

const INITIAL_REVIEWS = [
  { id: 1, eventId: 1, rating: 4.8, review: 'Great organization and smooth entry.' },
  { id: 2, eventId: 2, rating: 4.5, review: 'Excellent speakers and networking.' },
  { id: 3, eventId: 3, rating: 4.2, review: 'Well managed event with a warm atmosphere.' },
];

function readStorage(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

function readAllEvents() {
  return readStorage(STORAGE_KEYS.events, INITIAL_EVENTS);
}

export function getOrganizerEvents() {
  const events = readAllEvents();
  return events.filter(event => event.organizerId === 'organizer-1');
}

export function saveOrganizerEvents(events) {
  writeStorage(STORAGE_KEYS.events, events);
}

export function createOrganizerEvent(eventData) {
  const events = readAllEvents();
  const newEvent = {
    id: Date.now(),
    organizerId: 'organizer-1',
    title: eventData.title,
    description: eventData.description,
    venue: eventData.venue,
    date: eventData.date,
    time: eventData.time,
    ticketPrice: Number(eventData.ticketPrice || 0),
    capacity: Number(eventData.capacity || 0),
    banner: eventData.banner || 'default-banner.png',
    category: eventData.category || 'General',
    published: false,
  };
  const nextEvents = [newEvent, ...events];
  saveOrganizerEvents(nextEvents);
  return newEvent;
}

export function updateOrganizerEvent(id, updates) {
  const events = readAllEvents();
  const nextEvents = events.map(event => event.id === Number(id) ? { ...event, ...updates } : event);
  saveOrganizerEvents(nextEvents);
  return nextEvents;
}

export function deleteOrganizerEvent(id) {
  const events = readAllEvents();
  const nextEvents = events.filter(event => event.id !== Number(id));
  saveOrganizerEvents(nextEvents);
  return nextEvents;
}

export function toggleOrganizerEventPublish(id) {
  const events = readAllEvents();
  const nextEvents = events.map(event => event.id === Number(id) ? { ...event, published: !event.published } : event);
  saveOrganizerEvents(nextEvents);
  return nextEvents;
}

export function getOrganizerTickets() {
  return readStorage(STORAGE_KEYS.tickets, INITIAL_TICKETS);
}

export function saveOrganizerTickets(tickets) {
  writeStorage(STORAGE_KEYS.tickets, tickets);
}

export function toggleTicketCheckIn(ticketId) {
  const tickets = getOrganizerTickets();
  const updated = tickets.map(ticket => ticket.id === ticketId ? { ...ticket, checkedIn: true, checkedAt: new Date().toISOString() } : ticket);
  saveOrganizerTickets(updated);
  return updated;
}

export function getOrganizerReviews() {
  return readStorage(STORAGE_KEYS.reviews, INITIAL_REVIEWS);
}

export function getOrganizerDashboardSummary() {
  const events = getOrganizerEvents();
  const tickets = getOrganizerTickets();
  const paidTickets = tickets.filter(ticket => ticket.status === 'paid');
  const reviews = getOrganizerReviews();
  const ratingAverage = reviews.length ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : '0.0';

  return {
    totalEvents: events.length,
    ticketsSold: paidTickets.length,
    totalAttendees: paidTickets.length,
    revenue: paidTickets.reduce((sum, ticket) => sum + Number(ticket.amount || 0), 0),
    staffMembers: (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('organizer-staff-list') || '[]') : []).length,
    averageRating: ratingAverage,
    publishedEvents: events.filter(event => event.published).length,
  };
}

export function getOrganizerAnalytics() {
  const events = getOrganizerEvents();
  const tickets = getOrganizerTickets();
  const paidTickets = tickets.filter(ticket => ticket.status === 'paid');
  const popularEvents = events
    .map(event => ({
      ...event,
      sold: paidTickets.filter(ticket => ticket.eventId === event.id).length,
    }))
    .sort((a, b) => b.sold - a.sold);

  return {
    events,
    tickets,
    paidTickets,
    popularEvents,
    totalRevenue: paidTickets.reduce((sum, ticket) => sum + Number(ticket.amount || 0), 0),
    totalTicketsSold: paidTickets.length,
    totalAttendance: paidTickets.filter(ticket => ticket.checkedIn).length,
  };
}
