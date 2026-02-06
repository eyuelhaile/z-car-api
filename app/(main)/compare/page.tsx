'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Scale,
  Trash2,
  X,
  Car,
  Home,
  Loader2,
  ExternalLink,
  ImageIcon,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useComparisonCart, useRemoveFromComparisonCart, useClearComparisonCart } from '@/hooks/use-dashboard';
import { useAuthStore } from '@/lib/store';
import { cn, getImageUrl } from '@/lib/utils';
import { Listing } from '@/types';

function ComparePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = (searchParams.get('type') as 'vehicle' | 'property') || 'vehicle';
  
  const { isAuthenticated } = useAuthStore();
  const { data: cart, isLoading } = useComparisonCart(type, isAuthenticated);
  const removeFromCartMutation = useRemoveFromComparisonCart();
  const clearCartMutation = useClearComparisonCart();

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      maximumFractionDigits: 0,
    }).format(numPrice);
  };

  const handleRemove = (listingId: string) => {
    removeFromCartMutation.mutate({ listingId, type });
  };

  const handleClearAll = () => {
    clearCartMutation.mutate(type);
  };

  const getVehicleSpecs = (listing: Listing) => {
    const attrs = listing.vehicleAttribute || listing.vehicleAttributes;
    if (!attrs) return [];
    return [
      { label: 'Make', value: attrs.make, category: 'basic' },
      { label: 'Model', value: attrs.model, category: 'basic' },
      { label: 'Year', value: attrs.year, category: 'basic' },
      { label: 'Body Type', value: attrs.bodyType || '-', category: 'basic' },
      { label: 'Condition', value: attrs.condition ? attrs.condition.charAt(0).toUpperCase() + attrs.condition.slice(1) : '-', category: 'basic' },
      { label: 'Color', value: attrs.color || '-', category: 'basic' },
      { label: 'Interior Color', value: attrs.interiorColor || '-', category: 'basic' },
      { label: 'Mileage', value: attrs.mileage ? `${attrs.mileage.toLocaleString()} km` : '-', category: 'performance' },
      { label: 'Fuel Type', value: attrs.fuelType ? attrs.fuelType.charAt(0).toUpperCase() + attrs.fuelType.slice(1) : '-', category: 'performance' },
      { label: 'Transmission', value: attrs.transmission ? attrs.transmission.charAt(0).toUpperCase() + attrs.transmission.slice(1).replace('_', ' ') : '-', category: 'performance' },
      { label: 'Engine Size', value: attrs.engineSize ? `${attrs.engineSize}L` : '-', category: 'performance' },
      { label: 'Horsepower', value: attrs.horsepower ? `${attrs.horsepower} HP` : '-', category: 'performance' },
      { label: 'Doors', value: attrs.doors || '-', category: 'interior' },
      { label: 'Seats', value: attrs.seats || '-', category: 'interior' },
      { label: 'VIN', value: attrs.vin || '-', category: 'other' },
      { label: 'Features', value: attrs.features?.length ? attrs.features.join(', ') : '-', category: 'features' },
    ];
  };

  const getPropertySpecs = (listing: Listing) => {
    const attrs = listing.propertyAttribute || listing.propertyAttributes;
    if (!attrs) return [];
    return [
      { label: 'Property Type', value: attrs.propertyType ? attrs.propertyType.charAt(0).toUpperCase() + attrs.propertyType.slice(1) : '-', category: 'basic' },
      { label: 'Listing Type', value: attrs.listingType === 'sale' ? 'For Sale' : 'For Rent', category: 'basic' },
      { label: 'Condition', value: attrs.condition ? attrs.condition.charAt(0).toUpperCase() + attrs.condition.slice(1).replace('_', ' ') : '-', category: 'basic' },
      { label: 'Year Built', value: attrs.yearBuilt || '-', category: 'basic' },
      { label: 'Total Rooms', value: attrs.rooms || '-', category: 'rooms' },
      { label: 'Bedrooms', value: attrs.bedrooms || '-', category: 'rooms' },
      { label: 'Bathrooms', value: attrs.bathrooms || '-', category: 'rooms' },
      { label: 'Area', value: attrs.area ? `${attrs.area.toLocaleString()} m²` : '-', category: 'size' },
      { label: 'Lot Size', value: attrs.lotSize ? `${attrs.lotSize.toLocaleString()} m²` : '-', category: 'size' },
      { label: 'Total Floors', value: attrs.floors || '-', category: 'size' },
      { label: 'Floor Number', value: attrs.floorNumber || '-', category: 'size' },
      { label: 'Parking Spaces', value: attrs.parkingSpaces || '-', category: 'amenities' },
      { label: 'Furnished', value: attrs.furnished ? 'Yes' : 'No', category: 'amenities' },
      { label: 'Amenities', value: attrs.amenities?.length ? attrs.amenities.join(', ') : '-', category: 'features' },
      { label: 'Features', value: attrs.features?.length ? attrs.features.join(', ') : '-', category: 'features' },
    ];
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      sold: 'bg-red-100 text-red-700',
      rented: 'bg-blue-100 text-blue-700',
      inactive: 'bg-gray-100 text-gray-700',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-700';
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="container py-12">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Scale className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Sign in to compare</h3>
              <p className="text-muted-foreground text-center max-w-sm mb-4">
                Please sign in to view and compare your saved listings.
              </p>
              <Link href="/auth/login">
                <Button>Sign In</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="container py-12">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-4 w-64 mb-8" />
          <div className="flex gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-64" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const listings = cart?.listings || [];
  const isVehicle = type === 'vehicle';

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <Button
              variant="ghost"
              className="mb-2 -ml-2"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
              {isVehicle ? (
                <Car className="h-8 w-8 text-amber-500" />
              ) : (
                <Home className="h-8 w-8 text-emerald-500" />
              )}
              Compare {isVehicle ? 'Vehicles' : 'Properties'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {listings.length} item{listings.length !== 1 ? 's' : ''} in comparison
            </p>
          </div>
          
          <div className="flex gap-2">
            <Link href={isVehicle ? '/vehicles' : '/properties'}>
              <Button variant="outline" className="gap-2">
                <Scale className="h-4 w-4" />
                Add More
              </Button>
            </Link>
            {listings.length > 0 && (
              <Button
                variant="destructive"
                onClick={handleClearAll}
                disabled={clearCartMutation.isPending}
              >
                {clearCartMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Type Toggle */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={type === 'vehicle' ? 'default' : 'outline'}
            onClick={() => router.push('/compare?type=vehicle')}
            className={cn(type === 'vehicle' && 'bg-amber-500 hover:bg-amber-600')}
          >
            <Car className="h-4 w-4 mr-2" />
            Vehicles
          </Button>
          <Button
            variant={type === 'property' ? 'default' : 'outline'}
            onClick={() => router.push('/compare?type=property')}
            className={cn(type === 'property' && 'bg-emerald-500 hover:bg-emerald-600')}
          >
            <Home className="h-4 w-4 mr-2" />
            Properties
          </Button>
        </div>

        {/* Comparison Content */}
        {listings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Scale className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No items to compare</h3>
              <p className="text-muted-foreground text-center max-w-sm mb-4">
                Add {isVehicle ? 'vehicles' : 'properties'} to your comparison to see them side by side.
              </p>
              <Link href={isVehicle ? '/vehicles' : '/properties'}>
                <Button className={isVehicle ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'}>
                  Browse {isVehicle ? 'Vehicles' : 'Properties'}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : listings.length === 1 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center mb-6">
                <Badge variant="secondary" className="mb-4">1 item in comparison</Badge>
                <h3 className="text-lg font-semibold mb-2">Add one more to compare</h3>
                <p className="text-muted-foreground text-sm">
                  You need at least 2 items to compare. Add another {isVehicle ? 'vehicle' : 'property'} to see them side by side.
                </p>
              </div>
              
              <div className="flex justify-center">
                <div className="w-64">
                  <div className="relative h-40 rounded-lg overflow-hidden bg-muted mb-3">
                    {listings[0].images?.[0] ? (
                      <Image
                        src={getImageUrl(listings[0].images[0].thumbnail || listings[0].images[0].url)}
                        alt={listings[0].title}
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
                      onClick={() => handleRemove(listings[0].id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="font-medium text-sm truncate">{listings[0].title}</p>
                  <p className={cn('font-bold', isVehicle ? 'text-amber-600' : 'text-emerald-600')}>
                    {formatPrice(listings[0].price)}
                  </p>
                </div>
              </div>
              
              <div className="text-center mt-6">
                <Link href={isVehicle ? '/vehicles' : '/properties'}>
                  <Button className={isVehicle ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'}>
                    Add Another {isVehicle ? 'Vehicle' : 'Property'}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="w-full">
                <div className="min-w-[700px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[180px] sticky left-0 bg-background z-10 font-semibold">Specification</TableHead>
                        {listings.map((listing) => (
                          <TableHead key={listing.id} className="min-w-[260px]">
                            <div className="flex flex-col gap-3 pb-2">
                              <div className="w-full h-40 rounded-lg overflow-hidden bg-muted relative">
                                {listing.images?.[0] ? (
                                  <Image
                                    src={getImageUrl(listing.images[0].thumbnail || listing.images[0].url)}
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
                                  className="absolute top-2 right-2 h-7 w-7"
                                  onClick={() => handleRemove(listing.id)}
                                  disabled={removeFromCartMutation.isPending}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                                {listing.status && (
                                  <Badge className={cn('absolute bottom-2 left-2', getStatusBadge(listing.status))}>
                                    {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                                  </Badge>
                                )}
                              </div>
                              <Link
                                href={`/${isVehicle ? 'vehicles' : 'properties'}/${listing.slug}`}
                                className={cn(
                                  'font-semibold hover:underline transition-colors line-clamp-2 text-base',
                                  isVehicle ? 'hover:text-amber-600' : 'hover:text-emerald-600'
                                )}
                              >
                                {listing.title}
                              </Link>
                            </div>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Price & Status Section */}
                      <TableRow className="bg-muted/30">
                        <TableCell colSpan={listings.length + 1} className="font-semibold text-sm uppercase tracking-wide py-2 sticky left-0">
                          💰 Pricing
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium sticky left-0 bg-background">Price</TableCell>
                        {listings.map((listing) => (
                          <TableCell key={listing.id}>
                            <span className={cn('text-xl font-bold', isVehicle ? 'text-amber-600' : 'text-emerald-600')}>
                              {formatPrice(listing.price)}
                            </span>
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium sticky left-0 bg-background">Views</TableCell>
                        {listings.map((listing) => (
                          <TableCell key={listing.id}>
                            {listing.viewsCount?.toLocaleString() || '0'} views
                          </TableCell>
                        ))}
                      </TableRow>
                      
                      {/* Location Section */}
                      <TableRow className="bg-muted/30">
                        <TableCell colSpan={listings.length + 1} className="font-semibold text-sm uppercase tracking-wide py-2 sticky left-0">
                          📍 Location
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium sticky left-0 bg-background">Address</TableCell>
                        {listings.map((listing) => (
                          <TableCell key={listing.id}>
                            {listing.location || '-'}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium sticky left-0 bg-background">City</TableCell>
                        {listings.map((listing) => (
                          <TableCell key={listing.id}>
                            {listing.city || '-'}
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium sticky left-0 bg-background">Region</TableCell>
                        {listings.map((listing) => (
                          <TableCell key={listing.id}>
                            {listing.region || '-'}
                          </TableCell>
                        ))}
                      </TableRow>

                      {/* Specifications Section */}
                      <TableRow className="bg-muted/30">
                        <TableCell colSpan={listings.length + 1} className="font-semibold text-sm uppercase tracking-wide py-2 sticky left-0">
                          {isVehicle ? '🚗 Vehicle Details' : '🏠 Property Details'}
                        </TableCell>
                      </TableRow>
                      {listings[0] && (isVehicle ? getVehicleSpecs(listings[0]) : getPropertySpecs(listings[0]))
                        .filter(spec => spec.category === 'basic')
                        .map((spec, index) => {
                          const allSpecs = listings.map(l => 
                            (isVehicle ? getVehicleSpecs(l) : getPropertySpecs(l))
                              .filter(s => s.category === 'basic')
                          );
                          return (
                            <TableRow key={spec.label}>
                              <TableCell className="font-medium sticky left-0 bg-background">{spec.label}</TableCell>
                              {listings.map((listing, listingIndex) => (
                                <TableCell key={listing.id}>
                                  {allSpecs[listingIndex]?.[index]?.value || '-'}
                                </TableCell>
                              ))}
                            </TableRow>
                          );
                        })}

                      {/* Performance/Size Section */}
                      <TableRow className="bg-muted/30">
                        <TableCell colSpan={listings.length + 1} className="font-semibold text-sm uppercase tracking-wide py-2 sticky left-0">
                          {isVehicle ? '⚡ Performance' : '📐 Size & Layout'}
                        </TableCell>
                      </TableRow>
                      {listings[0] && (isVehicle ? getVehicleSpecs(listings[0]) : getPropertySpecs(listings[0]))
                        .filter(spec => spec.category === (isVehicle ? 'performance' : 'rooms') || spec.category === 'size')
                        .map((spec, index) => {
                          const categoryFilter = isVehicle ? 'performance' : ['rooms', 'size'];
                          const allSpecs = listings.map(l => 
                            (isVehicle ? getVehicleSpecs(l) : getPropertySpecs(l))
                              .filter(s => Array.isArray(categoryFilter) ? categoryFilter.includes(s.category) : s.category === categoryFilter)
                          );
                          return (
                            <TableRow key={spec.label}>
                              <TableCell className="font-medium sticky left-0 bg-background">{spec.label}</TableCell>
                              {listings.map((listing, listingIndex) => (
                                <TableCell key={listing.id}>
                                  {allSpecs[listingIndex]?.[index]?.value || '-'}
                                </TableCell>
                              ))}
                            </TableRow>
                          );
                        })}

                      {/* Interior/Amenities Section */}
                      <TableRow className="bg-muted/30">
                        <TableCell colSpan={listings.length + 1} className="font-semibold text-sm uppercase tracking-wide py-2 sticky left-0">
                          {isVehicle ? '🪑 Interior' : '🏷️ Amenities'}
                        </TableCell>
                      </TableRow>
                      {listings[0] && (isVehicle ? getVehicleSpecs(listings[0]) : getPropertySpecs(listings[0]))
                        .filter(spec => spec.category === (isVehicle ? 'interior' : 'amenities'))
                        .map((spec, index) => {
                          const allSpecs = listings.map(l => 
                            (isVehicle ? getVehicleSpecs(l) : getPropertySpecs(l))
                              .filter(s => s.category === (isVehicle ? 'interior' : 'amenities'))
                          );
                          return (
                            <TableRow key={spec.label}>
                              <TableCell className="font-medium sticky left-0 bg-background">{spec.label}</TableCell>
                              {listings.map((listing, listingIndex) => (
                                <TableCell key={listing.id}>
                                  {allSpecs[listingIndex]?.[index]?.value || '-'}
                                </TableCell>
                              ))}
                            </TableRow>
                          );
                        })}

                      {/* Features Section */}
                      <TableRow className="bg-muted/30">
                        <TableCell colSpan={listings.length + 1} className="font-semibold text-sm uppercase tracking-wide py-2 sticky left-0">
                          ✨ Features
                        </TableCell>
                      </TableRow>
                      {listings[0] && (isVehicle ? getVehicleSpecs(listings[0]) : getPropertySpecs(listings[0]))
                        .filter(spec => spec.category === 'features')
                        .map((spec, index) => {
                          const allSpecs = listings.map(l => 
                            (isVehicle ? getVehicleSpecs(l) : getPropertySpecs(l))
                              .filter(s => s.category === 'features')
                          );
                          return (
                            <TableRow key={spec.label}>
                              <TableCell className="font-medium sticky left-0 bg-background align-top">{spec.label}</TableCell>
                              {listings.map((listing, listingIndex) => {
                                const value = allSpecs[listingIndex]?.[index]?.value;
                                if (value && value !== '-') {
                                  const items = String(value).split(', ');
                                  return (
                                    <TableCell key={listing.id} className="align-top">
                                      <div className="flex flex-wrap gap-1">
                                        {items.slice(0, 8).map((item: string, i: number) => (
                                          <Badge key={i} variant="secondary" className="text-xs">
                                            {item}
                                          </Badge>
                                        ))}
                                        {items.length > 8 && (
                                          <Badge variant="outline" className="text-xs">
                                            +{items.length - 8} more
                                          </Badge>
                                        )}
                                      </div>
                                    </TableCell>
                                  );
                                }
                                return (
                                  <TableCell key={listing.id} className="text-muted-foreground">
                                    No features listed
                                  </TableCell>
                                );
                              })}
                            </TableRow>
                          );
                        })}

                      {/* Description */}
                      <TableRow className="bg-muted/30">
                        <TableCell colSpan={listings.length + 1} className="font-semibold text-sm uppercase tracking-wide py-2 sticky left-0">
                          📝 Description
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium sticky left-0 bg-background align-top">Description</TableCell>
                        {listings.map((listing) => (
                          <TableCell key={listing.id} className="align-top">
                            <p className="text-sm text-muted-foreground line-clamp-4">
                              {listing.description || 'No description provided'}
                            </p>
                          </TableCell>
                        ))}
                      </TableRow>

                      {/* Actions */}
                      <TableRow className="bg-muted/30">
                        <TableCell colSpan={listings.length + 1} className="font-semibold text-sm uppercase tracking-wide py-2 sticky left-0">
                          🔗 Quick Actions
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium sticky left-0 bg-background">View Listing</TableCell>
                        {listings.map((listing) => (
                          <TableCell key={listing.id}>
                            <Link href={`/${isVehicle ? 'vehicles' : 'properties'}/${listing.slug}`}>
                              <Button 
                                size="sm" 
                                className={cn(
                                  'gap-2',
                                  isVehicle ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'
                                )}
                              >
                                View Details
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </Link>
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium sticky left-0 bg-background">Contact Seller</TableCell>
                        {listings.map((listing) => (
                          <TableCell key={listing.id}>
                            <div className="flex flex-col gap-1 text-sm">
                              <span className="font-medium">{listing.user?.name || 'Seller'}</span>
                              {listing.user?.phone && (
                                <a href={`tel:${listing.user.phone}`} className="text-blue-600 hover:underline">
                                  {listing.user.phone}
                                </a>
                              )}
                            </div>
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    }>
      <ComparePageContent />
    </Suspense>
  );
}

