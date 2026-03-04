-- Doctor profiles
CREATE TABLE doctor_profiles (
    user_id UUID PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    gender VARCHAR(20),
    specialty VARCHAR(100),
    hospital_name VARCHAR(255),
    
    -- Address (embedded JSON)
    address JSONB,
    
    -- Consultation schedule (embedded JSON)
    consultation_schedule JSONB,
    
    -- Payment details (embedded JSON with Stripe info)
    payment_details JSONB,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_doctor_profiles_user_id ON doctor_profiles(user_id);
CREATE INDEX idx_doctor_profiles_phone ON doctor_profiles(phone);
CREATE INDEX idx_doctor_profiles_specialty ON doctor_profiles(specialty);

CREATE TRIGGER update_doctor_profiles_updated_at 
    BEFORE UPDATE ON doctor_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE doctor_profiles IS 'Doctor profile data including schedules and payment info';