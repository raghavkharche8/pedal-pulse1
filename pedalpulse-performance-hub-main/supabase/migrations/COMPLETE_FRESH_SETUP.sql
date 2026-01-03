-- ============================================
-- COMPLETE DATABASE SETUP FOR PEDALPULSE
-- Republic Day Challenge 2026
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- DROP EXISTING TABLES (Fresh Start)
-- ============================================
DROP TABLE IF EXISTS premium_registrations CASCADE;
DROP TABLE IF EXISTS coupon_codes CASCADE;
DROP TABLE IF EXISTS free_registrations CASCADE;

-- ============================================
-- COUPON CODES TABLE
-- ============================================
CREATE TABLE coupon_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10,2) NOT NULL,
    max_uses INTEGER DEFAULT NULL,
    current_uses INTEGER DEFAULT 0,
    min_order_value DECIMAL(10,2) DEFAULT 0,
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_coupon_codes_code ON coupon_codes(code);
CREATE INDEX idx_coupon_codes_active ON coupon_codes(is_active, valid_until);

-- ============================================
-- PREMIUM REGISTRATIONS TABLE
-- ============================================
CREATE TABLE premium_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone_country_code VARCHAR(10) DEFAULT '+91',
    phone VARCHAR(15) NOT NULL,
    address_line1 VARCHAR(90) NOT NULL,
    address_line2 VARCHAR(90) NOT NULL,
    landmark VARCHAR(100),
    pincode VARCHAR(10) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) DEFAULT 'India',
    challenge_name VARCHAR(255) DEFAULT 'Republic Day Challenge 2026',
    category VARCHAR(50) NOT NULL,
    referral_source VARCHAR(100),
    coupon_code VARCHAR(50),
    coupon_discount DECIMAL(10,2) DEFAULT 0,
    base_amount DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    gst_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    razorpay_order_id VARCHAR(255),
    razorpay_payment_id VARCHAR(255),
    razorpay_signature VARCHAR(255),
    payment_status VARCHAR(50) DEFAULT 'pending',
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_premium_registrations_email ON premium_registrations(email);
CREATE INDEX idx_premium_registrations_phone ON premium_registrations(phone);
CREATE INDEX idx_premium_registrations_payment_status ON premium_registrations(payment_status);
CREATE INDEX idx_premium_registrations_razorpay_order ON premium_registrations(razorpay_order_id);

-- ============================================
-- FREE REGISTRATIONS TABLE
-- ============================================
CREATE TABLE free_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    city VARCHAR(100),
    category VARCHAR(50) NOT NULL,
    referral_source VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_free_registrations_email ON free_registrations(email);
CREATE INDEX idx_free_registrations_phone ON free_registrations(phone);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE coupon_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE free_registrations ENABLE ROW LEVEL SECURITY;

-- Coupon codes: Public can read active coupons
CREATE POLICY "Allow public to read active coupons"
    ON coupon_codes FOR SELECT
    USING (is_active = TRUE AND (valid_until IS NULL OR valid_until > NOW()));

-- Coupon codes: Authenticated users can manage
CREATE POLICY "Allow authenticated to manage coupons"
    ON coupon_codes FOR ALL
    USING (auth.role() = 'authenticated');

-- Premium registrations: Public can insert
CREATE POLICY "Allow public to insert premium registrations"
    ON premium_registrations FOR INSERT
    WITH CHECK (TRUE);

-- Premium registrations: Authenticated can read
CREATE POLICY "Allow authenticated to read premium registrations"
    ON premium_registrations FOR SELECT
    USING (auth.role() = 'authenticated');

-- Free registrations: Public can insert
CREATE POLICY "Allow public to insert free registrations"
    ON free_registrations FOR INSERT
    WITH CHECK (TRUE);

-- Free registrations: Authenticated can read
CREATE POLICY "Allow authenticated to read free registrations"
    ON free_registrations FOR SELECT
    USING (auth.role() = 'authenticated');

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function: Validate Coupon
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
    SELECT * INTO coupon FROM coupon_codes 
    WHERE code = UPPER(coupon_code_input) 
    AND is_active = TRUE
    AND (valid_from IS NULL OR valid_from <= NOW())
    AND (valid_until IS NULL OR valid_until > NOW());
    
    IF coupon IS NULL THEN
        RETURN QUERY SELECT FALSE, NULL::VARCHAR, NULL::DECIMAL, 0::DECIMAL, 'Invalid coupon code'::TEXT;
        RETURN;
    END IF;
    
    IF coupon.max_uses IS NOT NULL AND coupon.current_uses >= coupon.max_uses THEN
        RETURN QUERY SELECT FALSE, NULL::VARCHAR, NULL::DECIMAL, 0::DECIMAL, 'Coupon usage limit reached'::TEXT;
        RETURN;
    END IF;
    
    IF order_amount < coupon.min_order_value THEN
        RETURN QUERY SELECT FALSE, NULL::VARCHAR, NULL::DECIMAL, 0::DECIMAL, 
            ('Minimum order value is ₹' || coupon.min_order_value::TEXT)::TEXT;
        RETURN;
    END IF;
    
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

-- Function: Increment Coupon Usage
CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_code_input VARCHAR)
RETURNS VOID AS $$
BEGIN
    UPDATE coupon_codes 
    SET current_uses = current_uses + 1, updated_at = NOW()
    WHERE code = UPPER(coupon_code_input);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Create Premium Registration (Bypasses RLS)
CREATE OR REPLACE FUNCTION create_premium_registration(payload JSONB)
RETURNS JSONB AS $$
DECLARE
    new_record premium_registrations;
BEGIN
    INSERT INTO premium_registrations (
        name, email, phone_country_code, phone, 
        address_line1, address_line2, landmark, pincode, city, state, country,
        category, referral_source, coupon_code, coupon_discount,
        base_amount, discount_amount, gst_amount, total_amount,
        payment_status
    ) VALUES (
        payload->>'name',
        payload->>'email',
        payload->>'phone_country_code',
        payload->>'phone',
        payload->>'address_line1',
        payload->>'address_line2',
        payload->>'landmark',
        payload->>'pincode',
        payload->>'city',
        payload->>'state',
        payload->>'country',
        payload->>'category',
        payload->>'referral_source',
        payload->>'coupon_code',
        (payload->>'coupon_discount')::DECIMAL,
        (payload->>'base_amount')::DECIMAL,
        (payload->>'discount_amount')::DECIMAL,
        (payload->>'gst_amount')::DECIMAL,
        (payload->>'total_amount')::DECIMAL,
        'pending'
    )
    RETURNING * INTO new_record;
    
    RETURN to_jsonb(new_record);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Verify and Update Payment (LEVEL 2 SECURITY)
CREATE OR REPLACE FUNCTION verify_and_update_payment(params JSONB)
RETURNS JSONB AS $$
DECLARE
    secret CONSTANT VARCHAR := 'YJ1Fw7rfDOyg8FUvnSekz2iW';
    generated_signature TEXT;
    reg_id UUID;
    order_id VARCHAR;
    payment_id VARCHAR;
    signature VARCHAR;
BEGIN
    -- Extract parameters
    reg_id := (params->>'reg_id')::UUID;
    order_id := params->>'order_id';
    payment_id := params->>'payment_id';
    signature := params->>'signature';
    
    -- Generate expected signature
    generated_signature := encode(hmac(order_id || '|' || payment_id, secret, 'sha256'), 'hex');
    
    -- Verify signature (LEVEL 2 SECURITY)
    IF generated_signature != signature THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid payment signature!');
    END IF;

    -- Update payment status
    UPDATE premium_registrations 
    SET 
        razorpay_order_id = order_id,
        razorpay_payment_id = payment_id,
        razorpay_signature = signature,
        payment_status = 'completed',
        updated_at = NOW()
    WHERE id = reg_id;
    
    RETURN jsonb_build_object('success', true, 'message', 'Payment verified successfully');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Sample Coupons
INSERT INTO coupon_codes (code, discount_type, discount_value, max_uses, description) VALUES
    ('REPUBLIC50', 'fixed', 50.00, 100, 'Republic Day Special - ₹50 off'),
    ('EARLYBIRD', 'percentage', 10.00, 50, 'Early Bird - 10% off'),
    ('SAVE398', 'fixed', 398.00, NULL, 'Flat ₹398 off - Pay only ₹1 + GST')
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$ 
BEGIN 
    RAISE NOTICE '✅ Database setup complete!';
    RAISE NOTICE '✅ Tables created: coupon_codes, premium_registrations, free_registrations';
    RAISE NOTICE '✅ RLS policies enabled';
    RAISE NOTICE '✅ Functions created: validate_coupon, increment_coupon_usage, create_premium_registration, verify_and_update_payment';
    RAISE NOTICE '✅ Sample coupons added: REPUBLIC50, EARLYBIRD, SAVE398';
END $$;
