NDAC Alarm Email Notification Service - Prototype
=================================================

What this is:
- A Node.js backend that accepts NDAC alarm webhooks, validates and stores them in Postgres,
  and sends notification emails to an ops address via SMTP (nodemailer).
- Includes a simulator script to POST a sample alarm.
- Docker Compose file runs Postgres, MailHog (dev SMTP + web UI), and the API.

Quickstart (local, requires Docker):
1. Copy environment variables:
     cp backend/.env.example .env
   (Edit .env if you want to change recipients or API key.)

2. Start services:
     docker-compose up --build

3. Service endpoints:
     Health: http://localhost:5000/health
     Ingest alarm (POST): http://localhost:5000/api/alarms/ingest
     List alarms (GET): http://localhost:5000/api/alarms

   Use header 'x-api-key: SUPERSECRET_NDAC_KEY' or ?api_key=SUPERSECRET_NDAC_KEY

4. Visit MailHog UI to see emails:
     http://localhost:8025

Simulate an alarm:
   cd backend
   npm install
   node tools/simulate_alarm.js

Production notes:
- Replace MailHog with a real SMTP provider (SendGrid SMTP, AWS SES SMTP or API).
- Secure credentials using environment variables / secret manager.
- Consider adding deduplication, rate-limiting, retry/backoff for email sending.
- Add monitoring and alert escalation (SMS/phone) for critical alarms.

Files included:
- backend/: source code
- docker-compose.yml
- README.md
