-- ============================================================
-- COUPON SYSTEM - Secure Implementation
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    
    -- Discount configuration
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value > 0),
    
    -- Applicability
    challenge_name VARCHAR(255), -- NULL means applies to all challenges
    min_order_value NUMERIC(10, 2) DEFAULT 0,
    max_discount_amount NUMERIC(10, 2), -- Cap for percentage discounts
    
    -- Usage limits
    max_uses INTEGER, -- NULL means unlimited
    max_uses_per_user INTEGER DEFAULT 1,
    current_uses INTEGER DEFAULT 0,
    
    -- Validity period
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create coupon usage tracking table
CREATE TABLE IF NOT EXISTS coupon_usages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    registration_id UUID, -- Will reference registrations
    discount_applied NUMERIC(10, 2) NOT NULL,
    original_amount NUMERIC(10, 2) NOT NULL,
    final_amount NUMERIC(10, 2) NOT NULL,
    used_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usages ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for coupons
-- Users can validate coupons (limited select)
CREATE POLICY "Users can validate coupons"
ON coupons FOR SELECT
USING (is_active = true);

-- Only admins can manage coupons
CREATE POLICY "Admins can manage coupons"
ON coupons FOR ALL
USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);

-- 5. RLS Policies for coupon_usages
-- Users can see their own usage
CREATE POLICY "Users can view own coupon usage"
ON coupon_usages FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all usage
CREATE POLICY "Admins can view all coupon usage"
ON coupon_usages FOR SELECT
USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
);

-- Only service role can insert usage (via Edge Function)
CREATE POLICY "Service role can insert usage"
ON coupon_usages FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- 6. Create function to validate coupon (used by Edge Function)
CREATE OR REPLACE FUNCTION validate_coupon(
    p_code VARCHAR,
    p_challenge_name VARCHAR,
    p_user_id UUID,
    p_order_amount NUMERIC
)
RETURNS TABLE (
    is_valid BOOLEAN,
    coupon_id UUID,
    discount_type VARCHAR,
    discount_value NUMERIC,
    final_discount NUMERIC,
    error_message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_coupon RECORD;
    v_user_uses INTEGER;
    v_calculated_discount NUMERIC;
BEGIN
    -- Find the coupon
    SELECT * INTO v_coupon
    FROM coupons
    WHERE UPPER(code) = UPPER(p_code)
    AND is_active = true;
    
    -- Coupon not found
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, NULL::UUID, NULL::VARCHAR, NULL::NUMERIC, NULL::NUMERIC, 'Invalid coupon code'::TEXT;
        RETURN;
    END IF;
    
    -- Check validity period
    IF v_coupon.valid_from > NOW() THEN
        RETURN QUERY SELECT false, NULL::UUID, NULL::VARCHAR, NULL::NUMERIC, NULL::NUMERIC, 'Coupon is not yet active'::TEXT;
        RETURN;
    END IF;
    
    IF v_coupon.valid_until IS NOT NULL AND v_coupon.valid_until < NOW() THEN
        RETURN QUERY SELECT false, NULL::UUID, NULL::VARCHAR, NULL::NUMERIC, NULL::NUMERIC, 'Coupon has expired'::TEXT;
        RETURN;
    END IF;
    
    -- Check challenge applicability
    IF v_coupon.challenge_name IS NOT NULL AND v_coupon.challenge_name != p_challenge_name THEN
        RETURN QUERY SELECT false, NULL::UUID, NULL::VARCHAR, NULL::NUMERIC, NULL::NUMERIC, 'Coupon not valid for this challenge'::TEXT;
        RETURN;
    END IF;
    
    -- Check minimum order value
    IF p_order_amount < v_coupon.min_order_value THEN
        RETURN QUERY SELECT false, NULL::UUID, NULL::VARCHAR, NULL::NUMERIC, NULL::NUMERIC, 
            ('Minimum order of ₹' || v_coupon.min_order_value || ' required')::TEXT;
        RETURN;
    END IF;
    
    -- Check global usage limit
    IF v_coupon.max_uses IS NOT NULL AND v_coupon.current_uses >= v_coupon.max_uses THEN
        RETURN QUERY SELECT false, NULL::UUID, NULL::VARCHAR, NULL::NUMERIC, NULL::NUMERIC, 'Coupon usage limit reached'::TEXT;
        RETURN;
    END IF;
    
    -- Check per-user usage limit
    IF v_coupon.max_uses_per_user IS NOT NULL THEN
        SELECT COUNT(*) INTO v_user_uses
        FROM coupon_usages
        WHERE coupon_id = v_coupon.id AND user_id = p_user_id;
        
        IF v_user_uses >= v_coupon.max_uses_per_user THEN
            RETURN QUERY SELECT false, NULL::UUID, NULL::VARCHAR, NULL::NUMERIC, NULL::NUMERIC, 'You have already used this coupon'::TEXT;
            RETURN;
        END IF;
    END IF;
    
    -- Calculate discount
    IF v_coupon.discount_type = 'percentage' THEN
        v_calculated_discount := (p_order_amount * v_coupon.discount_value / 100);
        -- Apply max discount cap if set
        IF v_coupon.max_discount_amount IS NOT NULL AND v_calculated_discount > v_coupon.max_discount_amount THEN
            v_calculated_discount := v_coupon.max_discount_amount;
        END IF;
    ELSE
        v_calculated_discount := v_coupon.discount_value;
    END IF;
    
    -- Ensure discount doesn't exceed order amount
    IF v_calculated_discount > p_order_amount THEN
        v_calculated_discount := p_order_amount;
    END IF;
    
    -- Return success
    RETURN QUERY SELECT 
        true,
        v_coupon.id,
        v_coupon.discount_type,
        v_coupon.discount_value,
        v_calculated_discount,
        NULL::TEXT;
END;
$$;

-- 7. Add coupon columns to registrations table
ALTER TABLE registrations
ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS coupon_discount NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS original_amount NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS final_amount NUMERIC(10, 2);

-- 8. Create some sample coupons for testing
INSERT INTO coupons (code, description, discount_type, discount_value, challenge_name, max_uses, valid_until)
VALUES 
    ('REPUBLIC10', '10% off Republic Day Challenge', 'percentage', 10, 'Republic Day 2026', 100, '2026-01-26 23:59:59+05:30'),
    ('FLAT50', '₹50 off any challenge', 'fixed', 50, NULL, 50, '2025-12-31 23:59:59+05:30'),
    ('NEWUSER', '20% off for new users (max ₹100)', 'percentage', 20, NULL, NULL, NULL)
ON CONFLICT (code) DO NOTHING;

-- Update NEWUSER to have max discount
UPDATE coupons SET max_discount_amount = 100 WHERE code = 'NEWUSER';

-- 9. Create helper function to increment coupon usage
CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE coupons 
    SET current_uses = COALESCE(current_uses, 0) + 1,
        updated_at = NOW()
    WHERE id = coupon_id;
END;
$$;

-- ============================================================
-- IMPORTANT: After running this, deploy the validate-coupon Edge Function
-- ============================================================
