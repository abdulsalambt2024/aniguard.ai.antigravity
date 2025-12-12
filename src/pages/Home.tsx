import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Slideshow } from '@/components/home/Slideshow';
import { CombinedFeed } from '@/components/feed/CombinedFeed';
import { Card, CardContent } from '@/components/ui/card';
import { Users, MessageCircle, Calendar, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { CreatePostDialog } from '@/components/posts/CreatePostDialog';
import { CreateEventDialog } from '@/components/events/CreateEventDialog';

export default function Home() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const canCreate = role !== 'viewer';
  const isAdmin = role === 'admin' || role === 'super_admin';

  const { data: stats } = useQuery({
    queryKey: ['home-stats'],
    queryFn: async () => {
      const [membersRes, eventsRes, postsRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('events').select('id', { count: 'exact', head: true }).gte('event_date', new Date().toISOString()),
        supabase.from('posts').select('id', { count: 'exact', head: true })
      ]);
      return {
        members: membersRes.count || 0,
        upcomingEvents: eventsRes.count || 0,
        posts: postsRes.count || 0
      };
    }
  });

  const { data: profile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase.from('profiles').select('full_name').eq('user_id', user.id).single();
      return data;
    },
    enabled: !!user?.id
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto p-4 space-y-6">
        {/* Welcome Section */}
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}!
          </h1>
          <p className="text-muted-foreground text-sm">Here's what's happening with your team today.</p>
        </div>

        {/* Slideshow */}
        <Slideshow />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.members || 0}</p>
                <p className="text-xs text-muted-foreground">Team Members</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/20">
                <MessageCircle className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.posts || 0}</p>
                <p className="text-xs text-muted-foreground">Total Posts</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/20">
                <Calendar className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.upcomingEvents || 0}</p>
                <p className="text-xs text-muted-foreground">Upcoming Events</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <Award className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">85%</p>
                <p className="text-xs text-muted-foreground">Attendance Rate</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        {canCreate && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <CreatePostDialog />
                {isAdmin && <CreateEventDialog />}
                <Button 
                  variant="outline" 
                  className="h-auto flex-col gap-2 py-4" 
                  onClick={() => navigate('/chat')}
                >
                  <Users className="h-5 w-5 text-accent" />
                  <span className="text-xs">Start Chat</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto flex-col gap-2 py-4" 
                  onClick={() => navigate('/ai-studio')}
                >
                  <Award className="h-5 w-5 text-purple-500" />
                  <span className="text-xs">AI Assistant</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Community Feed */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Posts</h2>
            {canCreate && <CreatePostDialog />}
          </div>
          <CombinedFeed />
        </div>
      </div>
    </div>
  );
}
