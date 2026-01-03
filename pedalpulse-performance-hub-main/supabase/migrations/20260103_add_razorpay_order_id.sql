-- Add razorpay_order_id column to premium_registrations table
-- This stores the order ID from Razorpay for tracking and verification

ALTER TABLE premium_registrations 
ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(100);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_premium_registrations_order_id 
ON premium_registrations(razorpay_order_id);

-- Add comment
COMMENT ON COLUMN premium_registrations.razorpay_order_id IS 'Razorpay order ID for payment tracking (created before payment)';
