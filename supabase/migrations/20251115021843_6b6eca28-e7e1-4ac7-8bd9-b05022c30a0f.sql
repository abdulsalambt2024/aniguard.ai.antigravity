-- Phase 5: Complete Backend Schema - Donations Platform
-- Create donations campaigns table
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  target_amount DECIMAL(10, 2) NOT NULL,
  current_amount DECIMAL(10, 2) DEFAULT 0,
  banner_url TEXT,
  category TEXT,
  status TEXT DEFAULT 'active',
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create donations table
CREATE TABLE IF NOT EXISTS public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  user_id UUID,
  donor_name TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  message TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  payment_method TEXT,
  payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI usage tracking table
CREATE TABLE IF NOT EXISTS public.ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  feature_type TEXT NOT NULL, -- 'image_generation', 'image_enhancement', 'poster_design'
  prompt TEXT,
  result_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for campaigns
CREATE POLICY "Anyone can view active campaigns"
  ON public.campaigns FOR SELECT
  USING (status = 'active' OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can create campaigns"
  ON public.campaigns FOR INSERT
  WITH CHECK (
    auth.uid() = created_by AND 
    (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'))
  );

CREATE POLICY "Admins can update campaigns"
  ON public.campaigns FOR UPDATE
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can delete campaigns"
  ON public.campaigns FOR DELETE
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

-- RLS Policies for donations
CREATE POLICY "Anyone can view non-anonymous donations"
  ON public.donations FOR SELECT
  USING (NOT is_anonymous OR auth.uid() = user_id);

CREATE POLICY "Anyone can create donations"
  ON public.donations FOR INSERT
  WITH CHECK (true);

-- RLS Policies for AI usage
CREATE POLICY "Users can view their own AI usage"
  ON public.ai_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Members can create AI usage records"
  ON public.ai_usage FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND 
    (has_role(auth.uid(), 'member') OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'))
  );

-- Triggers for updated_at
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to update campaign current_amount
CREATE OR REPLACE FUNCTION public.update_campaign_amount()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.campaigns 
  SET current_amount = current_amount + NEW.amount 
  WHERE id = NEW.campaign_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_campaign_amount_trigger
  AFTER INSERT ON public.donations
  FOR EACH ROW EXECUTE FUNCTION public.update_campaign_amount();

-- Function to assign super admin role by email
CREATE OR REPLACE FUNCTION public.assign_super_admin_by_email(_email TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id UUID;
BEGIN
  -- Get user_id from auth.users by email
  SELECT id INTO _user_id
  FROM auth.users
  WHERE email = _email;

  IF _user_id IS NOT NULL THEN
    -- Delete existing role if any
    DELETE FROM public.user_roles WHERE user_id = _user_id;
    
    -- Insert super_admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_user_id, 'super_admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END;
$$;

-- Assign super admin to abdul.salam.bt.2024@miet.ac.in
-- This will work once the user signs up
DO $$
BEGIN
  PERFORM public.assign_super_admin_by_email('abdul.salam.bt.2024@miet.ac.in');
END $$;

-- Enable Realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.campaigns;
ALTER PUBLICATION supabase_realtime ADD TABLE public.donations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_usage;