import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Calendar, CheckSquare, Heart, Star, TrendingUp } from 'lucide-react';

export default function PerformanceDashboard() {
  const { user, role } = useAuth();
  const isAdmin = role === 'admin' || role === 'super_admin';

  const { data: stats, isLoading } = useQuery({
    queryKey: ['member-statistics', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Fetch or calculate statistics
      const [
        { count: attendancePresent },
        { count: attendanceTotal },
        { count: tasksCompleted },
        { count: tasksTotal },
        { count: eventsParticipated },
        { count: postsCreated },
        { count: achievementsCount }
      ] = await Promise.all([
        supabase.from('attendance').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'present'),
        supabase.from('attendance').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('assigned_to', user.id).eq('status', 'completed'),
        supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('assigned_to', user.id),
        supabase.from('event_rsvps').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'attending'),
        supabase.from('posts').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('achievements').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      ]);

      const attendancePercentage = attendanceTotal ? Math.round((attendancePresent || 0) / attendanceTotal * 100) : 0;
      const taskCompletionRate = tasksTotal ? Math.round((tasksCompleted || 0) / tasksTotal * 100) : 0;
      
      // Calculate contribution score
      const contributionScore = 
        (attendancePresent || 0) * 10 + 
        (tasksCompleted || 0) * 20 + 
        (eventsParticipated || 0) * 15 + 
        (postsCreated || 0) * 5 +
        (achievementsCount || 0) * 25;

      return {
        attendancePercentage,
        attendancePresent: attendancePresent || 0,
        attendanceTotal: attendanceTotal || 0,
        tasksCompleted: tasksCompleted || 0,
        tasksTotal: tasksTotal || 0,
        taskCompletionRate,
        eventsParticipated: eventsParticipated || 0,
        postsCreated: postsCreated || 0,
        achievementsCount: achievementsCount || 0,
        contributionScore
      };
    },
    enabled: !!user
  });

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto p-4 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Attendance',
      value: `${stats?.attendancePercentage || 0}%`,
      subtitle: `${stats?.attendancePresent}/${stats?.attendanceTotal} sessions`,
      icon: Calendar,
      color: 'text-blue-500',
      progress: stats?.attendancePercentage || 0
    },
    {
      title: 'Tasks Completed',
      value: stats?.tasksCompleted || 0,
      subtitle: `${stats?.taskCompletionRate || 0}% completion rate`,
      icon: CheckSquare,
      color: 'text-green-500',
      progress: stats?.taskCompletionRate || 0
    },
    {
      title: 'Events Participated',
      value: stats?.eventsParticipated || 0,
      subtitle: 'Events attended',
      icon: Heart,
      color: 'text-pink-500'
    },
    {
      title: 'Posts Created',
      value: stats?.postsCreated || 0,
      subtitle: 'Community contributions',
      icon: Star,
      color: 'text-yellow-500'
    },
    {
      title: 'Achievements',
      value: stats?.achievementsCount || 0,
      subtitle: 'Badges earned',
      icon: Trophy,
      color: 'text-purple-500'
    },
    {
      title: 'Contribution Score',
      value: stats?.contributionScore || 0,
      subtitle: 'Overall performance',
      icon: TrendingUp,
      color: 'text-emerald-500'
    }
  ];

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Performance Dashboard</h1>
        <p className="text-muted-foreground">Track your contributions and progress</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                {stat.progress !== undefined && (
                  <Progress value={stat.progress} className="mt-2 h-2" />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Attendance Rate</span>
              <div className="flex items-center gap-2">
                <Progress value={stats?.attendancePercentage || 0} className="w-32 h-2" />
                <span className="text-sm font-medium w-12 text-right">{stats?.attendancePercentage || 0}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Task Completion</span>
              <div className="flex items-center gap-2">
                <Progress value={stats?.taskCompletionRate || 0} className="w-32 h-2" />
                <span className="text-sm font-medium w-12 text-right">{stats?.taskCompletionRate || 0}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Community Engagement</span>
              <div className="flex items-center gap-2">
                <Progress value={Math.min(100, (stats?.postsCreated || 0) * 10)} className="w-32 h-2" />
                <span className="text-sm font-medium w-12 text-right">{stats?.postsCreated || 0} posts</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
