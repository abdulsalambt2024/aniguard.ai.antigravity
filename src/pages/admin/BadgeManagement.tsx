import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Search, Shield, Star, Trash2, Award, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface UserWithBadge {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  role?: string;
  badge?: {
    id: string;
    badge_type: string;
    badge_color: string;
    granted_at: string;
  };
}

export default function BadgeManagement() {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBadgeColor, setSelectedBadgeColor] = useState('blue');
  const [filterBadge, setFilterBadge] = useState('all');

  const isSuperAdmin = role === 'super_admin';

  const { data: users, isLoading } = useQuery({
    queryKey: ['users-with-badges'],
    queryFn: async () => {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url');

      const { data: badges } = await supabase
        .from('verification_badges')
        .select('*');

      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role');

      const badgeMap = new Map(badges?.map(b => [b.user_id, b]));
      const roleMap = new Map(roles?.map(r => [r.user_id, r.role]));

      return profiles?.map(p => ({
        ...p,
        role: roleMap.get(p.user_id) || 'viewer',
        badge: badgeMap.get(p.user_id)
      })) || [];
    },
    enabled: isSuperAdmin
  });

  const grantBadge = useMutation({
    mutationFn: async ({ userId, badgeColor }: { userId: string; badgeColor: string }) => {
      const { error } = await supabase
        .from('verification_badges')
        .upsert({
          user_id: userId,
          badge_type: 'verified',
          badge_color: badgeColor,
          granted_by: user?.id
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-badges'] });
      queryClient.invalidateQueries({ queryKey: ['verification-badge'] });
      toast({ title: 'Badge Granted', description: 'Verification badge has been assigned.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to grant badge', variant: 'destructive' });
    }
  });

  const revokeBadge = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('verification_badges')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-badges'] });
      queryClient.invalidateQueries({ queryKey: ['verification-badge'] });
      toast({ title: 'Badge Revoked', description: 'Verification badge has been removed.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to revoke badge', variant: 'destructive' });
    }
  });

  const filteredUsers = users?.filter(u => {
    const matchesSearch = u.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBadge = filterBadge === 'all' || 
      (filterBadge === 'verified' && u.badge) || 
      (filterBadge === 'unverified' && !u.badge);
    return matchesSearch && matchesBadge;
  });

  const getBadgeColorIcon = (color?: string) => {
    switch (color) {
      case 'gold': return <Star className="h-4 w-4 text-yellow-500" />;
      case 'green': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <CheckCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getRoleLabel = (r?: string) => {
    switch (r) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'Admin';
      case 'member': return 'Member';
      default: return 'Viewer';
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="container max-w-4xl mx-auto p-4">
        <Card>
          <CardContent className="py-12 text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Only Super Admins can manage verification badges.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Badge Management</h1>
        <p className="text-sm text-muted-foreground">Grant or revoke verification badges for users</p>
      </div>

      {/* Badge Color Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Select Badge Color to Grant</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={selectedBadgeColor} 
            onValueChange={setSelectedBadgeColor}
            className="flex flex-wrap gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="blue" id="blue" />
              <Label htmlFor="blue" className="flex items-center gap-2 cursor-pointer">
                <CheckCircle className="h-5 w-5 text-blue-500" />
                Blue (Verified)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="green" id="green" />
              <Label htmlFor="green" className="flex items-center gap-2 cursor-pointer">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Green (Member)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="gold" id="gold" />
              <Label htmlFor="gold" className="flex items-center gap-2 cursor-pointer">
                <Star className="h-5 w-5 text-yellow-500" />
                Gold (Special)
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterBadge} onValueChange={setFilterBadge}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Not Verified</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12 text-center text-muted-foreground">Loading users...</div>
          ) : (
            <div className="divide-y">
              {filteredUsers?.map((u) => (
                <div
                  key={u.user_id}
                  className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={u.avatar_url || undefined} />
                      <AvatarFallback>{u.full_name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">{u.full_name}</p>
                        {u.badge && <VerifiedBadge userId={u.user_id} size="sm" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{getRoleLabel(u.role)}</Badge>
                        {u.badge && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            {getBadgeColorIcon(u.badge.badge_color)}
                            {u.badge.badge_color || 'blue'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {u.badge ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => revokeBadge.mutate(u.user_id)}
                        disabled={revokeBadge.isPending}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        <span className="hidden md:inline">Revoke</span>
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => grantBadge.mutate({ userId: u.user_id, badgeColor: selectedBadgeColor })}
                        disabled={grantBadge.isPending}
                      >
                        <Award className="h-4 w-4 mr-1" />
                        <span className="hidden md:inline">Grant Badge</span>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {filteredUsers?.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">
                  <User className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  No users found
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
