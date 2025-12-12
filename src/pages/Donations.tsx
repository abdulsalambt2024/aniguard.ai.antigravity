import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useCampaigns } from '@/hooks/useDonations';
import { Heart, TrendingUp, Calendar } from 'lucide-react';
import { CreateCampaignDialog } from '@/components/donations/CreateCampaignDialog';
import { useAuth } from '@/contexts/AuthContext';

export default function Donations() {
  const { data: campaigns, isLoading } = useCampaigns();
  const { role } = useAuth();

  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto p-4">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Donation Campaigns</h1>
        <p className="text-muted-foreground">
          Support causes that matter to our community
        </p>
      </div>

      {campaigns && campaigns.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => {
            const progress = (campaign.current_amount / campaign.target_amount) * 100;
            const daysLeft = campaign.end_date
              ? Math.ceil((new Date(campaign.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
              : null;

            return (
              <Card key={campaign.id} className="overflow-hidden">
                {campaign.banner_url && (
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={campaign.banner_url}
                      alt={campaign.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="line-clamp-2">{campaign.title}</CardTitle>
                  {campaign.category && (
                    <CardDescription className="capitalize">
                      {campaign.category}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {campaign.description}
                  </p>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">
                        ₹{campaign.current_amount.toLocaleString()}
                      </span>
                      <span className="text-muted-foreground">
                        of ₹{campaign.target_amount.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {progress.toFixed(0)}% funded
                      </div>
                      {daysLeft !== null && daysLeft > 0 && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {daysLeft} days left
                        </div>
                      )}
                    </div>
                  </div>

                  <Button className="w-full">
                    <Heart className="h-4 w-4 mr-2" />
                    Donate Now
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No active campaigns at the moment</p>
          </CardContent>
        </Card>
      )}
      
      {(role === 'admin' || role === 'super_admin') && <CreateCampaignDialog />}
    </div>
  );
}
