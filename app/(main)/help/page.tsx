import Link from 'next/link';
import { HelpCircle, Mail, MessageSquare } from 'lucide-react';

export const metadata = {
  title: 'Help Center | EagleList',
  description: 'Find answers and get support for using EagleList.',
};

export default function HelpPage() {
  return (
    <div className="border-b bg-muted/30">
      <div className="container max-w-3xl py-14 md:py-20">
        <p className="text-sm font-medium text-amber-600">Support</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Help center</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Quick answers as we grow our knowledge base. For anything urgent, contact us directly.
        </p>

        <ul className="mt-10 space-y-6">
          <li className="flex gap-4 rounded-lg border bg-background p-4">
            <HelpCircle className="h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <h2 className="font-semibold">Browsing &amp; search</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Use filters on the Vehicles and Properties pages to narrow by price, location, and type. Save
                favorites when you’re logged in.
              </p>
            </div>
          </li>
          <li className="flex gap-4 rounded-lg border bg-background p-4">
            <MessageSquare className="h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <h2 className="font-semibold">Contacting a seller</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Open a listing and use the contact options shown there. You need an account to message sellers
                securely.
              </p>
            </div>
          </li>
          <li className="flex gap-4 rounded-lg border bg-background p-4">
            <Mail className="h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <h2 className="font-semibold">Still stuck?</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Email{' '}
                <a href="mailto:support@zcar.et" className="font-medium text-amber-700 hover:underline">
                  support@zcar.et
                </a>{' '}
                or visit our{' '}
                <Link href="/contact" className="font-medium text-amber-700 hover:underline">
                  contact page
                </Link>
                .
              </p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}
