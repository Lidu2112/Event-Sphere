
const { Pool } = require('pg');
const crypto = require('crypto');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({
    path: path.join(__dirname, '..', '.env')
});

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 10,
    connectionTimeoutMillis: 15000
});

pool.on('error', (err) => {
    console.error('Unexpected PostgreSQL pool error:', err.message);
});

async function initializeDatabase() {
    const client = await pool.connect();

    try {
        const tables = [
            'users',
            'organizer_events',
            'tickets',
            'entrances',
            'bookings',
            'services',
            'reviews',
            'support_requests',
            'settings',
            'vendor_profiles',
            'availabilities',
            'vendors',
            'sessions',
            'notifications'
        ];

        await client.query('BEGIN');

        for (const table of tables) {
            await client.query(`
                CREATE TABLE IF NOT EXISTS ${table} (
                    id VARCHAR(64) PRIMARY KEY,
                    data JSONB NOT NULL,
                    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
                )
            `);
        }

        await client.query('COMMIT');
        console.log('Supabase PostgreSQL tables initialized.');
        return true;
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Database initialization failed:', error.message);
        throw error;
    } finally {
        client.release();
    }
}

function generateId() {
    return crypto.randomUUID();
}

module.exports = {
    pool,
    initializeDatabase,
    generateId
};
