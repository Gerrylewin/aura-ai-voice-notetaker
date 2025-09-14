-- Migration: Enforce $1.00 maximum book price and update existing books
-- This migration ensures all books are priced at $1.00 or free, simplifying the pricing model

-- First, update all existing books to $1.00 if they're currently priced higher
UPDATE public.books 
SET price_cents = 100 
WHERE price_cents > 100;

-- Add a check constraint to enforce the $1.00 maximum price
ALTER TABLE public.books 
ADD CONSTRAINT books_price_cents_max_check 
CHECK (price_cents >= 0 AND price_cents <= 100);

-- Update the default value for new books to $1.00
ALTER TABLE public.books 
ALTER COLUMN price_cents SET DEFAULT 100;

-- Add a comment to document the pricing policy
COMMENT ON COLUMN public.books.price_cents IS 'Price in cents. Maximum $1.00 (100 cents) or free (0 cents)';

-- Update series pricing to also respect the $1.00 maximum
UPDATE public.books 
SET series_price_cents = LEAST(series_price_cents, 100) 
WHERE series_price_cents > 100;

-- Add constraint for series pricing as well
ALTER TABLE public.books 
ADD CONSTRAINT books_series_price_cents_max_check 
CHECK (series_price_cents IS NULL OR (series_price_cents >= 0 AND series_price_cents <= 100));

-- Update crypto transaction amounts to reflect the new pricing
-- Note: This is a data migration - existing transactions should remain as-is
-- But we'll add a comment for future reference
COMMENT ON COLUMN public.crypto_transactions.amount_usdc_cents IS 'Amount in USDC cents. With $1.00 max book price, this will typically be 100 cents or 0 for free books';

-- Create an index for efficient price-based queries
CREATE INDEX IF NOT EXISTS idx_books_price_cents ON public.books(price_cents);

-- Add a function to validate book pricing on insert/update
CREATE OR REPLACE FUNCTION validate_book_pricing()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure price is within allowed range
  IF NEW.price_cents < 0 OR NEW.price_cents > 100 THEN
    RAISE EXCEPTION 'Book price must be between $0.00 and $1.00 (0-100 cents)';
  END IF;
  
  -- Ensure series price is within allowed range if specified
  IF NEW.series_price_cents IS NOT NULL AND (NEW.series_price_cents < 0 OR NEW.series_price_cents > 100) THEN
    RAISE EXCEPTION 'Series price must be between $0.00 and $1.00 (0-100 cents)';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce pricing validation
DROP TRIGGER IF EXISTS books_pricing_validation_trigger ON public.books;
CREATE TRIGGER books_pricing_validation_trigger
  BEFORE INSERT OR UPDATE ON public.books
  FOR EACH ROW
  EXECUTE FUNCTION validate_book_pricing();

-- Log the migration
INSERT INTO public.migration_log (migration_name, applied_at, description)
VALUES (
  'enforce_dollar_maximum_pricing',
  now(),
  'Enforced $1.00 maximum book price, updated existing books, and added validation constraints'
) ON CONFLICT DO NOTHING;
