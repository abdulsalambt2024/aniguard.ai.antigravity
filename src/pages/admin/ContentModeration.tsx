import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { 
  CheckCircle, XCircle, Eye, Search, Filter, MessageCircle, Calendar, 
  Megaphone, Trophy, AlertTriangle, Trash2, Shield, RefreshCw 
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { VerifiedBadge } from '@/components/VerifiedBadge';

interface ContentItem {
  id: string;
  type: 'post' | 'event' | 'announcement' | 'achievement';
  title: string;
  content: string;
  created_at: string;
  user_id: string;
  user_name?: string;
  avatar_url?: string;
  status?: string;
  media_urls?: string[];
}

export default function ContentModeration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);

  const { data: posts, isLoading: postsLoading, refetch: refetchPosts } = useQuery({
    queryKey: ['admin-posts-moderation'],
    queryFn: async () => {
      const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const userIds = [...new Set(posts.map(p => p.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]));

      return posts.map(p => ({
        ...p,
        type: 'post' as const,
        user_name: profileMap.get(p.user_id)?.full_name || 'Unknown',
        avatar_url: profileMap.get(p.user_id)?.avatar_url,
        status: 'active'
      }));
    },
  });

  const { data: events, isLoading: eventsLoading, refetch: refetchEvents } = useQuery({
    queryKey: ['admin-events-moderation'],
    queryFn: async () => {
      const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const userIds = [...new Set(events.map(e => e.created_by))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]));

      return events.map(e => ({
        id: e.id,
        type: 'event' as const,
        title: e.title,
        content: e.description,
        created_at: e.created_at,
        user_id: e.created_by,
        user_name: profileMap.get(e.created_by)?.full_name || 'Unknown',
        avatar_url: profileMap.get(e.created_by)?.avatar_url,
        status: 'scheduled'
      }));
    },
  });

  const { data: announcements, isLoading: announcementsLoading, refetch: refetchAnnouncements } = useQuery({
    queryKey: ['admin-announcements-moderation'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const userIds = [...new Set(data.map(a => a.created_by))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]));

      return data.map(a => ({
        id: a.id,
        type: 'announcement' as const,
        title: a.title,
        content: a.content,
        created_at: a.created_at,
        user_id: a.created_by,
        user_name: profileMap.get(a.created_by)?.full_name || 'Admin',
        avatar_url: profileMap.get(a.created_by)?.avatar_url,
        status: a.priority
      }));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ type, id }: { type: string; id: string }) => {
      let error;
      switch (type) {
        case 'post':
          ({ error } = await supabase.from('posts').delete().eq('id', id));
          break;
        case 'event':
          ({ error } = await supabase.from('events').delete().eq('id', id));
          break;
        case 'announcement':
          ({ error } = await supabase.from('announcements').delete().eq('id', id));
          break;
      }
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Content removed', description: 'The content has been deleted successfully.' });
      refetchPosts();
      refetchEvents();
      refetchAnnouncements();
      setSelectedItem(null);
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete content.', variant: 'destructive' });
    }
  });

  const filterItems = (items: ContentItem[] | undefined) => {
    if (!items) return [];
    return items.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'post': return <MessageCircle className="h-4 w-4" />;
      case 'event': return <Calendar className="h-4 w-4" />;
      case 'announcement': return <Megaphone className="h-4 w-4" />;
      case 'achievement': return <Trophy className="h-4 w-4" />;
      default: return null;
    }
  };

  const ContentCard = ({ item }: { item: ContentItem }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={item.avatar_url || undefined} />
            <AvatarFallback>{item.user_name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm truncate">{item.user_name}</span>
              <VerifiedBadge userId={item.user_id} size="sm" />
              <Badge variant="outline" className="gap-1 text-xs">
                {getTypeIcon(item.type)}
                {item.type}
              </Badge>
            </div>
            <h4 className="font-semibold text-sm mb-1 truncate">{item.title}</h4>
            <p className="text-xs text-muted-foreground line-clamp-2">{item.content}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
            </p>
          </div>
          <div className="flex flex-col gap-1 flex-shrink-0">
            <Button variant="outline" size="sm" onClick={() => setSelectedItem(item)}>
              <Eye className="h-3.5 w-3.5" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-destructive hover:text-destructive"
              onClick={() => deleteMutation.mutate({ type: item.type, id: item.id })}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const stats = {
    posts: posts?.length || 0,
    events: events?.length || 0,
    announcements: announcements?.length || 0
  };

  return (
    <div className="container max-w-7xl mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1">Content Moderation</h1>
          <p className="text-sm text-muted-foreground">Review and moderate community content</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            refetchPosts();
            refetchEvents();
            refetchAnnouncements();
          }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
              <MessageCircle className="h-4 w-4 text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <p className="text-lg font-bold">{stats.posts}</p>
              <p className="text-xs text-muted-foreground">Posts</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
              <Calendar className="h-4 w-4 text-green-600 dark:text-green-300" />
            </div>
            <div>
              <p className="text-lg font-bold">{stats.events}</p>
              <p className="text-xs text-muted-foreground">Events</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
              <Megaphone className="h-4 w-4 text-purple-600 dark:text-purple-300" />
            </div>
            <div>
              <p className="text-lg font-bold">{stats.announcements}</p>
              <p className="text-xs text-muted-foreground">Announcements</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="posts" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full md:w-auto">
          <TabsTrigger value="posts" className="gap-1">
            <MessageCircle className="h-4 w-4" />
            <span className="hidden md:inline">Posts</span>
          </TabsTrigger>
          <TabsTrigger value="events" className="gap-1">
            <Calendar className="h-4 w-4" />
            <span className="hidden md:inline">Events</span>
          </TabsTrigger>
          <TabsTrigger value="announcements" className="gap-1">
            <Megaphone className="h-4 w-4" />
            <span className="hidden md:inline">Announcements</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-3">
          {postsLoading ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">Loading...</CardContent></Card>
          ) : filterItems(posts)?.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No posts found</CardContent></Card>
          ) : (
            <div className="grid gap-3">
              {filterItems(posts)?.map((post) => <ContentCard key={post.id} item={post} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="events" className="space-y-3">
          {eventsLoading ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">Loading...</CardContent></Card>
          ) : filterItems(events)?.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No events found</CardContent></Card>
          ) : (
            <div className="grid gap-3">
              {filterItems(events)?.map((event) => <ContentCard key={event.id} item={event} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="announcements" className="space-y-3">
          {announcementsLoading ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">Loading...</CardContent></Card>
          ) : filterItems(announcements)?.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No announcements found</CardContent></Card>
          ) : (
            <div className="grid gap-3">
              {filterItems(announcements)?.map((item) => <ContentCard key={item.id} item={item} />)}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Content Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Content Details</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={selectedItem.avatar_url || undefined} />
                  <AvatarFallback>{selectedItem.user_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{selectedItem.user_name}</span>
                    <VerifiedBadge userId={selectedItem.user_id} size="sm" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(selectedItem.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg">{selectedItem.title}</h3>
                <p className="text-muted-foreground mt-2 whitespace-pre-wrap">{selectedItem.content}</p>
              </div>
              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  variant="destructive" 
                  className="flex-1"
                  onClick={() => deleteMutation.mutate({ type: selectedItem.type, id: selectedItem.id })}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove Content
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
