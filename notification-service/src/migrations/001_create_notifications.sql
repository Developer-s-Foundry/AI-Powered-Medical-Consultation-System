-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE recipient_type AS ENUM ('patient', 'doctor', 'pharmacy', 'lab', 'wellness_center', 'admin');
CREATE TYPE notification_type AS ENUM (
    'email_verification',
    'password_reset',
    'appointment_request',
    'appointment_confirmed',
    'appointment_cancelled',
    'appointment_reminder',
    'prescription_ready',
    'pharmacy_matched',
    'payment_success',
    'payment_failed',
    'general'
);
CREATE TYPE reference_type AS ENUM ('user', 'appointment', 'prescription', 'booking', 'transaction', 'pharmacy_order', 'lab_booking', 'none');

-- Create notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID NOT NULL,
    recipient_type recipient_type NOT NULL,
    type notification_type NOT NULL,
    reference_type reference_type NOT NULL,
    reference_id UUID,
    title VARCHAR(500) NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX idx_notifications_recipient_type ON notifications(recipient_type);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_reference_type ON notifications(reference_type);
CREATE INDEX idx_notifications_reference_id ON notifications(reference_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Composite indexes for common queries
CREATE INDEX idx_notifications_recipient_created ON notifications(recipient_id, created_at DESC);
CREATE INDEX idx_notifications_reference_composite ON notifications(reference_type, reference_id);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_notifications_updated_at 
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE notifications IS 'Stores all notifications sent to users';
COMMENT ON COLUMN notifications.recipient_id IS 'UUID of the user receiving the notification';
COMMENT ON COLUMN notifications.recipient_type IS 'Type of recipient (patient, doctor, etc.)';
COMMENT ON COLUMN notifications.reference_type IS 'Type of entity this notification references';
COMMENT ON COLUMN notifications.reference_id IS 'UUID of the referenced entity';