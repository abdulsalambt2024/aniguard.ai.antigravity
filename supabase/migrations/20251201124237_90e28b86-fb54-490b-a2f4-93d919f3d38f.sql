-- Create error_logs table for production logging
CREATE TABLE IF NOT EXISTS public.error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  error_message TEXT NOT NULL,
  error_stack TEXT,
  component_name TEXT,
  user_agent TEXT,
  url TEXT,
  severity TEXT DEFAULT 'error',
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on error_logs
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can insert their own logs
CREATE POLICY "Users can insert their own error logs"
  ON public.error_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Only super_admins can view error logs
CREATE POLICY "Super admins can view all error logs"
  ON public.error_logs
  FOR SELECT
  USING (public.has_role(auth.uid(), 'super_admin'));

-- Create index for faster queries
CREATE INDEX idx_error_logs_created_at ON public.error_logs(created_at DESC);
CREATE INDEX idx_error_logs_user_id ON public.error_logs(user_id);
CREATE INDEX idx_error_logs_severity ON public.error_logs(severity);

-- Add search_path protection to functions that are missing it
-- Update protect_super_admins function
CREATE OR REPLACE FUNCTION public.protect_super_admins()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'DELETE' OR TG_OP = 'UPDATE') AND OLD.role = 'super_admin' THEN
    IF EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = OLD.user_id 
      AND email IN ('abdul.salam.bt.2024@miet.ac.in', 'hayatamr9608@gmail.com')
    ) THEN
      RAISE EXCEPTION 'Cannot modify protected super admin roles';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Update notify_task_assignment function
CREATE OR REPLACE FUNCTION public.notify_task_assignment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, related_id)
  VALUES (
    NEW.assigned_to,
    'New Task Assigned',
    'You have been assigned a new task: ' || NEW.title,
    'task',
    NEW.id
  );
  RETURN NEW;
END;
$$;

-- Create payment_transactions table for secure payment tracking
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id UUID REFERENCES public.donations(id),
  campaign_id UUID REFERENCES public.campaigns(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  amount NUMERIC NOT NULL,
  payment_gateway TEXT NOT NULL, -- 'upi', 'razorpay', etc.
  payment_id TEXT UNIQUE, -- Gateway payment ID
  transaction_id TEXT, -- Gateway transaction ID
  status TEXT DEFAULT 'pending', -- 'pending', 'success', 'failed', 'refunded'
  payment_method TEXT,
  gateway_response JSONB,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view their own transactions"
  ON public.payment_transactions
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Only system can insert (via edge function)
CREATE POLICY "System can insert transactions"
  ON public.payment_transactions
  FOR INSERT
  WITH CHECK (true);

-- Only system can update (via edge function)
CREATE POLICY "System can update transactions"
  ON public.payment_transactions
  FOR UPDATE
  USING (true);

-- Admins can view all transactions
CREATE POLICY "Admins can view all transactions"
  ON public.payment_transactions
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE INDEX idx_payment_transactions_status ON public.payment_transactions(status);
CREATE INDEX idx_payment_transactions_payment_id ON public.payment_transactions(payment_id);
CREATE INDEX idx_payment_transactions_campaign_id ON public.payment_transactions(campaign_id);

-- Add webhook_secret column to campaigns for payment verification
ALTER TABLE public.campaigns 
ADD COLUMN IF NOT EXISTS webhook_secret TEXT;