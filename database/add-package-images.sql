-- Add package_images field to store multiple images as JSON array
ALTER TABLE core.packages 
ADD COLUMN IF NOT EXISTS package_images JSON;

-- Add comment for documentation
COMMENT ON COLUMN core.packages.package_images IS 'JSON array of package images URLs or base64 data';

-- Example JSON structure:
-- [
--   {"url": "data:image/jpeg;base64,...", "caption": "Hotel Makkah", "order": 1},
--   {"url": "data:image/jpeg;base64,...", "caption": "Hotel Madinah", "order": 2}
-- ]