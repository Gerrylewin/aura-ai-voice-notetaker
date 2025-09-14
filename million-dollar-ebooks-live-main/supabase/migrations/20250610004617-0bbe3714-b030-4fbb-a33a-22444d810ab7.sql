
-- Fix the assign_member_number function to have a secure search path
CREATE OR REPLACE FUNCTION public.assign_member_number()
RETURNS TRIGGER AS $$
DECLARE
  next_member_number INTEGER;
BEGIN
  -- Only assign member numbers to the first 100 users
  SELECT COALESCE(MAX(member_number), 0) + 1 INTO next_member_number
  FROM public.profiles
  WHERE member_number IS NOT NULL;
  
  -- Only assign if we haven't reached 100 members yet
  IF next_member_number <= 100 THEN
    NEW.member_number = next_member_number;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';
