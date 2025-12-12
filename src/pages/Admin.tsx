import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, BarChart3, Settings as SettingsIcon, Bug, CreditCard, CalendarCheck, Image, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TaskManagement } from '@/components/tasks/TaskManagement';

export default function Admin() {
  const { role } = useAuth();
  const navigate = useNavigate();

  const adminCards = [
    {
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      icon: Users,
      path: '/admin/users',
    },
    {
      title: 'Content Moderation',
      description: 'Review and moderate community content',
      icon: FileText,
      path: '/admin/moderation',
    },
    {
      title: 'Analytics',
      description: 'View engagement metrics and reports',
      icon: BarChart3,
      path: '/admin/analytics',
    },
    {
      title: 'Attendance',
      description: 'Mark and track member attendance',
      icon: CalendarCheck,
      path: '/admin/attendance',
    },
    {
      title: 'Slideshow Manager',
      description: 'Manage homepage slideshow images',
      icon: Image,
      path: '/admin/slideshow',
    },
    {
      title: 'Badge Management',
      description: 'Grant verification badges (Super Admin)',
      icon: Shield,
      path: '/admin/badges',
    },
    {
      title: 'Error Logs',
      description: 'Monitor and debug application errors',
      icon: Bug,
      path: '/admin/errors',
    },
    {
      title: 'Payment Transactions',
      description: 'View donation payments and verify transactions',
      icon: CreditCard,
      path: '/admin/payments',
    },
    {
      title: 'System Settings',
      description: 'Configure app settings and features',
      icon: SettingsIcon,
      path: '/admin/settings',
    },
  ];

  return (
    <div className="container max-w-7xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
        <p className="text-muted-foreground">
          Manage users, content, and system settings
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {adminCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.path}
              className="hover:border-primary transition-colors cursor-pointer"
              onClick={() => navigate(card.path)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{card.title}</CardTitle>
                    <CardDescription>{card.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {role === 'super_admin' && (
        <Card className="mt-6 border-amber-500/50 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="text-amber-600 dark:text-amber-400">
              Super Admin Access
            </CardTitle>
            <CardDescription>
              You have full system access including user role management and system configuration.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="mt-8">
        <TaskManagement />
      </div>
    </div>
  );
}
