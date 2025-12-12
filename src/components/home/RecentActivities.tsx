import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Award, FileText, Megaphone } from 'lucide-react';

interface Activity {
  id: string;
  type: 'post' | 'event' | 'achievement' | 'announcement';
  title: string;
  description?: string;
  created_at: string;
  user?: {
    full_name: string;
    avatar_url: string | null;
  };
}

export function RecentActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentActivities();
  }, []);

  const fetchRecentActivities = async () => {
    try {
      // Fetch recent posts
      const { data: posts } = await supabase
        .from('posts')
        .select('id, title, content, created_at, user_id, profiles!inner(full_name, avatar_url)')
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch recent events
      const { data: events } = await supabase
        .from('events')
        .select('id, title, description, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      // Fetch recent achievements
      const { data: achievements } = await supabase
        .from('achievements')
        .select('id, title, description, created_at, user_id, profiles!inner(full_name, avatar_url)')
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch recent announcements
      const { data: announcements } = await supabase
        .from('announcements')
        .select('id, title, content, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      const allActivities: Activity[] = [
        ...(posts?.map((p: any) => ({
          id: p.id,
          type: 'post' as const,
          title: p.title,
          description: p.content.substring(0, 100),
          created_at: p.created_at,
          user: p.profiles,
        })) || []),
        ...(events?.map((e) => ({
          id: e.id,
          type: 'event' as const,
          title: e.title,
          description: e.description.substring(0, 100),
          created_at: e.created_at,
        })) || []),
        ...(achievements?.map((a: any) => ({
          id: a.id,
          type: 'achievement' as const,
          title: a.title,
          description: a.description,
          created_at: a.created_at,
          user: a.profiles,
        })) || []),
        ...(announcements?.map((a) => ({
          id: a.id,
          type: 'announcement' as const,
          title: a.title,
          description: a.content.substring(0, 100),
          created_at: a.created_at,
        })) || []),
      ];

      allActivities.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setActivities(allActivities.slice(0, 10));
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: Activity['type']) => {
    switch (type) {
      case 'post':
        return <FileText className="h-5 w-5" />;
      case 'event':
        return <Calendar className="h-5 w-5" />;
      case 'achievement':
        return <Award className="h-5 w-5" />;
      case 'announcement':
        return <Megaphone className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: Activity['type']) => {
    switch (type) {
      case 'post':
        return 'bg-blue-500';
      case 'event':
        return 'bg-green-500';
      case 'achievement':
        return 'bg-yellow-500';
      case 'announcement':
        return 'bg-red-500';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Loading activities...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No recent activity to display
          </p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={`${activity.type}-${activity.id}`}
                className="flex items-start gap-4 p-3 rounded-lg hover:bg-accent transition-colors"
              >
                <div className={`p-2 rounded-full ${getTypeColor(activity.type)} text-white`}>
                  {getIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium truncate">{activity.title}</h4>
                    <Badge variant="outline" className="capitalize text-xs">
                      {activity.type}
                    </Badge>
                  </div>
                  {activity.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {activity.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    {activity.user && (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={activity.user.avatar_url || ''} />
                          <AvatarFallback className="text-xs">
                            {activity.user.full_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          {activity.user.full_name}
                        </span>
                      </div>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
