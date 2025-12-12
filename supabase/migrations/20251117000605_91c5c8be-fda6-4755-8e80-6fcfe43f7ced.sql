-- Extend profiles table with additional fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS father_name TEXT,
ADD COLUMN IF NOT EXISTS course TEXT,
ADD COLUMN IF NOT EXISTS branch TEXT,
ADD COLUMN IF NOT EXISTS roll_number TEXT,
ADD COLUMN IF NOT EXISTS year TEXT,
ADD COLUMN IF NOT EXISTS semester TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Create slideshows table for home page carousel
CREATE TABLE IF NOT EXISTS public.slideshows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create popups table for scheduled messages
CREATE TABLE IF NOT EXISTS public.popups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  image_url TEXT,
  popup_type TEXT NOT NULL, -- 'birthday', 'festival', 'announcement'
  is_active BOOLEAN DEFAULT true,
  show_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.slideshows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.popups ENABLE ROW LEVEL SECURITY;

-- RLS Policies for slideshows
CREATE POLICY "Everyone can view active slideshows"
ON public.slideshows FOR SELECT
USING (auth.role() = 'authenticated' AND is_active = true);

CREATE POLICY "Admins can create slideshows"
ON public.slideshows FOR INSERT
WITH CHECK (
  auth.uid() = created_by AND 
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
);

CREATE POLICY "Admins can update slideshows"
ON public.slideshows FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins can delete slideshows"
ON public.slideshows FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- RLS Policies for popups
CREATE POLICY "Everyone can view active popups"
ON public.popups FOR SELECT
USING (auth.role() = 'authenticated' AND is_active = true);

CREATE POLICY "Admins can create popups"
ON public.popups FOR INSERT
WITH CHECK (
  auth.uid() = created_by AND 
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
);

CREATE POLICY "Admins can update popups"
ON public.popups FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins can delete popups"
ON public.popups FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Add triggers for updated_at
CREATE TRIGGER update_slideshows_updated_at
BEFORE UPDATE ON public.slideshows
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_popups_updated_at
BEFORE UPDATE ON public.popups
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.slideshows;
ALTER PUBLICATION supabase_realtime ADD TABLE public.popups;

-- Update achievements table to support automatic awarding
ALTER TABLE public.achievements
ADD COLUMN IF NOT EXISTS achievement_type TEXT, -- 'task_completion', 'post_engagement', 'event_attendance'
ADD COLUMN IF NOT EXISTS milestone_count INTEGER DEFAULT 0;