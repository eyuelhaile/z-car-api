'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Heart, MapPin, Calendar, Fuel, Settings2, Bed, Bath, Maximize, Star, Eye, Clock, Loader2, UserCircle, Briefcase, Building2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Listing, UserRole } from '@/types';
import { cn, getImageUrl } from '@/lib/utils';
import { useFavoritesStore, useAuthStore } from '@/lib/store';
import { useToggleFavorite } from '@/hooks/use-listings';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

// Seller role badge configuration
const sellerRoleBadges: Record<string, { label: string; icon: typeof UserCircle; className: string }> = {
  private: {
    label: 'Private',
    icon: UserCircle,
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  broker: {
    label: 'Broker',
    icon: Briefcase,
    className: 'bg-purple-100 text-purple-700 border-purple-200',
  },
  dealership: {
    label: 'Dealership',
    icon: Building2,
    className: 'bg-amber-100 text-amber-700 border-amber-200',
  },
};

interface ListingCardProps {
  listing: Listing;
  variant?: 'default' | 'horizontal' | 'compact';
  showActions?: boolean;
}

// Helper to handle API response format (vehicleAttribute) vs internal format (vehicleAttributes)
function getVehicleAttributes(listing: Listing) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return listing.vehicleAttributes || (listing as any).vehicleAttribute;
}

function getPropertyAttributes(listing: Listing) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return listing.propertyAttributes || (listing as any).propertyAttribute;
}

export function ListingCard({ listing, variant = 'default', showActions = true }: ListingCardProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  const toggleFavoriteMutation = useToggleFavorite();
  const isLiked = isFavorite(listing.id);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      toast.error('Please sign in', {
        description: 'You need to be logged in to save favorites',
        action: {
          label: 'Sign in',
          onClick: () => router.push('/auth/login'),
        },
      });
      return;
    }

    // Optimistic update
    if (isLiked) {
      removeFavorite(listing.id);
    } else {
      addFavorite(listing.id);
    }

    // Call API
    try {
      await toggleFavoriteMutation.mutateAsync({ 
        listingId: listing.id, 
        isFavorited: isLiked 
      });
      
      if (!isLiked) {
        toast.success('Added to favorites');
      } else {
        toast.success('Removed from favorites');
      }
    } catch {
      // Revert optimistic update on error
      if (isLiked) {
        addFavorite(listing.id);
      } else {
        removeFavorite(listing.id);
      }
      toast.error('Failed to update favorites');
    }
  };

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      maximumFractionDigits: 0,
    }).format(numPrice);
  };

  const getListingUrl = () => {
    return listing.type === 'vehicle' 
      ? `/vehicles/${listing.slug || listing.id}`
      : `/properties/${listing.slug || listing.id}`;
  };

  const mainImage = getImageUrl(listing.images?.[0]?.url || listing.images?.[0]?.thumbnail);
  const vehicleAttrs = getVehicleAttributes(listing);
  const propertyAttrs = getPropertyAttributes(listing);

  if (variant === 'horizontal') {
    return (
      <Link href={getListingUrl()}>
        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
          <div className="flex flex-col sm:flex-row">
            <div className="relative w-full sm:w-72 h-48 sm:h-auto">
              <Image
                src={mainImage}
                alt={listing.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {listing.isFeatured && (
                <Badge className="absolute top-3 left-3 bg-amber-500 hover:bg-amber-600">
                  Featured
                </Badge>
              )}
              {showActions && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-3 right-3 bg-white/90 hover:bg-white shadow-sm"
                  onClick={toggleFavorite}
                  disabled={toggleFavoriteMutation.isPending}
                >
                  {toggleFavoriteMutation.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
                  ) : (
                    <Heart className={cn('h-5 w-5', isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600')} />
                  )}
                </Button>
              )}
            </div>
            <CardContent className="flex-1 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-amber-600 transition-colors">
                    {listing.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-4 w-4" />
                    <span>{listing.city}</span>
                    {listing.location && <span>• {listing.location}</span>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-amber-600">{formatPrice(listing.price)}</p>
                  {listing.isNegotiable && (
                    <span className="text-xs text-muted-foreground">Negotiable</span>
                  )}
                </div>
              </div>

              {listing.type === 'vehicle' && vehicleAttrs && (
                <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <span>{vehicleAttrs.year}</span>
                  </div>
                  {vehicleAttrs.fuelType && (
                    <div className="flex items-center gap-1.5">
                      <Fuel className="h-4 w-4" />
                      <span className="capitalize">{vehicleAttrs.fuelType}</span>
                    </div>
                  )}
                  {vehicleAttrs.transmission && (
                    <div className="flex items-center gap-1.5">
                      <Settings2 className="h-4 w-4" />
                      <span className="capitalize">{vehicleAttrs.transmission}</span>
                    </div>
                  )}
                  {vehicleAttrs.mileage && (
                    <div className="flex items-center gap-1.5">
                      <span>{vehicleAttrs.mileage.toLocaleString()} km</span>
                    </div>
                  )}
                </div>
              )}

              {listing.type === 'property' && propertyAttrs && (
                <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                  {propertyAttrs.bedrooms && (
                    <div className="flex items-center gap-1.5">
                      <Bed className="h-4 w-4" />
                      <span>{propertyAttrs.bedrooms} Beds</span>
                    </div>
                  )}
                  {propertyAttrs.bathrooms && (
                    <div className="flex items-center gap-1.5">
                      <Bath className="h-4 w-4" />
                      <span>{propertyAttrs.bathrooms} Baths</span>
                    </div>
                  )}
                  {propertyAttrs.area && (
                    <div className="flex items-center gap-1.5">
                      <Maximize className="h-4 w-4" />
                      <span>{propertyAttrs.area} m²</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{listing.viewsCount || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
                {listing.user?.isVerified && (
                  <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    Verified
                  </Badge>
                )}
              </div>
            </CardContent>
          </div>
        </Card>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link href={getListingUrl()}>
        <Card className="overflow-hidden hover:shadow-md transition-all duration-300 group">
          <div className="flex gap-3 p-3">
            <div className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0">
              <Image
                src={mainImage}
                alt={listing.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm line-clamp-2 group-hover:text-amber-600">
                {listing.title}
              </h4>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {listing.city}
              </p>
              <p className="font-semibold text-amber-600 mt-2">
                {formatPrice(listing.price)}
              </p>
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  // Default card variant
  return (
    <Link href={getListingUrl()}>
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group h-full">
        <div className="relative aspect-[4/3]">
          <Image
            src={mainImage}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {listing.isFeatured && (
              <Badge className="bg-amber-500 hover:bg-amber-600 shadow-lg">
                Featured
              </Badge>
            )}
            {listing.status === 'sold' && (
              <Badge className="bg-red-500 hover:bg-red-600 shadow-lg">
                Sold
              </Badge>
            )}
            {/* Seller Role Badge */}
            {listing.user?.role && sellerRoleBadges[listing.user.role] && (
              <Badge variant="outline" className={cn('shadow-sm bg-white/90 backdrop-blur-sm', sellerRoleBadges[listing.user.role].className)}>
                {(() => {
                  const Icon = sellerRoleBadges[listing.user.role].icon;
                  return <Icon className="h-3 w-3 mr-1" />;
                })()}
                {sellerRoleBadges[listing.user.role].label}
              </Badge>
            )}
          </div>

          {/* Favorite Button */}
          {showActions && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm"
              onClick={toggleFavorite}
              disabled={toggleFavoriteMutation.isPending}
            >
              {toggleFavoriteMutation.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
              ) : (
                <Heart className={cn('h-5 w-5 transition-colors', isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600')} />
              )}
            </Button>
          )}

          {/* Price Tag */}
          <div className="absolute bottom-3 left-3">
            <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-lg">
              <p className="font-bold text-lg text-amber-600">{formatPrice(listing.price)}</p>
              {listing.isNegotiable && (
                <p className="text-[10px] text-muted-foreground -mt-0.5">Negotiable</p>
              )}
            </div>
          </div>

          {/* Image Count */}
          {listing.images && listing.images.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md">
              1/{listing.images.length}
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold line-clamp-2 group-hover:text-amber-600 transition-colors min-h-[2.5rem]">
            {listing.title}
          </h3>
          
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-2">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">{listing.city}{listing.location ? `, ${listing.location}` : ''}</span>
          </div>

          {/* Attributes */}
          {listing.type === 'vehicle' && vehicleAttrs && (
            <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
              {vehicleAttrs.year && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {vehicleAttrs.year}
                </span>
              )}
              {vehicleAttrs.fuelType && (
                <span className="flex items-center gap-1 capitalize">
                  <Fuel className="h-3.5 w-3.5" />
                  {vehicleAttrs.fuelType}
                </span>
              )}
              {vehicleAttrs.transmission && (
                <span className="flex items-center gap-1 capitalize">
                  <Settings2 className="h-3.5 w-3.5" />
                  {vehicleAttrs.transmission}
                </span>
              )}
            </div>
          )}

          {listing.type === 'property' && propertyAttrs && (
            <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
              {propertyAttrs.bedrooms && (
                <span className="flex items-center gap-1">
                  <Bed className="h-3.5 w-3.5" />
                  {propertyAttrs.bedrooms}
                </span>
              )}
              {propertyAttrs.bathrooms && (
                <span className="flex items-center gap-1">
                  <Bath className="h-3.5 w-3.5" />
                  {propertyAttrs.bathrooms}
                </span>
              )}
              {propertyAttrs.area && (
                <span className="flex items-center gap-1">
                  <Maximize className="h-3.5 w-3.5" />
                  {propertyAttrs.area}m²
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-xs font-medium">
                {listing.user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                {listing.user?.name || 'Unknown'}
              </span>
              {listing.user?.isVerified && (
                <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                  ✓
                </Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
