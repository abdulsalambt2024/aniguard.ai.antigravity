import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AIUsage {
  id: string;
  user_id: string;
  feature_type: string;
  prompt: string | null;
  result_url: string | null;
  created_at: string;
}

export function useAIUsage() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['ai-usage', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('ai_usage')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AIUsage[];
    },
    enabled: !!user,
  });
}

export function useGenerateImage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ prompt }: { prompt: string }) => {
      const { data, error } = await supabase.functions.invoke('ai-studio', {
        body: {
          action: 'generate',
          prompt
        }
      });

      if (error) throw error;
      return data.imageUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-usage'] });
    },
  });
}

export function useEnhanceImage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ imageUrl, instruction }: { imageUrl: string; instruction: string }) => {
      const { data, error } = await supabase.functions.invoke('ai-studio', {
        body: {
          action: 'enhance',
          imageUrl,
          instruction
        }
      });

      if (error) throw error;
      return data.imageUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-usage'] });
    },
  });
}
