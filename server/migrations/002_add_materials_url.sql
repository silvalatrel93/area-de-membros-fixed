
-- Add materials_url column to modules table if it doesn't exist
ALTER TABLE modules 
ADD COLUMN IF NOT EXISTS materials_url TEXT;
