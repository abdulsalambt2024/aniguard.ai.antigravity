import { Calendar, MapPin, Users, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Event } from '@/hooks/useEvents';
import { useAuth } from '@/contexts/AuthContext';
import { useRSVP } from '@/hooks/useEvents';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const { user } = useAuth();
  const rsvp = useRSVP();

  const userRSVP = event.event_rsvps?.find((r) => r.user_id === user?.id);
  const isPast = new Date(event.event_date) < new Date();

  const handleRSVP = (status: 'going' | 'interested' | 'not_going') => {
    rsvp.mutate({ eventId: event.id, status });
  };

  return (
    <Card className={isPast ? 'opacity-60' : ''}>
      {event.banner_url && (
        <div className="w-full h-48 overflow-hidden rounded-t-lg">
          <img
            src={event.banner_url}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {format(new Date(event.event_date), 'PPP p')}
              </div>
              {event.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {event.location}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {event.attendees_count} attending
                {event.max_attendees && ` / ${event.max_attendees}`}
              </div>
            </div>
          </div>
          {userRSVP && (
            <Badge variant={userRSVP.status === 'going' ? 'default' : 'secondary'}>
              {userRSVP.status === 'going' ? 'Going' : 
               userRSVP.status === 'interested' ? 'Interested' : 'Not Going'}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-muted-foreground line-clamp-3">{event.description}</p>
      </CardContent>

      <CardFooter className="flex gap-2">
        {!isPast && (
          <>
            <Button
              variant={userRSVP?.status === 'going' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleRSVP('going')}
              disabled={rsvp.isPending}
            >
              Going
            </Button>
            <Button
              variant={userRSVP?.status === 'interested' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleRSVP('interested')}
              disabled={rsvp.isPending}
            >
              Interested
            </Button>
          </>
        )}
        {event.registration_url && (
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="ml-auto"
          >
            <a href={event.registration_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Register
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
