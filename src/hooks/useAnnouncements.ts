import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Announcement {
  id: string;
  created_by: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  attachments: string[] | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string;
  };
  announcement_reads?: { user_id: string }[];
}

export function useAnnouncements(priority?: 'low' | 'medium' | 'high') {
  return useQuery({
    queryKey: ['announcements', priority],
    queryFn: async () => {
      let query = supabase
        .from('announcements')
        .select(`
          *,
          announcement_reads (user_id)
        `)
        .order('created_at', { ascending: false });

      if (priority) {
        query = query.eq('priority', priority);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch profiles separately
      const creatorIds = [...new Set(data?.map(a => a.created_by))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', creatorIds);

      const announcementsWithProfiles = data?.map(announcement => ({
        ...announcement,
        profiles: profiles?.find(p => p.user_id === announcement.created_by) || null
      }));

      return announcementsWithProfiles as Announcement[];
    },
  });
}

export function useAnnouncement(id: string) {
  return useQuery({
    queryKey: ['announcement', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select(`
          *,
          announcement_reads (user_id)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      // Fetch profile separately
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .eq('user_id', data.created_by)
        .single();

      return {
        ...data,
        profiles: profile || null
      } as Announcement;
    },
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (announcement: { title: string; content: string; priority: 'low' | 'medium' | 'high' }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('announcements')
        .insert({
          created_by: user.id,
          ...announcement,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast({
        title: 'Success',
        description: 'Announcement created successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (announcementId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('announcement_reads')
        .upsert({
          announcement_id: announcementId,
          user_id: user.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
}
