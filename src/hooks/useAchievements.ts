import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Achievement {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  badge_url: string | null;
  category: string | null;
  earned_at: string | null;
  achievement_type: string | null;
  milestone_count: number;
}

export function useAchievements(userId?: string) {
  return useQuery({
    queryKey: ['achievements', userId],
    queryFn: async () => {
      let query = supabase
        .from('achievements')
        .select('*, profiles!inner(full_name, avatar_url)')
        .order('earned_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Achievement[];
    },
  });
}

export function useAwardAchievement() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (achievement: Omit<Achievement, 'id' | 'earned_at'>) => {
      const { data, error } = await supabase
        .from('achievements')
        .insert({
          ...achievement,
          earned_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Create notification
      await supabase.from('notifications').insert({
        user_id: achievement.user_id,
        title: 'New Achievement Unlocked! 🎉',
        message: `You've earned: ${achievement.title}`,
        type: 'achievement',
        related_id: data.id,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      toast.success('Achievement unlocked!');
    },
    onError: (error) => {
      console.error('Error awarding achievement:', error);
      toast.error('Failed to award achievement');
    },
  });
}

// Check and award milestone achievements
export async function checkAndAwardMilestones(
  userId: string,
  type: 'task_completion' | 'post_engagement' | 'event_attendance',
  count: number
) {
  const milestones = [
    { count: 1, title: 'Getting Started', description: 'Complete your first milestone' },
    { count: 5, title: 'Active Participant', description: 'Reached 5 milestones' },
    { count: 10, title: 'Committed Member', description: 'Reached 10 milestones' },
    { count: 25, title: 'Community Leader', description: 'Reached 25 milestones' },
    { count: 50, title: 'Legend', description: 'Reached 50 milestones' },
  ];

  for (const milestone of milestones) {
    if (count === milestone.count) {
      // Check if achievement already exists
      const { data: existing } = await supabase
        .from('achievements')
        .select('id')
        .eq('user_id', userId)
        .eq('achievement_type', type)
        .eq('milestone_count', milestone.count)
        .single();

      if (!existing) {
        await supabase.from('achievements').insert({
          user_id: userId,
          title: milestone.title,
          description: milestone.description,
          category: type,
          achievement_type: type,
          milestone_count: milestone.count,
          earned_at: new Date().toISOString(),
        });

        await supabase.from('notifications').insert({
          user_id: userId,
          title: 'New Achievement Unlocked! 🎉',
          message: `You've earned: ${milestone.title}`,
          type: 'achievement',
        });
      }
    }
  }
}
