import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone } from 'lucide-react';

export default function Help() {
  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Help & Support</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Contact Us</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Phone</p>
              <a href="tel:9608353448" className="text-muted-foreground hover:text-primary">
                9608353448
              </a>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Email</p>
              <div className="space-y-1">
                <a 
                  href="mailto:abdul.salam.bt.2024@miet.ac.in" 
                  className="block text-muted-foreground hover:text-primary"
                >
                  abdul.salam.bt.2024@miet.ac.in
                </a>
                <a 
                  href="mailto:hayatamr9608@gmail.com" 
                  className="block text-muted-foreground hover:text-primary"
                >
                  hayatamr9608@gmail.com
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About PARIVARTAN</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            PARIVARTAN is dedicated to enlightening children and discovering personalities 
            through education and empowerment of rural youth. Making a difference, one Sunday at a time.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
