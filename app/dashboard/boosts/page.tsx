'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Rocket,
  Zap,
  Clock,
  Eye,
  TrendingUp,
  Loader2,
  Check,
  ImageIcon,
  Star,
  Gift,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { 
  useBoostOptions, 
  useMyBoosts, 
  useWallet, 
  useSoretiPaymentServices, 
  createSoretiOrder,
  useBoostSubscriptionCredits,
  useBoostPricing,
  useCalculateBoostPrice,
  useBoostListing
} from '@/hooks/use-dashboard';
import { useMyListings } from '@/hooks/use-listings';
import { useAuth } from '@/hooks/use-auth';
import { format, isAfter, formatDistanceToNow } from 'date-fns';

export default function BoostsPage() {
  const [activeTab, setActiveTab] = useState('active');
  const [selectedListing, setSelectedListing] = useState<string>('');
  const [selectedBoostType, setSelectedBoostType] = useState<string>('');
  const [durationDays, setDurationDays] = useState<number>(7);
  const [isBoostDialogOpen, setIsBoostDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);
  const [isClient, setIsClient] = useState(false);

  const { data: boostOptions, isLoading: isLoadingOptions } = useBoostOptions();
  const { data: boostPricing, isLoading: isLoadingPricing } = useBoostPricing();
  const { data: subscriptionCredits, isLoading: isLoadingCredits } = useBoostSubscriptionCredits();
  const { data: myBoosts, isLoading: isLoadingBoosts } = useMyBoosts();
  const { data: wallet } = useWallet();
  const { data: listingsData, isLoading: isLoadingListings } = useMyListings('active');
  const { data: paymentServices, isLoading: isLoadingPaymentServices } = useSoretiPaymentServices();
  const { user } = useAuth();
  const calculatePriceMutation = useCalculateBoostPrice();
  const boostListingMutation = useBoostListing();

  const listings = listingsData?.data || [];
  const isLoading = isLoadingOptions || isLoadingBoosts || isLoadingCredits || isLoadingPricing;
  
  // Check if user can use subscription credit (only for featured type)
  const canUseSubscriptionCredit = subscriptionCredits?.canUseSubscriptionCredit && selectedBoostType === 'featured';

  // Avoid hydration mismatch for time-based formatting (formatDistanceToNow)
  useEffect(() => {
    setIsClient(true);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const activeBoosts = (myBoosts || []).filter((boost) =>
    isAfter(new Date(boost.expiresAt), new Date())
  );
  const expiredBoosts = (myBoosts || []).filter(
    (boost) => !isAfter(new Date(boost.expiresAt), new Date())
  );

  // Calculate price when boost type or duration changes
  const handleBoostTypeOrDurationChange = async () => {
    if (!selectedBoostType || !durationDays) return;
    
    try {
      const result = await calculatePriceMutation.mutateAsync({
        type: selectedBoostType,
        durationDays,
      });
      setCalculatedPrice(result?.price || null);
    } catch (error) {
      setCalculatedPrice(null);
    }
  };

  const handleBoost = async () => {
    if (!selectedListing || !selectedBoostType) return;
    if (!user || !user.id) return;

    // If using subscription credit, no payment method needed
    if (!canUseSubscriptionCredit && !paymentMethod) return;

    // For telebirr/mpesa, need phone number
    if ((paymentMethod === 'telebirr' || paymentMethod === 'mpesa') && !user.phone) return;

    setIsProcessingPayment(true);

    try {
      // Use subscription credit if available
      if (canUseSubscriptionCredit) {
        const result = await boostListingMutation.mutateAsync({
          listingId: selectedListing,
          type: selectedBoostType as 'featured' | 'top_search' | 'homepage' | 'category_top' | 'urgent' | 'highlight',
          durationDays,
          paymentMethod: 'subscription',
          autoRenew: false,
        });

        if (result) {
          setIsBoostDialogOpen(false);
          setSelectedListing('');
          setSelectedBoostType('');
          setPaymentMethod('');
          setCalculatedPrice(null);
        }
      } else if (paymentMethod === 'wallet') {
        // Pay from wallet
        const result = await boostListingMutation.mutateAsync({
          listingId: selectedListing,
          type: selectedBoostType as 'featured' | 'top_search' | 'homepage' | 'category_top' | 'urgent' | 'highlight',
          durationDays,
          paymentMethod: 'wallet',
          autoRenew: false,
        });

        if (result) {
          setIsBoostDialogOpen(false);
          setSelectedListing('');
          setSelectedBoostType('');
          setPaymentMethod('');
          setCalculatedPrice(null);
        }
      } else if (paymentMethod === 'telebirr' || paymentMethod === 'mpesa') {
        // Pay via external payment gateway
        const rawPhone = user.phone || '';
        const phoneNumber = rawPhone.startsWith('+') ? rawPhone.slice(1) : rawPhone;
        const price = calculatedPrice || 0;

        const url = await createSoretiOrder({
          title: `Boost - ${selectedBoostType}`,
          amount: price,
          userId: user.id,
          phoneNumber,
          paymentServiceId: paymentMethod,
        });

        if (url) {
          window.location.href = url;
        }
      }
    } catch (error) {
      // Handle error - you can add toast here
      console.error('Failed to create boost', error);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const selectedOption = boostOptions?.find((o) => o.id === selectedBoostType);

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-10 w-48" />
        <Card>
          <CardContent className="p-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-4 border-b last:border-0">
                <Skeleton className="h-16 w-24 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
            <Rocket className="h-8 w-8" />
            Boosts
          </h1>
          <p className="text-muted-foreground mt-1">
            Promote your listings for more visibility
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="text-muted-foreground">Wallet Balance: </span>
            <span className="font-semibold text-amber-600">
              {formatPrice(wallet?.balance || 0)}
            </span>
          </div>
          <Dialog open={isBoostDialogOpen} onOpenChange={setIsBoostDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-amber-500 hover:bg-amber-600 gap-2">
                <Zap className="h-4 w-4" />
                Boost a Listing
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Boost Your Listing</DialogTitle>
                <DialogDescription>
                  Select a listing and boost option to promote your ad
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                {/* Select Listing */}
                <div className="space-y-2">
                  <Label>Select Listing</Label>
                  <Select value={selectedListing} onValueChange={setSelectedListing}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a listing to boost" />
                    </SelectTrigger>
                    <SelectContent>
                      {listings.map((listing) => (
                        <SelectItem key={listing.id} value={listing.id}>
                          {listing.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {listings.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      You don&apos;t have any active listings to boost.{' '}
                      <Link href="/dashboard/listings/create" className="text-amber-600 hover:underline">
                        Create one now
                      </Link>
                    </p>
                  )}
                </div>

                {/* Select Boost Type */}
                <div className="space-y-2">
                  <Label>Select Boost Type</Label>
                  <Select value={selectedBoostType} onValueChange={(value) => {
                    setSelectedBoostType(value);
                    setPaymentMethod(''); // Reset payment method when type changes
                    setCalculatedPrice(null);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose boost type" />
                    </SelectTrigger>
                    <SelectContent>
                      {(boostPricing || []).map((pricing) => (
                        <SelectItem key={pricing.type} value={pricing.type}>
                          {pricing.name} - {pricing.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Duration Selector */}
                {selectedBoostType && (
                  <div className="space-y-2">
                    <Label>Duration (Days)</Label>
                    <Select 
                      value={String(durationDays)} 
                      onValueChange={(value) => {
                        setDurationDays(Number(value));
                        setCalculatedPrice(null);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 3, 7, 14, 30].map((days) => (
                          <SelectItem key={days} value={String(days)}>
                            {days} day{days !== 1 ? 's' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedBoostType && durationDays && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleBoostTypeOrDurationChange}
                        disabled={calculatePriceMutation.isPending}
                      >
                        {calculatePriceMutation.isPending ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            Calculating...
                          </>
                        ) : (
                          'Calculate Price'
                        )}
                      </Button>
                    )}
                    {calculatedPrice !== null && (
                      <p className="text-sm font-semibold text-amber-600">
                        Price: {formatPrice(calculatedPrice)}
                      </p>
                    )}
                  </div>
                )}

                {/* Subscription Credits Info */}
                {subscriptionCredits && selectedBoostType === 'featured' && (
                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-blue-900">Subscription Credits</p>
                        <p className="text-sm text-blue-700">
                          {subscriptionCredits.remainingCredits} of {subscriptionCredits.totalCredits} remaining
                        </p>
                      </div>
                      {canUseSubscriptionCredit && (
                        <Badge className="bg-green-500">FREE</Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Payment Method Selection - Only show if no subscription credits */}
                {!canUseSubscriptionCredit && (
                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingPaymentServices ? 'Loading...' : 'Select payment method'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wallet">Wallet Balance</SelectItem>
                        {(paymentServices || []).map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name || service.vendor_type || 'Payment Option'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                {selectedBoostType && (
                  <div className="flex-1 text-sm text-muted-foreground">
                    {canUseSubscriptionCredit ? (
                      <span className="font-semibold text-green-600">FREE (Subscription Credit)</span>
                    ) : calculatedPrice !== null ? (
                      <>
                        Total: <span className="font-semibold text-foreground">{formatPrice(calculatedPrice)}</span>
                      </>
                    ) : (
                      <span>Select duration and calculate price</span>
                    )}
                  </div>
                )}
                <Button variant="outline" onClick={() => {
                  setIsBoostDialogOpen(false);
                  setSelectedListing('');
                  setSelectedBoostType('');
                  setPaymentMethod('');
                  setCalculatedPrice(null);
                  setDurationDays(7);
                }}>
                  Cancel
                </Button>
                <Button
                  onClick={handleBoost}
                  disabled={
                    isProcessingPayment ||
                    boostListingMutation.isPending ||
                    !selectedListing ||
                    !selectedBoostType ||
                    (!canUseSubscriptionCredit && !paymentMethod) ||
                    (calculatedPrice === null && !canUseSubscriptionCredit)
                  }
                  className="bg-amber-500 hover:bg-amber-600"
                >
                  {(isProcessingPayment || boostListingMutation.isPending) ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : canUseSubscriptionCredit ? (
                    <>
                      <Star className="h-4 w-4 mr-2" />
                      Use FREE Credit
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Boost Now
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Boost Options Preview */}
      <div className="grid md:grid-cols-3 gap-6">
        {(boostPricing || []).slice(0, 3).map((pricing, index) => {
          // Calculate price for 7 days as example
          const examplePrice = (pricing.pricePerDay || 0) * 7;
          return (
            <Card
              key={pricing.type}
              className={cn(
                'relative overflow-hidden',
                index === 1 && 'border-amber-500 shadow-lg'
              )}
            >
              {index === 1 && (
                <div className="absolute top-0 right-0 bg-amber-500 text-white px-3 py-1 text-xs font-medium rounded-bl-lg">
                  Popular
                </div>
              )}
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-amber-100">
                    {index === 0 ? (
                      <Zap className="h-5 w-5 text-amber-600" />
                    ) : index === 1 ? (
                      <Star className="h-5 w-5 text-amber-600" />
                    ) : (
                      <Rocket className="h-5 w-5 text-amber-600" />
                    )}
                  </div>
                  <CardTitle className="text-lg">{pricing.name}</CardTitle>
                </div>
                <CardDescription>{pricing.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-600 mb-2">
                  {formatPrice(pricing.pricePerDay || 0)}/day
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Example: {formatPrice(examplePrice)} for 7 days
                </p>
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">
                    Duration: {(pricing.minDays || 1)}-{(pricing.maxDays || 30)} days
                  </p>
                  {pricing.type === 'featured' && subscriptionCredits?.canUseSubscriptionCredit && (
                    <p className="text-green-600 font-semibold">
                      {subscriptionCredits.remainingCredits} FREE credits available
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={index === 1 ? 'default' : 'outline'}
                  onClick={() => {
                    setSelectedBoostType(pricing.type);
                    setDurationDays(7);
                    setIsBoostDialogOpen(true);
                  }}
                >
                  Select
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* My Boosts */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active" className="gap-2">
            Active Boosts
            <Badge variant="secondary">{activeBoosts.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="expired" className="gap-2">
            Expired
            <Badge variant="secondary">{expiredBoosts.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === 'active' ? 'Active Boosts' : 'Expired Boosts'}
              </CardTitle>
              <CardDescription>
                {activeTab === 'active'
                  ? 'Your currently boosted listings'
                  : 'Previously boosted listings'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(activeTab === 'active' ? activeBoosts : expiredBoosts).length > 0 ? (
                <div className="divide-y">
                  {(activeTab === 'active' ? activeBoosts : expiredBoosts).map((boost) => (
                    <div key={boost.id} className="flex items-center gap-4 py-4">
                      <div className="w-24 h-16 rounded-lg overflow-hidden bg-muted relative shrink-0">
                        {boost.listing?.thumbnail ? (
                          <Image
                            src={boost.listing.thumbnail}
                            alt={boost.listing.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <ImageIcon className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/listings/${boost.listing?.id}`}
                          className="font-medium hover:text-amber-600 transition-colors line-clamp-1"
                        >
                          {boost.listing?.title}
                        </Link>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            {boost.type}
                          </span>
                          {isClient && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {activeTab === 'active'
                                ? `Expires ${formatDistanceToNow(new Date(boost.expiresAt), { addSuffix: true })}`
                                : `Expired ${formatDistanceToNow(new Date(boost.expiresAt), { addSuffix: true })}`}
                            </span>
                          )}
                        </div>
                      </div>
                      {activeTab === 'active' ? (
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedListing(boost.listing?.id || '');
                            setIsBoostDialogOpen(true);
                          }}
                        >
                          Boost Again
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <Rocket className="h-16 w-16 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {activeTab === 'active' ? 'No active boosts' : 'No expired boosts'}
                  </h3>
                  <p className="text-muted-foreground text-center max-w-sm">
                    {activeTab === 'active'
                      ? 'Boost your listings to get more visibility and reach more buyers.'
                      : "You haven't had any boosts expire yet."}
                  </p>
                  {activeTab === 'active' && (
                    <Button
                      className="mt-4"
                      onClick={() => setIsBoostDialogOpen(true)}
                    >
                      Boost a Listing
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

