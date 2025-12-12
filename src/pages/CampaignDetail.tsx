import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Heart, Users, Calendar, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import QRCode from 'qrcode';
import { donationSchema } from '@/lib/validation';
import { useEffect, useState } from 'react';
import { createErrorLogger } from '@/lib/errorLogger';

const logger = createErrorLogger('CampaignDetail');

export default function CampaignDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [donationForm, setDonationForm] = useState({
    amount: '',
    donor_name: '',
    message: '',
    is_anonymous: false,
  });

  // Fetch campaign data
  const { data: campaign, isLoading, error } = useQuery({
    queryKey: ['campaign', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Generate QR code if UPI ID exists
      if (data.upi_id) {
        try {
          const { data: qrData } = await supabase.rpc('generate_upi_qr_data', {
            upi_id: data.upi_id,
            payee_name: data.title,
            note: `Donation to ${data.title}`,
          });

          const qr = await QRCode.toDataURL(qrData);
          setQrCodeUrl(qr);
        } catch (err) {
          logger.error(err as Error, { context: 'QR generation' });
        }
      }

      return data;
    },
  });

  // Fetch donations
  const { data: donations = [] } = useQuery({
    queryKey: ['donations', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('donations')
        .select('*')
        .eq('campaign_id', id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
  });

  const initiatePaymentMutation = useMutation({
    mutationFn: async (donationData: any) => {
      const { data, error } = await supabase.functions.invoke('initiate-payment', {
        body: {
          campaign_id: id,
          amount: donationData.amount,
          donor_name: donationData.donor_name,
          is_anonymous: donationData.is_anonymous,
          message: donationData.message,
          payment_gateway: 'upi',
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setPaymentId(data.payment_id);
      
      // Open UPI app
      if (data.upi_url) {
        window.location.href = data.upi_url;
      }
      
      toast.success('Payment initiated! Please complete the payment in your UPI app.');
    },
    onError: (error: any) => {
      logger.error(error, { context: 'Payment initiation' });
      toast.error(error.message || 'Failed to initiate payment');
      setIsProcessingPayment(false);
    },
  });

  const verifyPaymentMutation = useMutation({
    mutationFn: async (payment_id: string) => {
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: {
          payment_id,
          user_confirmed: true,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: async () => {
      toast.success('Thank you for your donation!');
      
      // Send confirmation email if donor provided name (not anonymous)
      if (!donationForm.is_anonymous && donationForm.donor_name) {
        try {
          await supabase.functions.invoke('send-donation-email', {
            body: {
              type: 'donation_success',
              recipientEmail: '', // Would need donor email - skipping for now
              recipientName: donationForm.donor_name,
              donationAmount: parseFloat(donationForm.amount),
              campaignTitle: campaign?.title,
              transactionId: paymentId,
            },
          });
        } catch (emailError) {
          // Don't fail the donation if email fails
          console.log('Email notification failed:', emailError);
        }
      }
      
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['campaign', id] });
      queryClient.invalidateQueries({ queryKey: ['donations', id] });
      setIsProcessingPayment(false);
      setPaymentId(null);
      setDonationForm({
        amount: '',
        donor_name: '',
        message: '',
        is_anonymous: false,
      });
    },
    onError: (error: any) => {
      logger.error(error, { context: 'Payment verification' });
      toast.error(error.message || 'Failed to verify payment');
      setIsProcessingPayment(false);
    },
  });

  const handleUpiPayment = async () => {
    if (!campaign?.upi_id) {
      toast.error('UPI ID not configured for this campaign');
      return;
    }

    const validationResult = donationSchema.safeParse(donationForm);
    if (!validationResult.success) {
      toast.error(validationResult.error.errors[0].message);
      return;
    }

    setIsProcessingPayment(true);
    initiatePaymentMutation.mutate(donationForm);
  };

  const handlePaymentComplete = () => {
    if (!paymentId) return;
    verifyPaymentMutation.mutate(paymentId);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-destructive">Campaign not found</p>
            <Button asChild className="mt-4">
              <Link to="/donations">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Campaigns
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = ((campaign.current_amount || 0) / campaign.target_amount) * 100;
  const daysLeft = campaign.end_date
    ? Math.max(0, Math.ceil((new Date(campaign.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Button variant="ghost" asChild className="mb-4">
        <Link to="/donations">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Campaigns
        </Link>
      </Button>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Campaign Details */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            {campaign.banner_url && (
              <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                <img
                  src={campaign.banner_url}
                  alt={campaign.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <CardContent className="pt-6 space-y-4">
              <h1 className="text-3xl font-bold">{campaign.title}</h1>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Raised</span>
                  <span className="font-semibold">
                    ₹{(campaign.current_amount || 0).toLocaleString()} / ₹{campaign.target_amount.toLocaleString()}
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <div className="flex gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  <span>{donations.length} Donors</span>
                </div>
                {daysLeft !== null && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{daysLeft} days left</span>
                  </div>
                )}
              </div>

              <div className="pt-4 prose prose-sm max-w-none">
                <p className="text-muted-foreground whitespace-pre-wrap">{campaign.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Recent Donors */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Recent Donors
              </h3>
              <div className="space-y-3">
                {donations.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No donations yet. Be the first!</p>
                ) : (
                  donations.map((donation) => (
                    <div key={donation.id} className="flex justify-between items-start p-3 bg-muted rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">
                          {donation.is_anonymous ? 'Anonymous Donor' : donation.donor_name || 'Anonymous'}
                        </p>
                        {donation.message && (
                          <p className="text-sm text-muted-foreground mt-1">{donation.message}</p>
                        )}
                      </div>
                      <span className="font-semibold text-primary">₹{donation.amount.toLocaleString()}</span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Donation Form */}
        <div className="space-y-4">
          {/* UPI Info Card */}
          {(campaign.qr_code_url || qrCodeUrl) && (
            <Card>
              <CardContent className="pt-6 space-y-4">
                <h3 className="font-semibold text-center">Scan to Pay</h3>
                <div className="flex justify-center">
                  <img
                    src={campaign.qr_code_url || qrCodeUrl}
                    alt="UPI QR Code"
                    className="w-48 h-48 border-2 border-border rounded-lg p-2"
                  />
                </div>
                {campaign.upi_id && (
                  <div className="text-center">
                    <Label className="text-xs text-muted-foreground">UPI ID</Label>
                    <p className="font-mono text-sm bg-muted px-3 py-2 rounded-md mt-1 break-all">
                      {campaign.upi_id}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Donation Form */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-semibold">Make a Donation</h3>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  value={donationForm.amount}
                  onChange={(e) => setDonationForm({ ...donationForm, amount: e.target.value })}
                  placeholder="Enter amount"
                  disabled={isProcessingPayment}
                />
                {campaign.amount_presets && campaign.amount_presets.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {campaign.amount_presets.map((preset: number) => (
                      <Button
                        key={preset}
                        variant="outline"
                        size="sm"
                        onClick={() => setDonationForm({ ...donationForm, amount: preset.toString() })}
                        disabled={isProcessingPayment}
                      >
                        ₹{preset}
                      </Button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="donor_name">Your Name</Label>
                <Input
                  id="donor_name"
                  value={donationForm.donor_name}
                  onChange={(e) => setDonationForm({ ...donationForm, donor_name: e.target.value })}
                  placeholder="Enter your name"
                  disabled={donationForm.is_anonymous || isProcessingPayment}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message (Optional)</Label>
                <Textarea
                  id="message"
                  value={donationForm.message}
                  onChange={(e) => setDonationForm({ ...donationForm, message: e.target.value })}
                  placeholder="Leave a message of support"
                  disabled={isProcessingPayment}
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="anonymous"
                  checked={donationForm.is_anonymous}
                  onCheckedChange={(checked) =>
                    setDonationForm({ ...donationForm, is_anonymous: checked as boolean })
                  }
                  disabled={isProcessingPayment}
                />
                <Label htmlFor="anonymous" className="text-sm font-normal cursor-pointer">
                  Donate anonymously
                </Label>
              </div>

              {!isProcessingPayment ? (
                <Button
                  onClick={handleUpiPayment}
                  className="w-full"
                  size="lg"
                  disabled={!donationForm.amount || parseFloat(donationForm.amount) <= 0}
                >
                  <Wallet className="mr-2 h-5 w-5" />
                  Pay with UPI
                </Button>
              ) : paymentId ? (
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      Payment initiated. Complete the payment in your UPI app.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Payment ID: {paymentId}
                    </p>
                  </div>
                  <Button
                    onClick={handlePaymentComplete}
                    className="w-full"
                    size="lg"
                    variant="default"
                  >
                    I have completed the payment
                  </Button>
                  <Button
                    onClick={() => {
                      setIsProcessingPayment(false);
                      setPaymentId(null);
                    }}
                    className="w-full"
                    size="lg"
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button className="w-full" size="lg" disabled>
                  Processing...
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
