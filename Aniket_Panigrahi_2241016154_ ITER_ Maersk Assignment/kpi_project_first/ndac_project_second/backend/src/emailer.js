        const nodemailer = require('nodemailer');

        async function createTransport() {
          const host = process.env.SMTP_HOST || 'mailhog';
          const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 1025;
          const secure = (process.env.SMTP_SECURE === 'true');
          const user = process.env.SMTP_USER || '';
          const pass = process.env.SMTP_PASS || '';

          const transport = nodemailer.createTransport({
            host, port, secure,
            auth: user ? { user, pass } : undefined,
            tls: { rejectUnauthorized: false }
          });
          return transport;
        }

        async function sendAlertEmail(alarm) {
          const transport = await createTransport();
          const from = process.env.ALERT_EMAIL_FROM || 'ndac-alerts@example.com';
          const to = process.env.ALERT_EMAIL_TO || 'ops-team@example.com';
          const subject = `[NDAC ALERT] ${alarm.severity || 'ALARM'} - ${alarm.type || 'Unknown'}`;
          const text = buildPlain(alarm);
          const html = buildHtml(alarm);

          const info = await transport.sendMail({ from, to, subject, text, html });
          return info;
        }

        function buildPlain(alarm) {
          return `NDAC Alarm
Type: ${alarm.type}
Severity: ${alarm.severity}
Timestamp: ${alarm.timestamp}
Source: ${alarm.source || 'NDAC'}
Details: ${alarm.details || JSON.stringify(alarm.payload || {})}
`;
        }

        function buildHtml(alarm) {
          const payload = JSON.stringify(alarm.payload || {}, null, 2);
          return `<h2>NDAC Alarm Notification</h2>
          <p><strong>Type:</strong> ${alarm.type}</p>
          <p><strong>Severity:</strong> ${alarm.severity}</p>
          <p><strong>Timestamp:</strong> ${alarm.timestamp}</p>
          <p><strong>Source:</strong> ${alarm.source || 'NDAC'}</p>
          <pre style="background:#f4f4f4;padding:10px;border-radius:4px">${payload}</pre>`;
        }

        module.exports = { sendAlertEmail };
