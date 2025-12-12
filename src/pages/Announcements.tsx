import { useState } from 'react';
import { useAnnouncements, useCreateAnnouncement, useMarkAsRead } from '@/hooks/useAnnouncements';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, AlertCircle, Info, Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Announcements() {
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
  });

  const { data: announcements, isLoading } = useAnnouncements(priority);
  const createAnnouncement = useCreateAnnouncement();
  const markAsRead = useMarkAsRead();
  const { user, role } = useAuth();

  const canCreateAnnouncements = role && ['admin', 'super_admin'].includes(role);

  const getPriorityIcon = (p: string) => {
    switch (p) {
      case 'high':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      case 'medium':
        return <Bell className="h-5 w-5 text-amber-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getPriorityVariant = (p: string): "default" | "destructive" | "secondary" => {
    switch (p) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    await createAnnouncement.mutateAsync(formData);
    
    setFormData({ title: '', content: '', priority: 'medium' });
    setDialogOpen(false);
  };

  const handleCardClick = (id: string, isRead: boolean) => {
    if (!isRead) {
      markAsRead.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto p-4">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Announcements</h1>
          <p className="text-muted-foreground">
            Stay updated with important community news
          </p>
        </div>
        {canCreateAnnouncements && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Create Announcement</DialogTitle>
                  <DialogDescription>
                    Share important updates with the community
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Announcement title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      placeholder="Announcement details"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="min-h-[150px]"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value: 'low' | 'medium' | 'high') => 
                        setFormData({ ...formData, priority: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createAnnouncement.isPending}>
                    {createAnnouncement.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs defaultValue="all" className="space-y-6" onValueChange={(value) => {
        setPriority(value === 'all' ? undefined : value as any);
      }}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="high">High Priority</TabsTrigger>
          <TabsTrigger value="medium">Medium</TabsTrigger>
          <TabsTrigger value="low">Low</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {announcements && announcements.length > 0 ? (
            announcements.map((announcement) => {
              const isRead = announcement.announcement_reads?.some((r) => r.user_id === user?.id);
              return (
                <Card
                  key={announcement.id}
                  className={`cursor-pointer transition-colors hover:border-primary ${
                    !isRead ? 'border-l-4 border-l-primary' : ''
                  }`}
                  onClick={() => handleCardClick(announcement.id, isRead || false)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        {getPriorityIcon(announcement.priority)}
                        <div className="flex-1">
                          <CardTitle className="text-xl">{announcement.title}</CardTitle>
                          <CardDescription className="mt-1">
                            By {announcement.profiles?.full_name || 'Unknown'} •{' '}
                            {formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant={getPriorityVariant(announcement.priority)}>
                        {announcement.priority}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {announcement.content}
                    </p>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No announcements found.</p>
            </Card>
          )}
        </TabsContent>

        {['high', 'medium', 'low'].map(p => (
          <TabsContent key={p} value={p} className="space-y-4">
            {/* Content will be shown based on priority filter */}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
