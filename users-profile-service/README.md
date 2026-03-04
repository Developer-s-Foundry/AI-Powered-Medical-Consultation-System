# User Profile Service

Health Bridge User Profile Service - manages patient, doctor, and pharmacy profiles.

## Features

- 👤 Patient profiles with medical history
- 👨‍⚕️ Doctor profiles with schedules and payment details
- 💊 Pharmacy profiles with operation hours
- 🔍 Search and filter capabilities
- 📍 Location-based queries
- 🔐 JWT authentication
- 📡 Event-driven architecture (RabbitMQ)
- 🗄️ PostgreSQL database with JSONB support

## Tech Stack

- Node.js + TypeScript
- Express.js
- PostgreSQL + Sequelize
- Redis
- RabbitMQ
- JWT

## Prerequisites

- Node.js >= 18
- PostgreSQL >= 14
- Redis >= 7
- RabbitMQ >= 3.12

## Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Update .env with your configuration
```

## Running the Service

### Development

```bash
# Start dependencies (Docker)
docker-compose up -d

# Run migrations
npm run migrate:up

# Start development server
npm run dev
```

### Production

```bash
# Build
npm run build

# Start
npm start
```

## API Endpoints

### Patients

- `POST /api/patients/profile` - Create profile
- `GET /api/patients/profile` - Get own profile
- `PUT /api/patients/profile` - Update profile
- `PUT /api/patients/medical-history` - Update medical history
- `POST /api/patients/medications` - Add medication

### Doctors

- `POST /api/doctors/profile` - Create profile
- `GET /api/doctors/profile/:userId` - Get profile (public)
- `PUT /api/doctors/schedule` - Update schedule
- `PUT /api/doctors/payment` - Update payment details
- `GET /api/doctors/search` - Search doctors

### Pharmacies

- `POST /api/pharmacies/profile` - Create profile
- `GET /api/pharmacies/nearby` - Find nearby
- `PUT /api/pharmacies/operation-days` - Update hours
- `GET /api/pharmacies/search` - Search pharmacies

### Health

- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed system status

## Authentication

All protected endpoints require JWT token in Authorization header:

```
Authorization: Bearer <token>
```

## Environment Variables

See `.env.example` for all available configuration options.

## License

ISC
