import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Award, Users, FileText, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminTasks() {
  const navigate = useNavigate();

  const taskCategories = [
    {
      icon: Award,
      title: 'Badge Generation',
      description: 'Create and award badges to members',
      color: 'text-yellow-500',
      path: '/admin/badges'
    },
    {
      icon: Users,
      title: 'User Management',
      description: 'Manage users and permissions',
      color: 'text-blue-500',
      path: '/admin/users'
    },
    {
      icon: FileText,
      title: 'Content Moderation',
      description: 'Review and moderate content',
      color: 'text-green-500',
      path: '/admin/moderation'
    },
    {
      icon: ImageIcon,
      title: 'Media Management',
      description: 'Organize and manage media files',
      color: 'text-purple-500',
      path: '/admin/media'
    }
  ];

  return (
    <div className="container max-w-7xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Admin Task Panel</h1>
        <p className="text-muted-foreground">
          Manage administrative tasks and generate badges
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {taskCategories.map((category) => (
          <Card
            key={category.title}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(category.path)}
          >
            <CardHeader>
              <category.icon className={`h-12 w-12 ${category.color} mb-2`} />
              <CardTitle>{category.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {category.description}
              </p>
              <Button className="w-full">Access</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Quick Badge Generator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Quickly award badges for common achievements
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['First Post', 'Event Participant', 'Top Contributor', 'Helpful Member'].map((badge) => (
              <Button key={badge} variant="outline" className="flex flex-col h-24 gap-2">
                <Award className="h-6 w-6" />
                <span className="text-xs">{badge}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
