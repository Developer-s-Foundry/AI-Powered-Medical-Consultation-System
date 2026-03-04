-- Pharmacy profiles
CREATE TABLE pharmacy_profiles (
    user_id UUID PRIMARY KEY,
    pharmacy_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    lincense_number VARCHAR(100) UNIQUE,
    
    -- Address (embedded JSON)
    address JSONB,
    
    -- Operation days (embedded JSON)
    operation_days JSONB,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pharmacy_profiles_user_id ON pharmacy_profiles(user_id);
CREATE INDEX idx_pharmacy_profiles_phone ON pharmacy_profiles(phone);
CREATE INDEX idx_pharmacy_profiles_license ON pharmacy_profiles(lincense_number);

CREATE TRIGGER update_pharmacy_profiles_updated_at 
    BEFORE UPDATE ON pharmacy_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE pharmacy_profiles IS 'Pharmacy profile data with operation hours';