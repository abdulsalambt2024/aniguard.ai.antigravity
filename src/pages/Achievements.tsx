import { useAchievements } from '@/hooks/useAchievements';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Award, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Achievements() {
  const { user } = useAuth();
  const { data: achievements, isLoading } = useAchievements(user?.id);

  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto p-4">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto p-4 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Achievements</h1>
        <p className="text-muted-foreground">
          Celebrate your milestones and accomplishments
        </p>
      </div>

      {achievements && achievements.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {achievements.map((achievement: any) => (
            <Card key={achievement.id} className="overflow-hidden">
              <CardHeader className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="p-3 rounded-full bg-yellow-500/10">
                    <Award className="h-8 w-8 text-yellow-500" />
                  </div>
                  {achievement.category && (
                    <Badge variant="secondary" className="capitalize">
                      {achievement.category.replace('_', ' ')}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-xl">{achievement.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {achievement.description && (
                  <p className="text-sm text-muted-foreground">
                    {achievement.description}
                  </p>
                )}
                
                {achievement.badge_url && (
                  <div className="flex justify-center">
                    <img
                      src={achievement.badge_url}
                      alt={achievement.title}
                      className="h-24 w-24 object-contain"
                    />
                  </div>
                )}

                {achievement.profiles && (
                  <div className="flex items-center gap-2 pt-4 border-t">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={achievement.profiles.avatar_url} />
                      <AvatarFallback>
                        {achievement.profiles.full_name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {achievement.profiles.full_name}
                      </p>
                      {achievement.earned_at && (
                        <p className="text-xs text-muted-foreground">
                          {new Date(achievement.earned_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              No achievements yet. Keep participating to earn badges!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
