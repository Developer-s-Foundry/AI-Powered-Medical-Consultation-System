-- Create ENUM types for delivery logs
CREATE TYPE delivery_status AS ENUM (
    'pending',
    'sending',
    'sent',
    'delivered',
    'failed',
    'bounced',
    'rejected'
);

CREATE TYPE delivery_provider AS ENUM (
    'nodemailer',
    'sendgrid',
    'mailgun',
    'twilio',
    'twilio_sendgrid',
    'aws_ses',
    'internal'
);

-- Create notification_delivery_logs table
CREATE TABLE notification_delivery_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    status delivery_status NOT NULL DEFAULT 'pending',
    provider delivery_provider NOT NULL,
    provider_message_id VARCHAR(255),
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    attempted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    delivered_at TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_delivery_logs_notification_id ON notification_delivery_logs(notification_id);
CREATE INDEX idx_delivery_logs_status ON notification_delivery_logs(status);
CREATE INDEX idx_delivery_logs_provider ON notification_delivery_logs(provider);
CREATE INDEX idx_delivery_logs_provider_message_id ON notification_delivery_logs(provider_message_id);
CREATE INDEX idx_delivery_logs_attempted_at ON notification_delivery_logs(attempted_at DESC);
CREATE INDEX idx_delivery_logs_delivered_at ON notification_delivery_logs(delivered_at);

-- Composite indexes for common queries
CREATE INDEX idx_delivery_logs_notification_attempted ON notification_delivery_logs(notification_id, attempted_at DESC);
CREATE INDEX idx_delivery_logs_status_retry ON notification_delivery_logs(status, retry_count);
CREATE INDEX idx_delivery_logs_provider_status ON notification_delivery_logs(provider, status);

-- Add comments
COMMENT ON TABLE notification_delivery_logs IS 'Tracks delivery attempts for each notification';
COMMENT ON COLUMN notification_delivery_logs.notification_id IS 'UUID of the notification being delivered';
COMMENT ON COLUMN notification_delivery_logs.status IS 'Current delivery status';
COMMENT ON COLUMN notification_delivery_logs.provider IS 'Delivery provider used (email or SMS provider)';
COMMENT ON COLUMN notification_delivery_logs.provider_message_id IS 'Message ID returned by the provider';
COMMENT ON COLUMN notification_delivery_logs.error_message IS 'Error message if delivery failed';
COMMENT ON COLUMN notification_delivery_logs.retry_count IS 'Number of retry attempts made';
COMMENT ON COLUMN notification_delivery_logs.attempted_at IS 'When the delivery was attempted';
COMMENT ON COLUMN notification_delivery_logs.delivered_at IS 'When the delivery was confirmed';