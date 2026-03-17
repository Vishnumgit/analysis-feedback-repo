const { Pool } = require('pg');
require('dotenv').config();

let pool = null;
// Optimistically assume connected when DATABASE_URL is set; updated after connection test
let dbAvailable = false;

if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    dbAvailable = false;
  });

  // Test the connection on startup; set flag optimistically to true so initial
  // requests are not unnecessarily routed to mock data before the test completes.
  dbAvailable = true;
  pool.query('SELECT 1', (err) => {
    if (err) {
      console.error('⚠️  Database connection failed:', err.message);
      dbAvailable = false;
    } else {
      console.log('✅  Database connected');
      dbAvailable = true;
    }
  });
} else {
  console.warn('⚠️  DATABASE_URL not set – falling back to mock data');
}

module.exports = { pool, get dbAvailable() { return dbAvailable; } };
