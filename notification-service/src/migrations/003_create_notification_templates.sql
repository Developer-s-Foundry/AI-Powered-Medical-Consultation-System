-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM for template types
CREATE TYPE template_type AS ENUM (
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
    'welcome',
    'general_notification'
);

-- Create notification_templates table
CREATE TABLE notification_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type template_type NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Template content
    title_template VARCHAR(500),
    body_template TEXT,
    email_subject_template VARCHAR(500),
    email_body_template TEXT,
    sms_template TEXT,
    
    -- Variables
    variables JSONB,
    
    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    version INTEGER DEFAULT 1,
    language VARCHAR(10) DEFAULT 'en',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE(type, language, version)
);

-- Create indexes
CREATE INDEX idx_templates_type ON notification_templates(type);
CREATE INDEX idx_templates_is_active ON notification_templates(is_active);
CREATE INDEX idx_templates_language ON notification_templates(language);
CREATE INDEX idx_templates_type_active ON notification_templates(type, is_active);
CREATE INDEX idx_templates_type_language ON notification_templates(type, language);

-- Trigger to auto-update updated_at
CREATE TRIGGER update_templates_updated_at 
    BEFORE UPDATE ON notification_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE notification_templates IS 'Stores reusable notification templates with Handlebars syntax';
COMMENT ON COLUMN notification_templates.variables IS 'List of variables this template expects in JSON format';
COMMENT ON COLUMN notification_templates.version IS 'Version number for template versioning';
COMMENT ON COLUMN notification_templates.language IS 'Language code (e.g., en, fr, es)';