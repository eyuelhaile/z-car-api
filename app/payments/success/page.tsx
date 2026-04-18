'use client';

/**
 * Web-only success UI after Chapa redirects here (return_url must be https).
 * If CHAPA_RETURN_URL uses your API host (e.g. testapi…/payments/success), that
 * response is served by the zcar API instead — deploy either this page on your
 * web domain or the API route, and keep env consistent.
 */
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useListing } from '@/hooks/use-listings';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [listingId, setListingId] = useState<string | null>(null);
  const { data: listingData } = useListing(listingId || '');

  useEffect(() => {
    // Get listingId from URL or sessionStorage
    const listingIdFromUrl = searchParams?.get('listingId');
    const listingIdFromStorage = typeof window !== 'undefined' 
      ? sessionStorage.getItem('chapa_listing_id') 
      : null;
    
    const finalListingId = listingIdFromUrl || listingIdFromStorage;
    setListingId(finalListingId);

    // Simulate verification delay (backend callback handles actual verification)
    const timer = setTimeout(() => {
      setIsVerifying(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [searchParams]);

  const publicListingHref = listingData
    ? `/${listingData.type === 'vehicle' ? 'vehicles' : 'properties'}/${listingData.slug || listingData.id}`
    : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {isVerifying ? (
            <>
              <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
              <CardTitle className="text-2xl">Verifying Payment...</CardTitle>
              <CardDescription>
                Please wait while we confirm your payment
              </CardDescription>
            </>
          ) : (
            <>
              <div className="mx-auto mb-4 w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl text-green-600 dark:text-green-400">
                Payment Successful!
              </CardTitle>
              <CardDescription className="text-base">
                Your payment has been processed successfully. Your listing is now live and visible to all users!
              </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {!isVerifying && (
            <>
              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-sm text-green-800 dark:text-green-200">
                  <strong>Your listing is now live!</strong>
                </p>
                <ul className="mt-2 text-sm text-green-700 dark:text-green-300 space-y-1 list-disc list-inside">
                  <li>Your listing is immediately visible to all users</li>
                  <li>Potential buyers can now view and contact you</li>
                  <li>You can manage your listing from the listings page</li>
                </ul>
              </div>
              
              <div className="flex flex-col gap-2">
                <Button 
                  asChild
                  className="w-full"
                  size="lg"
                >
                  <Link href="/dashboard/listings">
                    View My Listings
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                
                {listingId && publicListingHref && (
                  <Button 
                    asChild
                    variant="outline"
                    className="w-full"
                  >
                    <Link href={publicListingHref}>
                      View This Listing
                    </Link>
                  </Button>
                )}
                
                <Button 
                  variant="ghost"
                  className="w-full"
                  onClick={() => router.push('/dashboard/listings/create')}
                >
                  Create Another Listing
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PaymentSuccessFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
          <CardTitle className="text-2xl">Verifying Payment...</CardTitle>
          <CardDescription>Loading…</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<PaymentSuccessFallback />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
