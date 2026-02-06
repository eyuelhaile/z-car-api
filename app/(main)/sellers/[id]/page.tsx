'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Star,
  MapPin,
  Phone,
  MessageSquare,
  Shield,
  Calendar,
  Car,
  Home,
  Eye,
  ThumbsUp,
  Loader2,
  AlertCircle,
  ChevronRight,
  BadgeCheck,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { ListingCard } from '@/components/listings/listing-card';
import { useAuthStore } from '@/lib/store';
import { useListings } from '@/hooks/use-listings';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Review } from '@/types';

export default function SellerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: sellerId } = use(params);
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [showPhone, setShowPhone] = useState(false);

  // Fetch seller reviews (includes rating summary and possibly user info)
  const { data: reviewsData, isLoading: isLoadingReviews, error: reviewsError } = useQuery({
    queryKey: ['seller-reviews', sellerId],
    queryFn: async () => {
      const response = await api.getReviews(sellerId);
      return response.data;
    },
    enabled: !!sellerId,
  });

  // Fetch seller listings
  const { data: listingsData, isLoading: isLoadingListings } = useListings({
    userId: sellerId,
    status: 'active',
    limit: 12,
  });

  const sellerListings = listingsData?.data || [];
  const reviews = reviewsData?.reviews || [];
  
  // Handle different API response structures
  const ratingSummary = reviewsData?.summary || { 
    averageRating: 0, 
    totalReviews: 0,
    ratingDistribution: {}
  };

  // Get seller info from API response, listings, or construct from available data
  const sellerInfo = reviewsData?.user || sellerListings[0]?.user || null;

  const handleShowPhone = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in', {
        description: 'You need to be logged in to see contact details',
        action: {
          label: 'Sign in',
          onClick: () => router.push('/auth/login'),
        },
      });
      return;
    }
    setShowPhone(true);
  };

  const handleContactSeller = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in', {
        description: 'You need to be logged in to contact sellers',
        action: {
          label: 'Sign in',
          onClick: () => router.push('/auth/login'),
        },
      });
      return;
    }
    // Navigate to messages with seller context
    router.push(`/dashboard/messages?sellerId=${sellerId}`);
  };

  // Calculate rating distribution from API or compute from reviews
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => {
    // Use API ratingDistribution if available
    const apiCount = ratingSummary.ratingDistribution?.[rating.toString()] || 0;
    const count = apiCount || reviews.filter((r: Review) => r.rating === rating).length;
    const totalReviews = ratingSummary.totalReviews || reviews.length;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { rating, count, percentage };
  });

  // Loading state
  if (isLoadingReviews && isLoadingListings) {
    return (
      <div className="min-h-screen bg-muted/30 pb-20">
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white">
          <div className="container py-12">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Skeleton className="h-24 w-24 rounded-full bg-white/20" />
              <div className="space-y-3">
                <Skeleton className="h-8 w-48 bg-white/20" />
                <Skeleton className="h-4 w-32 bg-white/20" />
                <Skeleton className="h-4 w-24 bg-white/20" />
              </div>
            </div>
          </div>
        </div>
        <div className="container py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-20" />
                  ))}
                </div>
              </Card>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-72 rounded-lg" />
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <Skeleton className="h-64" />
              <Skeleton className="h-48" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (reviewsError && !sellerListings.length) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Card className="max-w-md mx-auto p-8 text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Seller Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The seller profile you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => router.back()}>
              Go Back
            </Button>
            <Link href="/vehicles">
              <Button className="bg-amber-500 hover:bg-amber-600">
                Browse Listings
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const vehicleCount = sellerListings.filter(l => l.type === 'vehicle').length;
  const propertyCount = sellerListings.filter(l => l.type === 'property').length;

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white">
        <div className="container py-12">
          <nav className="flex items-center gap-2 text-sm text-white/80 mb-6">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-white">Seller Profile</span>
          </nav>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="h-24 w-24 border-4 border-white/20">
              <AvatarImage src={sellerInfo?.avatar} />
              <AvatarFallback className="bg-white/20 text-white text-3xl">
                {sellerInfo?.name?.charAt(0) || 'S'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold">{sellerInfo?.name || 'Seller'}</h1>
                {sellerInfo?.isVerified && (
                  <Badge className="bg-white/20 hover:bg-white/30 text-white gap-1">
                    <BadgeCheck className="h-3 w-3" />
                    Verified
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm">
                {ratingSummary.averageRating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-white" />
                    <span className="font-semibold">{ratingSummary.averageRating?.toFixed(1)}</span>
                    <span className="text-white/70">({ratingSummary.totalReviews} reviews)</span>
                  </div>
                )}
                {sellerInfo?.memberSince && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Member since {new Date(sellerInfo.memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <Button 
                variant="secondary" 
                className="flex-1 md:flex-none gap-2"
                onClick={handleContactSeller}
              >
                <MessageSquare className="h-4 w-4" />
                Contact
              </Button>
              {!showPhone ? (
                <Button 
                  variant="outline" 
                  className="flex-1 md:flex-none gap-2 bg-transparent text-white border-white/30 hover:bg-white/10 hover:text-white"
                  onClick={handleShowPhone}
                >
                  <Phone className="h-4 w-4" />
                  Show Phone
                </Button>
              ) : sellerInfo?.phone ? (
                <Button 
                  variant="outline" 
                  className="flex-1 md:flex-none gap-2 bg-transparent text-white border-white/30 hover:bg-white/10 hover:text-white font-mono"
                  asChild
                >
                  <a href={`tel:${sellerInfo.phone}`}>
                    <Phone className="h-4 w-4" />
                    {sellerInfo.phone}
                  </a>
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  className="flex-1 md:flex-none gap-2 bg-transparent text-white/50 border-white/20"
                  disabled
                >
                  <Phone className="h-4 w-4" />
                  No phone
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-amber-600">{sellerListings.length}</p>
                    <p className="text-sm text-muted-foreground">Active Listings</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                      <p className="text-2xl font-bold">{ratingSummary.averageRating?.toFixed(1) || 'N/A'}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">Rating</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold">{ratingSummary.totalReviews || 0}</p>
                    <p className="text-sm text-muted-foreground">Reviews</p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold text-emerald-600">
                      {sellerInfo?.isVerified ? '✓' : '−'}
                    </p>
                    <p className="text-sm text-muted-foreground">Verified</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs for Listings and Reviews */}
            <Tabs defaultValue="listings" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="listings" className="gap-2">
                  <Car className="h-4 w-4" />
                  Listings ({sellerListings.length})
                </TabsTrigger>
                <TabsTrigger value="reviews" className="gap-2">
                  <Star className="h-4 w-4" />
                  Reviews ({ratingSummary.totalReviews || 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="listings" className="mt-6">
                {isLoadingListings ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-72 rounded-lg" />
                    ))}
                  </div>
                ) : sellerListings.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {sellerListings.map((listing) => (
                      <ListingCard key={listing.id} listing={listing} />
                    ))}
                  </div>
                ) : (
                  <Card className="p-12 text-center">
                    <User className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Active Listings</h3>
                    <p className="text-muted-foreground">This seller doesn&apos;t have any active listings at the moment.</p>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review: Review) => (
                      <Card key={review.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={review.reviewer?.avatar} />
                              <AvatarFallback>
                                {review.reviewer?.name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-semibold">{review.reviewer?.name || 'Anonymous'}</p>
                                <span className="text-xs text-muted-foreground">
                                  {review.createdAt && formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 mb-2">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'fill-muted text-muted'
                                    }`}
                                  />
                                ))}
                              </div>
                              {review.title && (
                                <p className="font-medium mb-1">{review.title}</p>
                              )}
                              <p className="text-sm text-muted-foreground">{review.content || review.comment}</p>
                              
                              {review.response && (
                                <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                                  <p className="text-xs font-medium text-amber-600 mb-1">Seller Response</p>
                                  <p className="text-sm">
                                    {typeof review.response === 'string' 
                                      ? review.response 
                                      : review.response.content}
                                  </p>
                                </div>
                              )}

                              {review.listing && (
                                <Link 
                                  href={`/${review.listing.type === 'vehicle' ? 'vehicles' : 'properties'}/${review.listing.slug || review.listing.id}`}
                                  className="inline-flex items-center gap-2 mt-3 text-xs text-amber-600 hover:underline"
                                >
                                  Regarding: {review.listing.title}
                                </Link>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-12 text-center">
                    <Star className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
                    <p className="text-muted-foreground">This seller hasn&apos;t received any reviews yet.</p>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Rating Breakdown */}
            {ratingSummary.totalReviews > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Rating Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {ratingDistribution.map(({ rating, count, percentage }) => (
                    <div key={rating} className="flex items-center gap-3">
                      <span className="text-sm font-medium w-12">{rating} star</span>
                      <Progress value={percentage} className="flex-1 h-2" />
                      <span className="text-sm text-muted-foreground w-8">{count}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Listing Categories */}
            {sellerListings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Listing Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {vehicleCount > 0 && (
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-amber-100">
                          <Car className="h-5 w-5 text-amber-600" />
                        </div>
                        <span className="font-medium">Vehicles</span>
                      </div>
                      <Badge variant="secondary">{vehicleCount}</Badge>
                    </div>
                  )}
                  {propertyCount > 0 && (
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-100">
                          <Home className="h-5 w-5 text-emerald-600" />
                        </div>
                        <span className="font-medium">Properties</span>
                      </div>
                      <Badge variant="secondary">{propertyCount}</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Safety Tips */}
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-4">
                <h4 className="font-semibold flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-amber-600" />
                  Safety Tips
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Always meet in a public place</li>
                  <li>• Verify documents before payment</li>
                  <li>• Never pay upfront without inspection</li>
                  <li>• Use secure payment methods</li>
                  <li>• Check reviews and ratings</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

