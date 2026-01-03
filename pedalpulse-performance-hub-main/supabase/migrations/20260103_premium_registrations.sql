-- Migration: Create premium_registrations and coupon_codes tables
-- Created: 2026-01-03

-- ============================================
-- COUPON CODES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS coupon_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10,2) NOT NULL,
    max_uses INTEGER DEFAULT NULL, -- NULL means unlimited
    current_uses INTEGER DEFAULT 0,
    min_order_value DECIMAL(10,2) DEFAULT 0,
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE DEFAULT NULL, -- NULL means no expiry
    is_active BOOLEAN DEFAULT TRUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for quick coupon lookup
CREATE INDEX idx_coupon_codes_code ON coupon_codes(code);
CREATE INDEX idx_coupon_codes_active ON coupon_codes(is_active, valid_until);

-- ============================================
-- PREMIUM REGISTRATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS premium_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Personal Details
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone_country_code VARCHAR(10) DEFAULT '+91',
    phone VARCHAR(15) NOT NULL,
    
    -- Address Details
    address_line1 VARCHAR(90) NOT NULL, -- Flat, House no., Building, Company, Apartment
    address_line2 VARCHAR(90) NOT NULL, -- Area, Street, Sector, Village
    landmark VARCHAR(100),
    pincode VARCHAR(10) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) DEFAULT 'India',
    
    -- Challenge Details
    challenge_name VARCHAR(255) DEFAULT 'Republic Day Challenge 2026',
    category VARCHAR(50) NOT NULL, -- e.g., 'running-5km', 'cycling-100km'
    
    -- Referral & Coupon
    referral_source VARCHAR(100),
    coupon_code VARCHAR(50),
    coupon_discount DECIMAL(10,2) DEFAULT 0,
    
    -- Payment Details
    base_amount DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    gst_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    
    razorpay_order_id VARCHAR(255),
    razorpay_payment_id VARCHAR(255),
    razorpay_signature VARCHAR(255),
    payment_status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed, refunded
    
    -- Metadata
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for premium_registrations
CREATE INDEX idx_premium_registrations_email ON premium_registrations(email);
CREATE INDEX idx_premium_registrations_phone ON premium_registrations(phone);
CREATE INDEX idx_premium_registrations_payment_status ON premium_registrations(payment_status);
CREATE INDEX idx_premium_registrations_razorpay_order ON premium_registrations(razorpay_order_id);
CREATE INDEX idx_premium_registrations_category ON premium_registrations(category);
CREATE INDEX idx_premium_registrations_challenge ON premium_registrations(challenge_name);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE coupon_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_registrations ENABLE ROW LEVEL SECURITY;

-- Coupon codes: Public can read active coupons for validation
CREATE POLICY "Allow public to read active coupon codes"
    ON coupon_codes
    FOR SELECT
    USING (is_active = TRUE AND (valid_until IS NULL OR valid_until > NOW()));

-- Coupon codes: Only authenticated users (admins) can manage coupons
CREATE POLICY "Allow authenticated users to manage coupon codes"
    ON coupon_codes
    FOR ALL
    USING (auth.role() = 'authenticated');

-- Premium registrations: Public can insert (for registration)
CREATE POLICY "Allow public to insert premium registrations"
    ON premium_registrations
    FOR INSERT
    WITH CHECK (TRUE);

-- Premium registrations: Public can update their own registration (for payment confirmation)
CREATE POLICY "Allow public to update own registration by order_id"
    ON premium_registrations
    FOR UPDATE
    USING (TRUE)
    WITH CHECK (TRUE);

-- Premium registrations: Only authenticated users can read all registrations
CREATE POLICY "Allow authenticated users to read premium registrations"
    ON premium_registrations
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- ============================================
-- SAMPLE COUPON CODES (for testing)
-- ============================================
INSERT INTO coupon_codes (code, discount_type, discount_value, max_uses, description) VALUES
    ('REPUBLIC50', 'fixed', 50.00, 100, 'Republic Day Special - ₹50 off'),
    ('EARLYBIRD', 'percentage', 10.00, 50, 'Early Bird - 10% off')
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- FUNCTION: Validate and apply coupon
-- ============================================
CREATE OR REPLACE FUNCTION validate_coupon(coupon_code_input VARCHAR, order_amount DECIMAL)
RETURNS TABLE (
    is_valid BOOLEAN,
    discount_type VARCHAR,
    discount_value DECIMAL,
    final_discount DECIMAL,
    message TEXT
) AS $$
DECLARE
    coupon RECORD;
BEGIN
    -- Find the coupon
    SELECT * INTO coupon FROM coupon_codes 
    WHERE code = UPPER(coupon_code_input) 
    AND is_active = TRUE
    AND (valid_from IS NULL OR valid_from <= NOW())
    AND (valid_until IS NULL OR valid_until > NOW());
    
    -- Check if coupon exists
    IF coupon IS NULL THEN
        RETURN QUERY SELECT FALSE, NULL::VARCHAR, NULL::DECIMAL, 0::DECIMAL, 'Invalid coupon code'::TEXT;
        RETURN;
    END IF;
    
    -- Check max uses
    IF coupon.max_uses IS NOT NULL AND coupon.current_uses >= coupon.max_uses THEN
        RETURN QUERY SELECT FALSE, NULL::VARCHAR, NULL::DECIMAL, 0::DECIMAL, 'Coupon usage limit reached'::TEXT;
        RETURN;
    END IF;
    
    -- Check minimum order value
    IF order_amount < coupon.min_order_value THEN
        RETURN QUERY SELECT FALSE, NULL::VARCHAR, NULL::DECIMAL, 0::DECIMAL, 
            ('Minimum order value is ₹' || coupon.min_order_value::TEXT)::TEXT;
        RETURN;
    END IF;
    
    -- Calculate discount
    IF coupon.discount_type = 'percentage' THEN
        RETURN QUERY SELECT TRUE, coupon.discount_type, coupon.discount_value, 
            ROUND((order_amount * coupon.discount_value / 100)::DECIMAL, 2),
            ('Coupon applied: ' || coupon.discount_value || '% off')::TEXT;
    ELSE
        RETURN QUERY SELECT TRUE, coupon.discount_type, coupon.discount_value,
            LEAST(coupon.discount_value, order_amount),
            ('Coupon applied: ₹' || coupon.discount_value || ' off')::TEXT;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Increment coupon usage
-- ============================================
CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_code_input VARCHAR)
RETURNS VOID AS $$
BEGIN
    UPDATE coupon_codes 
    SET current_uses = current_uses + 1, updated_at = NOW()
    WHERE code = UPPER(coupon_code_input);
END;
$$ LANGUAGE plpgsql;
