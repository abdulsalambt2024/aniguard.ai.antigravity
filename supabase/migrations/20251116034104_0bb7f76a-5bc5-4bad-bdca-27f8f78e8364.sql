-- Add tasks table for admin-assigned tasks to members
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID NOT NULL,
  assigned_by UUID NOT NULL,
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Add achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  badge_url TEXT,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  category TEXT
);

-- Add 2FA table for super admins
CREATE TABLE IF NOT EXISTS public.user_2fa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  secret TEXT NOT NULL,
  backup_codes TEXT[],
  enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add payment tracking to campaigns
ALTER TABLE public.campaigns 
ADD COLUMN IF NOT EXISTS upi_id TEXT,
ADD COLUMN IF NOT EXISTS qr_code_url TEXT;

-- Add bio to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add notification table for task assignments
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('task', 'achievement', 'announcement', 'system')),
  related_id UUID,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_2fa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Tasks RLS policies
CREATE POLICY "Admins can create tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (
    auth.uid() = assigned_by AND 
    (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'))
  );

CREATE POLICY "Users can view their assigned tasks"
  ON public.tasks FOR SELECT
  USING (auth.uid() = assigned_to OR auth.uid() = assigned_by);

CREATE POLICY "Admins can view all tasks"
  ON public.tasks FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can update their task status"
  ON public.tasks FOR UPDATE
  USING (auth.uid() = assigned_to)
  WITH CHECK (auth.uid() = assigned_to);

CREATE POLICY "Admins can update any task"
  ON public.tasks FOR UPDATE
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can delete tasks"
  ON public.tasks FOR DELETE
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

-- Achievements RLS policies
CREATE POLICY "Users can view their own achievements"
  ON public.achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view all achievements"
  ON public.achievements FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can create achievements"
  ON public.achievements FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

-- 2FA RLS policies
CREATE POLICY "Users can view their own 2FA"
  ON public.user_2fa FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own 2FA"
  ON public.user_2fa FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Notifications RLS policies
CREATE POLICY "Users can view their notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Add second super admin
SELECT public.assign_super_admin_by_email('hayatamr9608@gmail.com');

-- Protect super admin roles from being changed
CREATE OR REPLACE FUNCTION public.protect_super_admins()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent deletion or modification of super admin roles for protected emails
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER protect_super_admin_roles
  BEFORE UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_super_admins();

-- Function to create notification when task is assigned
CREATE OR REPLACE FUNCTION public.notify_task_assignment()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_task_created
  AFTER INSERT ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_task_assignment();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE achievements;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;