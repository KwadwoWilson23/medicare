# 🏥 MediCare — Hospital Management System

A full-stack Hospital Management System built with **React** + **Node.js** + **SQLite**, featuring role-based dashboards and a clean blue & white design.

## Features

- **5 Role-Based Dashboards**: Admin, Doctor, Patient, Nurse, Receptionist
- **Patient Management**: Registration, records, medical history
- **Appointment Booking**: Schedule, confirm, cancel appointments
- **Billing & Payments**: Invoice generation, payment tracking
- **Ward Management**: Bed occupancy, room assignments
- **Vital Signs Recording**: Nurses can log patient vitals
- **Mobile Responsive**: Full mobile support with hamburger menu
- **JWT Authentication**: Secure login with role-based access

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6 |
| Backend | Node.js, Express |
| Database | SQLite (better-sqlite3) |
| Icons | Lucide React |
| Auth | JWT (jsonwebtoken) |

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/KwadwoWilson23/medicare.git
cd medicare

# 2. Install & start backend
cd backend && npm install
npm run dev

# 3. Install & start frontend (new terminal)
cd frontend && npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hospital.com | admin123 |
| Doctor | sarah@hospital.com | doctor123 |
| Patient | alice@patient.com | patient123 |
| Nurse | nurse@hospital.com | nurse123 |
| Receptionist | reception@hospital.com | reception123 |

## Deployment

This project is configured for **Vercel** deployment with `vercel.json`.

## License

MIT
