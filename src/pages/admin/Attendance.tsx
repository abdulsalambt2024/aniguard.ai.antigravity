import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Search, UserCheck, UserX, Clock, CalendarDays, Users, Check, X } from 'lucide-react';

interface AttendanceRecord {
  id: string;
  user_id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  marked_by: string;
  notes: string | null;
  created_at: string;
}

interface UserProfile {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  roll_number: string | null;
  course: string | null;
  branch: string | null;
}

export default function Attendance() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [markingDialogOpen, setMarkingDialogOpen] = useState(false);

  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  // Fetch all members
  const { data: members } = useQuery({
    queryKey: ['members-for-attendance'],
    queryFn: async () => {
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id')
        .in('role', ['member', 'admin', 'super_admin']);

      if (!roles?.length) return [];

      const userIds = roles.map(r => r.user_id);
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url, roll_number, course, branch')
        .in('user_id', userIds);

      if (error) throw error;
      return profiles as UserProfile[];
    },
  });

  // Fetch attendance for selected date
  const { data: attendance, isLoading } = useQuery({
    queryKey: ['attendance', dateStr],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('date', dateStr);

      if (error) throw error;
      return data as AttendanceRecord[];
    },
  });

  // Mark attendance mutation
  const markAttendance = useMutation({
    mutationFn: async ({ userId, status, notes }: { userId: string; status: string; notes?: string }) => {
      // Check if record exists
      const { data: existing } = await supabase
        .from('attendance')
        .select('id')
        .eq('user_id', userId)
        .eq('date', dateStr)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('attendance')
          .update({ status, notes, updated_at: new Date().toISOString() })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('attendance')
          .insert({
            user_id: userId,
            date: dateStr,
            status,
            notes,
            marked_by: user?.id,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', dateStr] });
      toast.success('Attendance marked');
    },
    onError: (error) => {
      toast.error('Failed to mark attendance');
      console.error(error);
    },
  });

  // Bulk mark all present
  const markAllPresent = async () => {
    if (!members) return;
    
    for (const member of members) {
      const existing = attendance?.find(a => a.user_id === member.user_id);
      if (!existing) {
        await markAttendance.mutateAsync({ userId: member.user_id, status: 'present' });
      }
    }
    toast.success('All members marked present');
  };

  const getAttendanceStatus = (userId: string) => {
    return attendance?.find(a => a.user_id === userId)?.status || null;
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-emerald-500"><Check className="h-3 w-3 mr-1" />Present</Badge>;
      case 'absent':
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Absent</Badge>;
      case 'late':
        return <Badge className="bg-amber-500"><Clock className="h-3 w-3 mr-1" />Late</Badge>;
      case 'excused':
        return <Badge variant="secondary">Excused</Badge>;
      default:
        return <Badge variant="outline">Not Marked</Badge>;
    }
  };

  const filteredMembers = members?.filter(member => {
    const matchesSearch = 
      member.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.roll_number?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    
    const status = getAttendanceStatus(member.user_id);
    if (statusFilter === 'not_marked') return matchesSearch && !status;
    return matchesSearch && status === statusFilter;
  });

  // Stats
  const stats = {
    total: members?.length || 0,
    present: attendance?.filter(a => a.status === 'present').length || 0,
    absent: attendance?.filter(a => a.status === 'absent').length || 0,
    late: attendance?.filter(a => a.status === 'late').length || 0,
  };

  return (
    <div className="container max-w-7xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Attendance Management</h1>
          <p className="text-muted-foreground">Mark and track member attendance</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Select Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Stats and Members */}
        <div className="md:col-span-2 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-6 w-6 mx-auto text-muted-foreground" />
                <div className="text-2xl font-bold mt-2">{stats.total}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <UserCheck className="h-6 w-6 mx-auto text-emerald-500" />
                <div className="text-2xl font-bold mt-2 text-emerald-500">{stats.present}</div>
                <div className="text-xs text-muted-foreground">Present</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <UserX className="h-6 w-6 mx-auto text-destructive" />
                <div className="text-2xl font-bold mt-2 text-destructive">{stats.absent}</div>
                <div className="text-xs text-muted-foreground">Absent</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="h-6 w-6 mx-auto text-amber-500" />
                <div className="text-2xl font-bold mt-2 text-amber-500">{stats.late}</div>
                <div className="text-xs text-muted-foreground">Late</div>
              </CardContent>
            </Card>
          </div>

          {/* Members List */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <CardTitle>
                  Attendance for {format(selectedDate, 'MMMM d, yyyy')}
                </CardTitle>
                <Button onClick={markAllPresent} size="sm">
                  <Check className="h-4 w-4 mr-2" />
                  Mark All Present
                </Button>
              </div>
              <div className="flex flex-col md:flex-row gap-4 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or roll number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Members</SelectItem>
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                    <SelectItem value="late">Late</SelectItem>
                    <SelectItem value="not_marked">Not Marked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : filteredMembers?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No members found</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Roll Number</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers?.map((member) => {
                      const status = getAttendanceStatus(member.user_id);
                      return (
                        <TableRow key={member.user_id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                {member.avatar_url ? (
                                  <img src={member.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                                ) : (
                                  <span className="text-sm font-medium">
                                    {member.full_name?.charAt(0) || '?'}
                                  </span>
                                )}
                              </div>
                              <div>
                                <div className="font-medium">{member.full_name || 'Unknown'}</div>
                                <div className="text-xs text-muted-foreground">
                                  {member.course} - {member.branch}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{member.roll_number || '-'}</TableCell>
                          <TableCell>{getStatusBadge(status)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant={status === 'present' ? 'default' : 'outline'}
                                className={status === 'present' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
                                onClick={() => markAttendance.mutate({ userId: member.user_id, status: 'present' })}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant={status === 'absent' ? 'destructive' : 'outline'}
                                onClick={() => markAttendance.mutate({ userId: member.user_id, status: 'absent' })}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant={status === 'late' ? 'default' : 'outline'}
                                className={status === 'late' ? 'bg-amber-500 hover:bg-amber-600' : ''}
                                onClick={() => markAttendance.mutate({ userId: member.user_id, status: 'late' })}
                              >
                                <Clock className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
