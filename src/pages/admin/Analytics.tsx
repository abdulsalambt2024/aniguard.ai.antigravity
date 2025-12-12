import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Calendar, TrendingUp } from 'lucide-react';

export default function Analytics() {
  const { data: stats } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const [
        { count: usersCount },
        { count: postsCount },
        { count: eventsCount },
        { count: announcementsCount }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('posts').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('announcements').select('*', { count: 'exact', head: true })
      ]);

      return {
        users: usersCount || 0,
        posts: postsCount || 0,
        events: eventsCount || 0,
        announcements: announcementsCount || 0,
      };
    },
  });

  const statsCards = [
    {
      title: 'Total Users',
      value: stats?.users || 0,
      icon: Users,
      description: 'Registered community members',
    },
    {
      title: 'Total Posts',
      value: stats?.posts || 0,
      icon: FileText,
      description: 'Published content',
    },
    {
      title: 'Total Events',
      value: stats?.events || 0,
      icon: Calendar,
      description: 'Scheduled events',
    },
    {
      title: 'Announcements',
      value: stats?.announcements || 0,
      icon: TrendingUp,
      description: 'Community announcements',
    },
  ];

  return (
    <div className="container max-w-7xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          View engagement metrics and reports
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Engagement Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Detailed analytics and charts coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
