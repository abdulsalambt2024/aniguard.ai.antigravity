-- Update user_2fa table for complete TOTP implementation
ALTER TABLE public.user_2fa
ADD COLUMN IF NOT EXISTS qr_code_url TEXT,
ADD COLUMN IF NOT EXISTS recovery_codes_hashed TEXT[];

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_2fa_user_id ON public.user_2fa(user_id);
CREATE INDEX IF NOT EXISTS idx_user_2fa_enabled ON public.user_2fa(enabled);

-- Update campaigns table for enhanced donation features
ALTER TABLE public.campaigns
ADD COLUMN IF NOT EXISTS short_description TEXT,
ADD COLUMN IF NOT EXISTS amount_presets INTEGER[] DEFAULT ARRAY[100, 500, 1000, 5000];

-- Create donation_receipts table
CREATE TABLE IF NOT EXISTS public.donation_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id UUID NOT NULL REFERENCES public.donations(id) ON DELETE CASCADE,
  receipt_number TEXT NOT NULL UNIQUE,
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on donation_receipts
ALTER TABLE public.donation_receipts ENABLE ROW LEVEL SECURITY;

-- Create policy for donation receipts
CREATE POLICY "Users can view their own donation receipts"
ON public.donation_receipts
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.donations
    WHERE donations.id = donation_receipts.donation_id
    AND (donations.user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
  )
);

CREATE POLICY "System can create donation receipts"
ON public.donation_receipts
FOR INSERT
WITH CHECK (true);

-- Create chatbot_faq table for admin-managed FAQ
CREATE TABLE IF NOT EXISTS public.chatbot_faq (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  keywords TEXT[],
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.chatbot_faq ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view FAQ"
ON public.chatbot_faq
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage FAQ"
ON public.chatbot_faq
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Create chatbot_conversations table for chat history
CREATE TABLE IF NOT EXISTS public.chatbot_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.chatbot_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own chatbot conversations"
ON public.chatbot_conversations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create chatbot conversations"
ON public.chatbot_conversations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Update messages table for enhanced chat features
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS reply_to_message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS pinned_by UUID,
ADD COLUMN IF NOT EXISTS pinned_at TIMESTAMPTZ;

-- Create message_read_status table for seen ticks
CREATE TABLE IF NOT EXISTS public.message_read_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  read_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(message_id, user_id)
);

ALTER TABLE public.message_read_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view read status in their rooms"
ON public.message_read_status
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM messages m
    JOIN chat_participants cp ON cp.room_id = m.room_id
    WHERE m.id = message_read_status.message_id
    AND cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can mark messages as read"
ON public.message_read_status
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create typing_indicators table
CREATE TABLE IF NOT EXISTS public.typing_indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  is_typing BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(room_id, user_id)
);

ALTER TABLE public.typing_indicators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view typing indicators in their rooms"
ON public.typing_indicators
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM chat_participants
    WHERE chat_participants.room_id = typing_indicators.room_id
    AND chat_participants.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their typing status"
ON public.typing_indicators
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.donation_receipts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_read_status;
ALTER PUBLICATION supabase_realtime ADD TABLE public.typing_indicators;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chatbot_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chatbot_faq;

-- Add replica identity for realtime
ALTER TABLE public.donation_receipts REPLICA IDENTITY FULL;
ALTER TABLE public.message_read_status REPLICA IDENTITY FULL;
ALTER TABLE public.typing_indicators REPLICA IDENTITY FULL;
ALTER TABLE public.chatbot_conversations REPLICA IDENTITY FULL;
ALTER TABLE public.chatbot_faq REPLICA IDENTITY FULL;

-- Create admin_tasks table for task panel with badge generation
CREATE TABLE IF NOT EXISTS public.admin_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT NOT NULL, -- 'badge_generation', 'user_management', 'content_moderation', etc.
  status TEXT DEFAULT 'pending',
  assigned_to UUID,
  created_by UUID NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.admin_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage admin tasks"
ON public.admin_tasks
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Update profiles RLS policy to protect student data
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view limited profile data"
ON public.profiles
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- Update notifications policy to restrict creation
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

CREATE POLICY "System and admins can create notifications"
ON public.notifications
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- Create function to generate UPI QR code data
CREATE OR REPLACE FUNCTION public.generate_upi_qr_data(
  upi_id TEXT,
  payee_name TEXT,
  amount NUMERIC DEFAULT NULL,
  note TEXT DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  qr_data TEXT;
BEGIN
  qr_data := 'upi://pay?pa=' || upi_id || '&pn=' || encode(payee_name::bytea, 'escape');
  
  IF amount IS NOT NULL THEN
    qr_data := qr_data || '&am=' || amount::TEXT;
  END IF;
  
  IF note IS NOT NULL THEN
    qr_data := qr_data || '&tn=' || encode(note::bytea, 'escape');
  END IF;
  
  RETURN qr_data;
END;
$$;