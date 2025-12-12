-- Fix 1: Create SECURITY DEFINER function to check room participation
CREATE OR REPLACE FUNCTION public.is_room_participant(_user_id uuid, _room_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.chat_participants
    WHERE user_id = _user_id AND room_id = _room_id
  )
$$;

-- Fix 2: Drop the problematic chat_participants policies
DROP POLICY IF EXISTS "Users can view participants in their rooms" ON public.chat_participants;
DROP POLICY IF EXISTS "Room creators can add participants" ON public.chat_participants;

-- Fix 3: Create new non-recursive policies using the function
CREATE POLICY "Users can view participants in their rooms"
ON public.chat_participants
FOR SELECT
USING (public.is_room_participant(auth.uid(), room_id));

CREATE POLICY "Room creators can add participants"
ON public.chat_participants
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.chat_rooms
    WHERE id = room_id AND created_by = auth.uid()
  )
  OR auth.uid() = user_id
);

-- Fix 4: Remove dangerous payment_transactions policies
DROP POLICY IF EXISTS "System can insert transactions" ON public.payment_transactions;
DROP POLICY IF EXISTS "System can update transactions" ON public.payment_transactions;

-- Fix 5: Create proper policies for edge functions (service role bypasses RLS anyway)
-- Only allow authenticated users to view their own transactions
CREATE POLICY "Authenticated users can create their own transactions"
ON public.payment_transactions
FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Fix 6: Add badge_color column to verification_badges if not exists
ALTER TABLE public.verification_badges 
ADD COLUMN IF NOT EXISTS badge_color text DEFAULT 'blue';

-- Fix 7: Update chat_rooms policy for non-viewers
DROP POLICY IF EXISTS "Users can view rooms they're part of" ON public.chat_rooms;
CREATE POLICY "Non-viewers can view rooms they are part of"
ON public.chat_rooms
FOR SELECT
USING (
  public.is_room_participant(auth.uid(), id)
  AND (
    public.has_role(auth.uid(), 'member') 
    OR public.has_role(auth.uid(), 'admin') 
    OR public.has_role(auth.uid(), 'super_admin')
  )
);