import Link from 'next/link';
import { Building2, Target, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'About Us | EagleList',
  description: 'Learn about EagleList, Ethiopia’s marketplace for vehicles and properties.',
};

export default function AboutPage() {
  return (
    <div className="border-b bg-muted/30">
      <div className="container max-w-3xl py-14 md:py-20">
        <p className="text-sm font-medium text-amber-600">Company</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">About EagleList</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          We connect buyers and sellers of vehicles and real estate across Ethiopia—with verified listings and
          tools that make discovery simple.
        </p>

        <ul className="mt-10 space-y-8">
          <li className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold">Our mission</h2>
              <p className="mt-1 text-muted-foreground">
                Make it easier to find the right car or property with transparent information and direct contact
                between parties.
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold">Community</h2>
              <p className="mt-1 text-muted-foreground">
                We focus on trust: verified sellers, clear listings, and support when you need it.
              </p>
            </div>
          </li>
          <li className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold">Based in Addis Ababa</h2>
              <p className="mt-1 text-muted-foreground">
                Headquartered in Bole, we serve users and partners across the country.
              </p>
            </div>
          </li>
        </ul>

        <div className="mt-12 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/contact">Contact us</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/vehicles">Browse vehicles</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
