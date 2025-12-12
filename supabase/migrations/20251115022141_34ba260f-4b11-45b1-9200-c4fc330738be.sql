-- Phase 8: Security Optimization - Fix RLS Policies

-- Fix profiles table - restrict to authenticated users only
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Authenticated users can view profiles"
  ON public.profiles FOR SELECT
  USING (auth.role() = 'authenticated');

-- Fix donations table - restrict to campaign creators and admins
DROP POLICY IF EXISTS "Anyone can view non-anonymous donations" ON public.donations;

CREATE POLICY "Admins and campaign creators can view all donations"
  ON public.donations FOR SELECT
  USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'super_admin') OR
    EXISTS (
      SELECT 1 FROM public.campaigns
      WHERE campaigns.id = donations.campaign_id
      AND campaigns.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can view their own donations"
  ON public.donations FOR SELECT
  USING (auth.uid() = user_id);

-- Fix event_rsvps table - restrict to authenticated users
DROP POLICY IF EXISTS "Anyone can view RSVPs" ON public.event_rsvps;

CREATE POLICY "Authenticated users can view RSVPs"
  ON public.event_rsvps FOR SELECT
  USING (auth.role() = 'authenticated');

-- Fix post_likes table - restrict to authenticated users
DROP POLICY IF EXISTS "Anyone can view likes" ON public.post_likes;

CREATE POLICY "Authenticated users can view likes"
  ON public.post_likes FOR SELECT
  USING (auth.role() = 'authenticated');

-- Add missing UPDATE policy for chat_participants
CREATE POLICY "Users can update their own participant record"
  ON public.chat_participants FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add missing UPDATE policy for message_reactions (make immutable)
-- Reactions should not be updatable, only created or deleted

-- Add missing DELETE policy for ai_usage (for privacy)
CREATE POLICY "Users can delete their own AI usage records"
  ON public.ai_usage FOR DELETE
  USING (auth.uid() = user_id);

-- Add missing UPDATE and DELETE policies for announcement_reads
CREATE POLICY "Users can update their own read status"
  ON public.announcement_reads FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own read status"
  ON public.announcement_reads FOR DELETE
  USING (auth.uid() = user_id);

-- Fix comments table - ensure only authenticated users can view
DROP POLICY IF EXISTS "Anyone can view comments" ON public.comments;

CREATE POLICY "Authenticated users can view comments"
  ON public.comments FOR SELECT
  USING (auth.role() = 'authenticated');

-- Fix posts table - ensure only authenticated users can view
DROP POLICY IF EXISTS "Anyone can view posts" ON public.posts;

CREATE POLICY "Authenticated users can view posts"
  ON public.posts FOR SELECT
  USING (auth.role() = 'authenticated');

-- Fix events table - ensure only authenticated users can view
DROP POLICY IF EXISTS "Anyone can view events" ON public.events;

CREATE POLICY "Authenticated users can view events"
  ON public.events FOR SELECT
  USING (auth.role() = 'authenticated');

-- Fix announcements table - ensure only authenticated users can view
DROP POLICY IF EXISTS "Anyone can view announcements" ON public.announcements;

CREATE POLICY "Authenticated users can view announcements"
  ON public.announcements FOR SELECT
  USING (auth.role() = 'authenticated');

-- Fix campaigns table - ensure only authenticated users can view active campaigns
DROP POLICY IF EXISTS "Anyone can view active campaigns" ON public.campaigns;

CREATE POLICY "Authenticated users can view active campaigns"
  ON public.campaigns FOR SELECT
  USING (
    auth.role() = 'authenticated' AND 
    (status = 'active' OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'))
  );