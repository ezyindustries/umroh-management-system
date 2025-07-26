-- Add new fields to packages table
ALTER TABLE core.packages 
ADD COLUMN IF NOT EXISTS brochure_image TEXT,
ADD COLUMN IF NOT EXISTS package_info TEXT;

-- Add comment for documentation
COMMENT ON COLUMN core.packages.brochure_image IS 'URL or base64 data of package brochure image';
COMMENT ON COLUMN core.packages.package_info IS 'Detailed information about the package including facilities, itinerary, etc';