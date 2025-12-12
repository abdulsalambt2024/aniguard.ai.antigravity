-- Fix member_statistics RLS policies (remove overly permissive policy)
DROP POLICY IF EXISTS "System can manage stats" ON public.member_statistics;

-- Create proper admin-only policies for member_statistics
CREATE POLICY "Admins can insert statistics"
ON public.member_statistics
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins can update statistics"
ON public.member_statistics
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can delete statistics"
ON public.member_statistics
FOR DELETE
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Add SET search_path to all trigger functions that need it
ALTER FUNCTION public.update_post_likes_count() SET search_path = 'public';
ALTER FUNCTION public.update_post_comments_count() SET search_path = 'public';
ALTER FUNCTION public.update_event_attendees_count() SET search_path = 'public';
ALTER FUNCTION public.update_chat_updated_at() SET search_path = 'public';
ALTER FUNCTION public.update_campaign_amount() SET search_path = 'public';
ALTER FUNCTION public.update_updated_at_column() SET search_path = 'public';
ALTER FUNCTION public.generate_upi_qr_data(text, text, numeric, text) SET search_path = 'public';
ALTER FUNCTION public.handle_new_user() SET search_path = 'public';

-- Add pending_verification status tracking to payment_transactions
-- Update existing 'pending' payments to distinguish from pending_verification
ALTER TABLE public.payment_transactions
ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'unverified';

-- Add admin_verified_by column to track who approved the payment
ALTER TABLE public.payment_transactions
ADD COLUMN IF NOT EXISTS admin_verified_by uuid REFERENCES auth.users(id);

-- Add admin_verified_at timestamp
ALTER TABLE public.payment_transactions
ADD COLUMN IF NOT EXISTS admin_verified_at timestamp with time zone;

-- Create policy for admins to update verification status
CREATE POLICY "Admins can verify payment transactions"
ON public.payment_transactions
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Add policy for super admins to delete users from verification badges (cleanup)
DROP POLICY IF EXISTS "Super admins can manage all badges" ON public.verification_badges;
CREATE POLICY "Super admins can manage all badges"
ON public.verification_badges
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));