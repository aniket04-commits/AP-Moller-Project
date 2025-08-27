const express = require('express');
const router = express.Router();
const Ajv = require('ajv');
const ajv = new Ajv();
const { pool } = require('../db');
const { sendAlertEmail } = require('../emailer');

// Simple NDAC alarm JSON schema (adaptable)
const schema = {
  type: 'object',
  properties: {
    type: { type: 'string' },
    severity: { type: 'string' },
    timestamp: { type: 'string' },
    source: { type: 'string' },
    details: { type: 'string' },
    payload: { type: 'object' }
  },
  required: ['type','severity','timestamp']
};
const validate = ajv.compile(schema);

function requireApiKey(req, res, next) {
  const key = req.header('x-api-key') || req.query.api_key;
  if (!key || key !== (process.env.API_KEY || 'SUPERSECRET_NDAC_KEY')) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  next();
}

// Receive NDAC alarm (webhook)
router.post('/ingest', requireApiKey, async (req, res) => {
  try {
    const alarm = req.body;
    const ok = validate(alarm);
    if (!ok) return res.status(400).json({ error: 'invalid payload', details: validate.errors });

    // store in DB
    const q = `INSERT INTO ndac_alarms(type, severity, timestamp_text, source, details, payload)
               VALUES($1,$2,$3,$4,$5,$6) RETURNING id`;
    const vals = [alarm.type, alarm.severity, alarm.timestamp, alarm.source || null, alarm.details || null, alarm.payload || null];
    const r = await pool.query(q, vals);

    // send email notification (async)
    sendAlertEmail(alarm).then(info => {
      console.log('Email sent', info && info.messageId);
    }).catch(err => {
      console.error('Email send failed', err);
    });

    res.status(201).json({ id: r.rows[0].id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// simple list endpoint
router.get('/', requireApiKey, async (req, res) => {
  const r = await pool.query('SELECT id, type, severity, timestamp_text, source, details, created_at FROM ndac_alarms ORDER BY created_at DESC LIMIT 100');
  res.json(r.rows);
});

module.exports = router;
