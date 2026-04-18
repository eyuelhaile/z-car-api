import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Contact Us | EagleList',
  description: 'Get in touch with EagleList support and our team in Addis Ababa.',
};

export default function ContactPage() {
  return (
    <div className="border-b bg-muted/30">
      <div className="container max-w-3xl py-14 md:py-20">
        <p className="text-sm font-medium text-amber-600">Company</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Contact us</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Questions about listings, your account, or partnerships? Reach out—we’re happy to help.
        </p>

        <div className="mt-10 space-y-6 rounded-xl border bg-background p-6 shadow-sm">
          <div className="flex gap-4">
            <MapPin className="h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-medium">Address</p>
              <p className="text-muted-foreground">Bole, Addis Ababa, Ethiopia</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Phone className="h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-medium">Phone</p>
              <a href="tel:+251911234567" className="text-muted-foreground hover:text-foreground">
                +251 911 234 567
              </a>
            </div>
          </div>
          <div className="flex gap-4">
            <Mail className="h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-medium">Email</p>
              <a href="mailto:support@zcar.et" className="text-muted-foreground hover:text-foreground">
                support@zcar.et
              </a>
            </div>
          </div>
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          For listing or account issues, signed-in users can also use{' '}
          <Link href="/dashboard/messages" className="font-medium text-amber-700 hover:underline">
            Messages
          </Link>{' '}
          in the dashboard.
        </p>

        <div className="mt-8">
          <Button variant="outline" asChild>
            <Link href="/help">Help center</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
