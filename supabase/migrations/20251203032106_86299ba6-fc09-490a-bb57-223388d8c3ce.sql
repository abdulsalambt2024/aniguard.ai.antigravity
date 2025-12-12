-- Push notification subscriptions
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own subscriptions"
ON public.push_subscriptions FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Verification badges (super admin controlled)
CREATE TABLE IF NOT EXISTS public.verification_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  badge_type TEXT NOT NULL DEFAULT 'verified', -- 'verified', 'admin', 'super_admin'
  granted_by UUID NOT NULL,
  granted_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.verification_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view badges"
ON public.verification_badges FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Super admins can manage badges"
ON public.verification_badges FOR ALL
USING (has_role(auth.uid(), 'super_admin'))
WITH CHECK (has_role(auth.uid(), 'super_admin'));

-- Member performance stats (cached/calculated)
CREATE TABLE IF NOT EXISTS public.member_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  attendance_percentage NUMERIC DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  tasks_total INTEGER DEFAULT 0,
  events_participated INTEGER DEFAULT 0,
  posts_created INTEGER DEFAULT 0,
  contribution_score INTEGER DEFAULT 0,
  last_calculated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.member_statistics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own stats"
ON public.member_statistics FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all stats"
ON public.member_statistics FOR SELECT
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "System can manage stats"
ON public.member_statistics FOR ALL
USING (true)
WITH CHECK (true);

-- Add is_private column to chat_rooms for 1-to-1 chats
ALTER TABLE public.chat_rooms ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false;

-- Add edit tracking to messages
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ;

-- Feedback and suggestions tables
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create feedback"
ON public.feedback FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their feedback"
ON public.feedback FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all feedback"
ON public.feedback FOR SELECT
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can update feedback"
ON public.feedback FOR UPDATE
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE TABLE IF NOT EXISTS public.suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create suggestions"
ON public.suggestions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their suggestions"
ON public.suggestions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all suggestions"
ON public.suggestions FOR SELECT
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can update suggestions"
ON public.suggestions FOR UPDATE
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE push_subscriptions;
ALTER PUBLICATION supabase_realtime ADD TABLE verification_badges;
ALTER PUBLICATION supabase_realtime ADD TABLE member_statistics;
ALTER PUBLICATION supabase_realtime ADD TABLE feedback;
ALTER PUBLICATION supabase_realtime ADD TABLE suggestions;