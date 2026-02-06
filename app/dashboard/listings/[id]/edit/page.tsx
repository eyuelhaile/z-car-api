'use client';

import { use, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useListing } from '@/hooks/use-listings';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import CreateListingPage from '../../create/page';
import type { Listing } from '@/types';

export default function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const listingId = resolvedParams.id;
  
  const { data: listing, isLoading, error } = useListing(listingId);

  // Normalize the API response - handle both singular and plural attribute names
  const normalizedListing = useMemo(() => {
    if (!listing) return null;
    
    // Normalize vehicleAttribute/vehicleAttributes
    const vehicleAttrs = listing.vehicleAttributes || listing.vehicleAttribute;
    // Normalize propertyAttribute/propertyAttributes
    const propertyAttrs = listing.propertyAttributes || listing.propertyAttribute;
    
    return {
      ...listing,
      vehicleAttributes: vehicleAttrs,
      propertyAttributes: propertyAttrs,
    } as Listing;
  }, [listing]);

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !normalizedListing) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-2">Listing Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The listing you're looking for doesn't exist or you don't have permission to edit it.
            </p>
            <Button onClick={() => router.push('/dashboard/listings')}>
              Back to Listings
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Render the create page with the listing data for editing
  // We'll need to modify CreateListingPage to accept initialData prop
  return <CreateListingPage initialData={normalizedListing} listingId={listingId} />;
}

