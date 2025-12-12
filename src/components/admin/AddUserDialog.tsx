import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { createUserSchema } from '@/lib/validation';

export function AddUserDialog() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'viewer' | 'member' | 'admin'>('viewer');
  const [password, setPassword] = useState('');

  const addUserMutation = useMutation({
    mutationFn: async () => {
      // Validate inputs
      const validation = createUserSchema.safeParse({
        email: email.trim(),
        fullName: fullName.trim(),
        password,
        role
      });

      if (!validation.success) {
        throw new Error(validation.error.errors[0].message);
      }

      // Call Edge Function to create user (server-side only)
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: validation.data.email,
          fullName: validation.data.fullName,
          password: validation.data.password,
          role: validation.data.role
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setOpen(false);
      setEmail('');
      setFullName('');
      setPassword('');
      setRole('viewer');
      toast.success('User added successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add user');
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new user account and assign a role
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter full name"
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@miet.ac.in"
            />
          </div>
          <div className="space-y-2">
            <Label>Temporary Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter temporary password"
            />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={(value: any) => setRole(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={() => addUserMutation.mutate()}
            disabled={!email || !fullName || !password || addUserMutation.isPending}
            className="w-full"
          >
            Add User
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
