CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drugs table
CREATE TABLE drugs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pharmacy_id UUID NOT NULL,
    medicine_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    manufacturer VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    price DECIMAL(10, 2) NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    description TEXT,
    requires_prescription BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_drugs_pharmacy_id ON drugs(pharmacy_id);
CREATE INDEX idx_drugs_medicine_name ON drugs(medicine_name);
CREATE INDEX idx_drugs_manufacturer ON drugs(manufacturer);
CREATE INDEX idx_drugs_requires_prescription ON drugs(requires_prescription);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_drugs_updated_at 
    BEFORE UPDATE ON drugs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE drugs IS 'Pharmacy drug inventory';