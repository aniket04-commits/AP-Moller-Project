const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const kpiRoute = require('./routes/kpi');
const { pool } = require('./db');

const app = express();
app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.json({limit: '1mb'}));

app.use('/api/kpi', kpiRoute);

app.get('/health', (req, res) => res.json({ok:true}));

async function init() {
  await pool.query(`CREATE TABLE IF NOT EXISTS kpi_samples (
    id SERIAL PRIMARY KEY,
    device_id TEXT,
    timestamp_utc TIMESTAMP,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    network_type TEXT,
    rssi INTEGER,
    rsrp DOUBLE PRECISION,
    rsrq DOUBLE PRECISION,
    sinr DOUBLE PRECISION,
    cell_id BIGINT,
    pci INTEGER,
    tac INTEGER
  )`);
}

init().then(() => {
  const port = process.env.PORT || 4000;
  app.listen(port, () => console.log('Server listening on', port));
}).catch(err => { console.error(err); process.exit(1); });
