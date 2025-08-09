
-- Add crypto wallet fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN wallet_address text,
ADD COLUMN split_contract_address text,
ADD COLUMN crypto_earnings_cents integer DEFAULT 0,
ADD COLUMN last_crypto_withdrawal_at timestamp with time zone;

-- Create table to track split contracts for each author
CREATE TABLE public.split_contracts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  contract_address text NOT NULL UNIQUE,
  chain_id integer NOT NULL DEFAULT 137, -- Polygon mainnet
  deployment_tx_hash text,
  platform_share_percentage integer NOT NULL DEFAULT 10,
  author_share_percentage integer NOT NULL DEFAULT 90,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create table to track crypto transactions
CREATE TABLE public.crypto_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id uuid REFERENCES public.books(id) ON DELETE SET NULL,
  author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  split_contract_address text NOT NULL,
  transaction_hash text UNIQUE,
  amount_usdc_cents integer NOT NULL,
  platform_fee_cents integer NOT NULL,
  author_earnings_cents integer NOT NULL,
  payment_status text NOT NULL DEFAULT 'pending',
  wallet_address text NOT NULL,
  chain_id integer NOT NULL DEFAULT 137,
  gas_fee_wei text,
  block_number bigint,
  transaction_data jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  confirmed_at timestamp with time zone,
  failed_at timestamp with time zone,
  failure_reason text
);

-- Create table for platform crypto earnings (10% share)
CREATE TABLE public.platform_crypto_earnings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id uuid NOT NULL REFERENCES public.crypto_transactions(id) ON DELETE CASCADE,
  amount_usdc_cents integer NOT NULL,
  contract_address text NOT NULL,
  chain_id integer NOT NULL DEFAULT 137,
  withdrawn boolean NOT NULL DEFAULT false,
  withdrawn_at timestamp with time zone,
  withdrawal_tx_hash text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create table for crypto withdrawals
CREATE TABLE public.crypto_withdrawals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  split_contract_address text NOT NULL,
  to_wallet_address text NOT NULL,
  amount_usdc_cents integer NOT NULL,
  transaction_hash text UNIQUE,
  chain_id integer NOT NULL DEFAULT 137,
  status text NOT NULL DEFAULT 'pending',
  gas_fee_wei text,
  initiated_at timestamp with time zone NOT NULL DEFAULT now(),
  confirmed_at timestamp with time zone,
  failed_at timestamp with time zone,
  failure_reason text
);

-- Add payment_method to purchases table to track crypto vs stripe
ALTER TABLE public.purchases 
ADD COLUMN payment_method text DEFAULT 'stripe',
ADD COLUMN crypto_transaction_id uuid REFERENCES public.crypto_transactions(id);

-- Add indexes for performance
CREATE INDEX idx_split_contracts_author_id ON public.split_contracts(author_id);
CREATE INDEX idx_split_contracts_contract_address ON public.split_contracts(contract_address);
CREATE INDEX idx_crypto_transactions_user_id ON public.crypto_transactions(user_id);
CREATE INDEX idx_crypto_transactions_author_id ON public.crypto_transactions(author_id);
CREATE INDEX idx_crypto_transactions_status ON public.crypto_transactions(payment_status);
CREATE INDEX idx_crypto_transactions_hash ON public.crypto_transactions(transaction_hash);
CREATE INDEX idx_crypto_withdrawals_user_id ON public.crypto_withdrawals(user_id);
CREATE INDEX idx_platform_crypto_earnings_withdrawn ON public.platform_crypto_earnings(withdrawn);

-- Enable RLS on new tables
ALTER TABLE public.split_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_crypto_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_withdrawals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for split_contracts
CREATE POLICY "Authors can view their own split contracts" 
  ON public.split_contracts FOR SELECT 
  USING (auth.uid() = author_id);

CREATE POLICY "Admins can view all split contracts" 
  ON public.split_contracts FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_role = 'admin'
    )
  );

-- RLS Policies for crypto_transactions
CREATE POLICY "Users can view their own crypto transactions" 
  ON public.crypto_transactions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Authors can view transactions for their books" 
  ON public.crypto_transactions FOR SELECT 
  USING (auth.uid() = author_id);

CREATE POLICY "Admins can view all crypto transactions" 
  ON public.crypto_transactions FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_role = 'admin'
    )
  );

-- RLS Policies for platform_crypto_earnings (admin only)
CREATE POLICY "Only admins can view platform crypto earnings" 
  ON public.platform_crypto_earnings FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_role = 'admin'
    )
  );

-- RLS Policies for crypto_withdrawals
CREATE POLICY "Users can view their own crypto withdrawals" 
  ON public.crypto_withdrawals FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own crypto withdrawals" 
  ON public.crypto_withdrawals FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all crypto withdrawals" 
  ON public.crypto_withdrawals FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND user_role = 'admin'
    )
  );

-- Function to update crypto earnings when transactions are confirmed
CREATE OR REPLACE FUNCTION public.update_crypto_earnings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Only process when transaction is confirmed
  IF NEW.payment_status = 'completed' AND OLD.payment_status != 'completed' THEN
    -- Update author's crypto earnings
    UPDATE public.profiles 
    SET crypto_earnings_cents = COALESCE(crypto_earnings_cents, 0) + NEW.author_earnings_cents
    WHERE id = NEW.author_id;
    
    -- Create platform earning record
    INSERT INTO public.platform_crypto_earnings (
      transaction_id,
      amount_usdc_cents,
      contract_address,
      chain_id
    )
    VALUES (
      NEW.id,
      NEW.platform_fee_cents,
      NEW.split_contract_address,
      NEW.chain_id
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger for crypto earnings updates
CREATE TRIGGER update_crypto_earnings_trigger
  AFTER UPDATE ON public.crypto_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_crypto_earnings();
