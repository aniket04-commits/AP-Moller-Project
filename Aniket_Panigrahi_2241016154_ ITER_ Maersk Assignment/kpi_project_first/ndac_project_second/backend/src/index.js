require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const alarms = require('./routes/alarms');
const { pool } = require('./db');

const app = express();
app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));

app.use('/api/alarms', alarms);

app.get('/health', (req, res) => res.json({ ok: true }));

async function init() {
  await pool.query(`CREATE TABLE IF NOT EXISTS ndac_alarms (
    id SERIAL PRIMARY KEY,
    type TEXT,
    severity TEXT,
    timestamp_text TEXT,
    source TEXT,
    details TEXT,
    payload JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
}

init().then(() => {
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log('NDAC Alarm Service listening on', port));
}).catch(err => { console.error(err); process.exit(1); });
