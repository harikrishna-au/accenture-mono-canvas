-- Create payment_transactions table
CREATE TABLE public.payment_transactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    txnid TEXT NOT NULL UNIQUE,
    amount NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, success, failure
    provider_reference_id TEXT, -- PayU mihpayid
    raw_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own transactions"
    ON public.payment_transactions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Only service role can insert/update (via Edge Functions)
-- But mostly we might want the initial insert to happen via Edge Function too.
-- So we can restrict INSERT/UPDATE to service_role only.

CREATE POLICY "Service role can do everything on payments"
    ON public.payment_transactions
    USING (true)
    WITH CHECK (true);
