import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export interface ChatRoom {
  id: string;
  name: string | null;
  is_group: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_message?: {
    content: string;
    created_at: string;
  };
  unread_count?: number;
}

export interface Message {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  media_url: string | null;
  message_type: 'text' | 'image' | 'document' | 'voice';
  created_at: string;
  updated_at: string;
  user?: {
    full_name: string;
    avatar_url: string | null;
  };
}

export const useChat = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch chat rooms
  const { data: rooms, isLoading: roomsLoading } = useQuery({
    queryKey: ['chat-rooms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select(`
          *,
          chat_participants!inner(user_id)
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as ChatRoom[];
    },
    enabled: !!user,
  });

  // Real-time subscription for new rooms
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('chat-rooms-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_rooms'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['chat-rooms'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  // Create a new chat room
  const createRoom = useMutation({
    mutationFn: async ({ name, participantIds, isGroup }: { name?: string; participantIds: string[]; isGroup?: boolean }) => {
      // Create the room
      const { data: room, error: roomError } = await supabase
        .from('chat_rooms')
        .insert({
          name: name || null,
          is_group: isGroup || false,
          created_by: user?.id,
        })
        .select()
        .single();

      if (roomError) throw roomError;

      // Add creator as participant
      const participants = [
        { room_id: room.id, user_id: user?.id },
        ...participantIds.map(id => ({ room_id: room.id, user_id: id }))
      ];

      const { error: participantsError } = await supabase
        .from('chat_participants')
        .insert(participants);

      if (participantsError) throw participantsError;

      return room;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-rooms'] });
    },
  });

  return {
    rooms,
    roomsLoading,
    createRoom,
  };
};

export const useChatRoom = (roomId: string | null) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch messages for a room
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', roomId],
    queryFn: async () => {
      if (!roomId) return [];

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch user profiles for messages
      const userIds = [...new Set(data.map(m => m.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);

      return data.map(msg => ({
        ...msg,
        user: profiles?.find(p => p.user_id === msg.user_id),
      })) as Message[];
    },
    enabled: !!roomId && !!user,
  });

  // Real-time subscription for new messages
  useEffect(() => {
    if (!roomId || !user) return;

    const channel = supabase
      .channel(`messages-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['messages', roomId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, user, queryClient]);

  // Send a message
  const sendMessage = useMutation({
    mutationFn: async ({ content, messageType = 'text', mediaUrl }: { content: string; messageType?: 'text' | 'image' | 'document' | 'voice'; mediaUrl?: string }) => {
      if (!roomId) throw new Error('No room selected');

      const { data, error } = await supabase
        .from('messages')
        .insert({
          room_id: roomId,
          user_id: user?.id,
          content,
          message_type: messageType,
          media_url: mediaUrl || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Update room's updated_at
      await supabase
        .from('chat_rooms')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', roomId);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', roomId] });
      queryClient.invalidateQueries({ queryKey: ['chat-rooms'] });
    },
  });

  return {
    messages,
    messagesLoading,
    sendMessage,
  };
};
