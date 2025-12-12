import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Shield, Copy, Download } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import QRCode from 'qrcode';

export function TwoFactorAuth() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showSetup, setShowSetup] = useState(false);
  const [showDisable, setShowDisable] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);

  const { data: twoFactorStatus, isLoading } = useQuery({
    queryKey: ['2fa-status', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_2fa')
        .select('enabled')
        .eq('user_id', user?.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data?.enabled || false;
    },
    enabled: !!user?.id
  });

  const setupMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('setup-2fa', {
        body: {}  // User ID extracted from JWT token in Edge Function
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      setSecret(data.secret);
      setRecoveryCodes(data.recoveryCodes);
      
      const otpauthUrl = `otpauth://totp/PARIVARTAN:${user?.email}?secret=${data.secret}&issuer=PARIVARTAN`;
      const qr = await QRCode.toDataURL(otpauthUrl);
      setQrCodeUrl(qr);
      setShowSetup(true);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to setup 2FA');
    }
  });

  const verifyMutation = useMutation({
    mutationFn: async (code: string) => {
      const { data, error } = await supabase.functions.invoke('verify-2fa', {
        body: { token: code, secret }  // User ID extracted from JWT
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['2fa-status'] });
      setShowSetup(false);
      toast.success('2FA enabled successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Invalid verification code');
    }
  });

  const disableMutation = useMutation({
    mutationFn: async (code: string) => {
      const { data, error } = await supabase.functions.invoke('disable-2fa', {
        body: { token: code }  // User ID extracted from JWT
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['2fa-status'] });
      setShowDisable(false);
      toast.success('2FA disabled successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Invalid verification code');
    }
  });

  const handleToggle = (enabled: boolean) => {
    if (enabled) {
      setupMutation.mutate();
    } else {
      setShowDisable(true);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const downloadRecoveryCodes = () => {
    const blob = new Blob([recoveryCodes.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'parivartan-recovery-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Recovery codes downloaded');
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Enable 2FA</Label>
              <p className="text-sm text-muted-foreground">
                Use Google Authenticator to secure your account
              </p>
            </div>
            <Switch
              checked={twoFactorStatus}
              onCheckedChange={handleToggle}
              disabled={setupMutation.isPending}
            />
          </div>
        </CardContent>
      </Card>

      {/* Setup Dialog */}
      <Dialog open={showSetup} onOpenChange={setShowSetup}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Setup Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan this QR code with Google Authenticator
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {qrCodeUrl && (
              <div className="flex justify-center">
                <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64" />
              </div>
            )}
            
            <div className="space-y-2">
              <Label>Or enter this key manually:</Label>
              <div className="flex gap-2">
                <Input value={secret} readOnly className="font-mono" />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => copyToClipboard(secret)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {recoveryCodes.length > 0 && (
              <div className="space-y-2">
                <Label>Recovery Codes (Save these securely!):</Label>
                <div className="bg-muted p-3 rounded-md space-y-1 font-mono text-sm">
                  {recoveryCodes.map((code, i) => (
                    <div key={i}>{code}</div>
                  ))}
                </div>
                <Button
                  onClick={downloadRecoveryCodes}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Recovery Codes
                </Button>
              </div>
            )}

            <div className="space-y-2">
              <Label>Enter 6-digit code from app:</Label>
              <Input
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="000000"
                maxLength={6}
                className="text-center text-lg tracking-widest"
              />
            </div>

            <Button
              onClick={() => verifyMutation.mutate(verificationCode)}
              disabled={verificationCode.length !== 6 || verifyMutation.isPending}
              className="w-full"
            >
              Verify and Enable
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Disable Dialog */}
      <Dialog open={showDisable} onOpenChange={setShowDisable}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Enter your 6-digit code to confirm
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Input
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="000000"
              maxLength={6}
              className="text-center text-lg tracking-widest"
            />
            <Button
              onClick={() => disableMutation.mutate(verificationCode)}
              disabled={verificationCode.length !== 6 || disableMutation.isPending}
              className="w-full"
              variant="destructive"
            >
              Disable 2FA
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
