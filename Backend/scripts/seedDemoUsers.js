const User = require('../models/user');
const bcrypt = require('bcryptjs');

const demo = [
  { name: 'Abebe Girma', email: 'admin@eventsphere.com', password: 'Admin@123', role: 'platform-admin' },
  { name: 'Selam Tadesse', email: 'organizer@eventsphere.com', password: 'Org@123', role: 'event-organizer' },
  { name: 'Dawit Bekele', email: 'staff@eventsphere.com', password: 'Staff@123', role: 'event-staff' },
  { name: 'Beza Haile', email: 'vendor@eventsphere.com', password: 'Vendor@123', role: 'vendor' },
];

(async () => {
  try {
    for (const u of demo) {
      const existing = await User.findOne({ email: u.email });
      if (existing) {
        console.log('Exists:', u.email);
        continue;
      }
      const hashed = await bcrypt.hash(u.password, 10);
      const created = await User.create({ name: u.name, email: u.email, password: hashed, provider: 'google', role: u.role });
      console.log('Created:', created.email || u.email);
    }
    console.log('Seeding complete');
    process.exit(0);
  } catch (e) {
    console.error('Seeder error', e);
    process.exit(1);
  }
})();
