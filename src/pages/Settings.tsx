import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Moon, Sun, Monitor, Bell, Lock } from 'lucide-react';
import { TwoFactorAuth } from '@/components/settings/TwoFactorAuth';
import { useState } from 'react';
import { toast } from 'sonner';

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { user, role } = useAuth();
  const [notifications, setNotifications] = useState({
    posts: true,
    events: true,
    tasks: true,
    achievements: true,
  });
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showEmail: false,
    showActivity: true,
  });

  const isSuperAdmin = role === 'super_admin' && (
    user?.email === 'abdul.salam.bt.2024@miet.ac.in' ||
    user?.email === 'hayatamr9608@gmail.com'
  );

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    toast.success('Notification settings updated');
  };

  const handlePrivacyChange = (key: string, value: boolean) => {
    setPrivacy(prev => ({ ...prev, [key]: value }));
    toast.success('Privacy settings updated');
  };

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize how Parivartan looks on your device</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Theme</Label>
            <div className="grid grid-cols-3 gap-4">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                onClick={() => setTheme('light')}
                className="flex flex-col gap-2 h-20"
              >
                <Sun className="h-5 w-5" />
                <span>Light</span>
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                onClick={() => setTheme('dark')}
                className="flex flex-col gap-2 h-20"
              >
                <Moon className="h-5 w-5" />
                <span>Dark</span>
              </Button>
              <Button
                variant={theme === 'system' ? 'default' : 'outline'}
                onClick={() => setTheme('system')}
                className="flex flex-col gap-2 h-20"
              >
                <Monitor className="h-5 w-5" />
                <span>System</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {isSuperAdmin && <TwoFactorAuth />}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>Manage your notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Post Notifications</Label>
            <Switch
              checked={notifications.posts}
              onCheckedChange={(checked) => handleNotificationChange('posts', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Event Notifications</Label>
            <Switch
              checked={notifications.events}
              onCheckedChange={(checked) => handleNotificationChange('events', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Task Notifications</Label>
            <Switch
              checked={notifications.tasks}
              onCheckedChange={(checked) => handleNotificationChange('tasks', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Achievement Notifications</Label>
            <Switch
              checked={notifications.achievements}
              onCheckedChange={(checked) => handleNotificationChange('achievements', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Privacy
          </CardTitle>
          <CardDescription>Control your privacy settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Profile Visibility</Label>
              <p className="text-sm text-muted-foreground">Allow others to view your profile</p>
            </div>
            <Switch
              checked={privacy.profileVisible}
              onCheckedChange={(checked) => handlePrivacyChange('profileVisible', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Show Email</Label>
              <p className="text-sm text-muted-foreground">Display email in your profile</p>
            </div>
            <Switch
              checked={privacy.showEmail}
              onCheckedChange={(checked) => handlePrivacyChange('showEmail', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Show Activity</Label>
              <p className="text-sm text-muted-foreground">Display your recent activity</p>
            </div>
            <Switch
              checked={privacy.showActivity}
              onCheckedChange={(checked) => handlePrivacyChange('showActivity', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
