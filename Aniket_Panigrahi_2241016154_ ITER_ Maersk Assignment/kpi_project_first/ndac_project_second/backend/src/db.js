const { Pool } = require('pg');
const pool = new Pool({
  host: process.env.PGHOST || 'db',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  database: process.env.PGDATABASE || 'ndacdb',
  port: process.env.PGPORT || 5432
});
module.exports = { pool };
