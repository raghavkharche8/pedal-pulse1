-- Add phone_country_code column to free_registrations
ALTER TABLE free_registrations 
ADD COLUMN IF NOT EXISTS phone_country_code VARCHAR(10) DEFAULT '+91';
