# Drugs Service

Health Bridge Drugs Service - Manages drug catalog and prescriptions.

## Features

- Drug Catalog Management (Pharmacies)
- Prescription Creation (Doctors)
- Drug Search (Public)
- Prescription Viewing (Patients/Doctors)
- JWT Authentication
- Event-driven Architecture (RabbitMQ)

## Tech Stack

- Node.js + TypeScript
- Express.js
- PostgreSQL + Sequelize
- RabbitMQ
- JWT

## Prerequisites

- Node.js >= 18
- PostgreSQL >= 14
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
docker-compose up -d postgres rabbitmq

# Run migrations (if any)
# psql -U postgres -d healthbridge_drugs -f migrations/001_create_tables.sql

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

### Docker

```bash
# Start everything with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f drugs-service

# Stop services
docker-compose down
```

## API Endpoints

### Drugs

- `POST /api/drugs/create` - Create drug (Pharmacy)
- `GET /api/drugs/search` - Search drugs (Public)
- `GET /api/drugs/:id` - Get drug details (Public)
- `PUT /api/drugs/:id` - Update drug (Pharmacy)
- `DELETE /api/drugs/:id` - Delete drug (Pharmacy)

### Prescriptions

- `POST /api/pharm/prescription/create` - Create prescription (Doctor)
- `GET /api/prescription/view` - View prescriptions (Patient/Doctor)
- `GET /api/prescription/:id` - Get prescription details
- `PATCH /api/prescription/:id/status` - Update status (Doctor)

### Health

- `GET /health` - Health check

## Testing

### Generate Test Tokens

```bash
npm run test:token
```

### Using cURL

```bash
# Search drugs (no auth)
curl http://localhost:3002/api/drugs/search?medicineName=Paracetamol

# Create drug (pharmacy auth)
curl -X POST http://localhost:3002/api/drugs/create \
  -H "Authorization: Bearer PHARMACY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"medicineName":"Aspirin","dosage":"100mg","manufacturer":"Bayer","quantity":50,"price":300,"expiryDate":"2026-12-31","requiresPrescription":false}'
```

## Environment Variables

See `.env.example` for all configuration options.

## Database Schema

- **drugs** - Drug catalog
- **prescriptions** - Prescription headers
- **prescription_items** - Prescribed drugs (junction table)

## License

ISC

```

---

## **7. COMPLETE DIRECTORY STRUCTURE**
```

drugs-service/
├── src/
│ ├── @types/
│ │ ├── drug.types.ts
│ │ ├── prescription.types.ts
│ │ └── event.types.ts
│ │
│ ├── config/
│ │ ├── database.ts
│ │ ├── rabbitmq.ts
│ │ └── index.ts
│ │
│ ├── models/
│ │ ├── Drug.ts
│ │ ├── Prescription.ts
│ │ └── PrescriptionItem.ts
│ │
│ ├── services/
│ │ ├── DrugService.ts
│ │ ├── PrescriptionService.ts
│ │ └── EventPublisher.ts
│ │
│ ├── controllers/
│ │ ├── drugController.ts
│ │ └── prescriptionController.ts
│ │
│ ├── routes/
│ │ ├── drugRoutes.ts
│ │ ├── prescriptionRoutes.ts
│ │ └── index.ts
│ │
│ ├── middleware/
│ │ ├── auth.ts
│ │ └── validator.ts
│ │
│ ├── utils/
│ │ ├── logger.ts
│ │ ├── response.ts
│ │ ├── errorHandler.ts
│ │ ├── auth.ts
│ │ └── jwt.ts
│ │
│ ├── scripts/
│ │ └── generate-test-token.ts
│ │
│ ├── app.ts
│ └── server.ts
│
├── migrations/
│ ├── 001_create_drugs_table.sql
│ ├── 002_create_prescriptions_table.sql
│ └── 003_create_prescription_items_table.sql
│
├── logs/
├── test-drugs.http
├── .env
├── .env.example
├── .gitignore
├── .dockerignore
├
├── docker-compose.yml
├── package.json
├── tsconfig.json
├── nodemon.json
└── README.md
