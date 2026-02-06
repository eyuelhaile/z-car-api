'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Scale,
  Trash2,
  Plus,
  X,
  Car,
  Home,
  Loader2,
  ExternalLink,
  Check,
  Minus,
  ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn, getImageUrl } from '@/lib/utils';
import { useComparisons, useRemoveFromComparison } from '@/hooks/use-dashboard';
import { Comparison, Listing } from '@/types';
import { formatDistanceToNow } from 'date-fns';

export default function ComparisonsPage() {
  const [expandedComparison, setExpandedComparison] = useState<string | null>(null);
  const { data: comparisons, isLoading } = useComparisons();
  const removeMutation = useRemoveFromComparison();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleRemoveFromComparison = (comparisonId: string, listingId: string) => {
    removeMutation.mutate({ comparisonId, listingId });
  };

  const getVehicleSpecs = (listing: Listing) => {
    const attrs = listing.vehicleAttribute || listing.vehicleAttributes;
    if (!attrs) return [];
    return [
      { label: 'Make', value: attrs.make },
      { label: 'Model', value: attrs.model },
      { label: 'Year', value: attrs.year },
      { label: 'Mileage', value: attrs.mileage ? `${attrs.mileage.toLocaleString()} km` : '-' },
      { label: 'Fuel Type', value: attrs.fuelType || '-' },
      { label: 'Transmission', value: attrs.transmission || '-' },
      { label: 'Body Type', value: attrs.bodyType || '-' },
      { label: 'Condition', value: attrs.condition || '-' },
      { label: 'Color', value: attrs.color || '-' },
    ];
  };

  const getPropertySpecs = (listing: Listing) => {
    const attrs = listing.propertyAttribute || listing.propertyAttributes;
    if (!attrs) return [];
    return [
      { label: 'Type', value: attrs.propertyType },
      { label: 'Listing Type', value: attrs.listingType },
      { label: 'Bedrooms', value: attrs.bedrooms || '-' },
      { label: 'Bathrooms', value: attrs.bathrooms || '-' },
      { label: 'Area', value: attrs.area ? `${attrs.area} m²` : '-' },
      { label: 'Floor', value: attrs.floorNumber || '-' },
      { label: 'Furnished', value: attrs.furnished ? 'Yes' : 'No' },
      { label: 'Condition', value: attrs.condition || '-' },
    ];
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div className="grid gap-4">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
            <Scale className="h-8 w-8" />
            Comparisons
          </h1>
          <p className="text-muted-foreground mt-1">
            Compare listings side by side
          </p>
        </div>
        <Link href="/vehicles">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Listings
          </Button>
        </Link>
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <p className="text-sm text-blue-800">
            <strong>💡 Tip:</strong> When browsing listings, click the compare button to add listings 
            to your comparison. You can compare up to 4 listings at a time.
          </p>
        </CardContent>
      </Card>

      {/* Comparisons List */}
      {(comparisons || []).length > 0 ? (
        <div className="space-y-6">
          {comparisons?.map((comparison) => {
            const isExpanded = expandedComparison === comparison.id;
            const isVehicle = comparison.type === 'vehicle';
            const listings = comparison.listings || [];

            return (
              <Card key={comparison.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'p-2 rounded-lg',
                          isVehicle ? 'bg-amber-100' : 'bg-emerald-100'
                        )}
                      >
                        {isVehicle ? (
                          <Car className="h-5 w-5 text-amber-600" />
                        ) : (
                          <Home className="h-5 w-5 text-emerald-600" />
                        )}
                      </div>
                      <div>
                        <CardTitle>{comparison.name}</CardTitle>
                        <CardDescription>
                          {listings.length} listing{listings.length !== 1 ? 's' : ''} • Created{' '}
                          {comparison.createdAt
                            ? formatDistanceToNow(new Date(comparison.createdAt), { addSuffix: true })
                            : ''}
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setExpandedComparison(isExpanded ? null : comparison.id)}
                    >
                      {isExpanded ? 'Collapse' : 'Compare'}
                    </Button>
                  </div>
                </CardHeader>

                {/* Listings Preview */}
                {!isExpanded && listings.length > 0 && (
                  <CardContent className="pt-0">
                    <div className="flex gap-4 overflow-x-auto pb-2">
                      {listings.map((listing) => (
                        <div
                          key={listing.id}
                          className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 shrink-0"
                        >
                          <div className="w-12 h-10 rounded overflow-hidden bg-muted relative">
                            {listing.images?.[0]?.url ? (
                              <Image
                                src={getImageUrl(listing.images[0].thumbnail || listing.images[0].url)}
                                alt={listing.title}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate max-w-[150px]">
                              {listing.title}
                            </p>
                            <p className="text-xs text-amber-600">
                              {formatPrice(listing.price)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}

                {/* Expanded Comparison Table */}
                {isExpanded && listings.length > 0 && (
                  <CardContent>
                    <ScrollArea className="w-full">
                      <div className="min-w-[600px]">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[150px]">Specification</TableHead>
                              {listings.map((listing) => (
                                <TableHead key={listing.id} className="min-w-[200px]">
                                  <div className="flex flex-col gap-2">
                                    <div className="w-full h-32 rounded-lg overflow-hidden bg-muted relative">
                                      {listing.images?.[0]?.url ? (
                                        <Image
                                          src={getImageUrl(listing.images[0].url)}
                                          alt={listing.title}
                                          fill
                                          className="object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                      )}
                                      <Button
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2 h-6 w-6"
                                        onClick={() => handleRemoveFromComparison(comparison.id, listing.id)}
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                    <Link
                                      href={`/${isVehicle ? 'vehicles' : 'properties'}/${listing.slug}`}
                                      className="font-medium hover:text-amber-600 transition-colors line-clamp-2 text-sm"
                                    >
                                      {listing.title}
                                    </Link>
                                  </div>
                                </TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-medium">Price</TableCell>
                              {listings.map((listing) => (
                                <TableCell key={listing.id}>
                                  <span className="text-lg font-bold text-amber-600">
                                    {formatPrice(listing.price)}
                                  </span>
                                  {listing.isNegotiable && (
                                    <Badge variant="outline" className="ml-2 text-xs">
                                      Negotiable
                                    </Badge>
                                  )}
                                </TableCell>
                              ))}
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium">Location</TableCell>
                              {listings.map((listing) => (
                                <TableCell key={listing.id}>
                                  {listing.location}, {listing.city}
                                </TableCell>
                              ))}
                            </TableRow>
                            {(isVehicle ? getVehicleSpecs(listings[0]) : getPropertySpecs(listings[0])).map(
                              (spec, index) => (
                                <TableRow key={spec.label}>
                                  <TableCell className="font-medium">{spec.label}</TableCell>
                                  {listings.map((listing) => {
                                    const specs = isVehicle
                                      ? getVehicleSpecs(listing)
                                      : getPropertySpecs(listing);
                                    return (
                                      <TableCell key={listing.id}>
                                        {specs[index]?.value || '-'}
                                      </TableCell>
                                    );
                                  })}
                                </TableRow>
                              )
                            )}
                            <TableRow>
                              <TableCell className="font-medium">Actions</TableCell>
                              {listings.map((listing) => (
                                <TableCell key={listing.id}>
                                  <Link href={`/${isVehicle ? 'vehicles' : 'properties'}/${listing.slug}`}>
                                    <Button size="sm" className="gap-1">
                                      View Details
                                      <ExternalLink className="h-3 w-3" />
                                    </Button>
                                  </Link>
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                      <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                  </CardContent>
                )}

                {isExpanded && listings.length === 0 && (
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      No listings in this comparison. Add some listings to compare.
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Scale className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No comparisons yet</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              Start comparing listings by clicking the compare button when browsing.
            </p>
            <Link href="/vehicles">
              <Button className="mt-4">Browse Listings</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

