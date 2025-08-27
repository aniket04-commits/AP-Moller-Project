const express = require('express');
const router = express.Router();
const { pool } = require('../db');

function requireApiKey(req, res, next) {
  const key = req.header('x-api-key');
  if (!key || key !== (process.env.API_KEY || 'SUPERSECRETKEY')) return res.status(401).json({error:'unauth'});
  next();
}

router.post('/', requireApiKey, async (req, res) => {
  try {
    const s = req.body;
    const q = `INSERT INTO kpi_samples(device_id, timestamp_utc, latitude, longitude, network_type, rssi, rsrp, rsrq, sinr, cell_id, pci, tac)
               VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`;
    const vals = [s.deviceId, s.timestampUtc, s.latitude, s.longitude, s.networkType, s.rssi, s.rsrp, s.rsrq, s.sinr, s.cellId, s.pci, s.tac];
    await pool.query(q, vals);
    res.status(201).send();
  } catch (e) {
    console.error(e);
    res.status(500).json({error:e.message});
  }
});

router.get('/latest/:deviceId', requireApiKey, async (req, res) => {
  const deviceId = req.params.deviceId;
  const q = `SELECT * FROM kpi_samples WHERE device_id=$1 ORDER BY timestamp_utc DESC LIMIT 1`;
  const r = await pool.query(q, [deviceId]);
  res.json(r.rows[0] || null);
});

module.exports = router;
