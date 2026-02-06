'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import {
  Heart,
  Share2,
  MapPin,
  Calendar,
  Fuel,
  Settings2,
  Gauge,
  Palette,
  Car,
  Phone,
  MessageSquare,
  Shield,
  Star,
  ChevronLeft,
  ChevronRight,
  Flag,
  Scale,
  Eye,
  Clock,
  CheckCircle2,
  Loader2,
  PhoneCall,
  Copy,
  Check,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ListingCard } from '@/components/listings/listing-card';
import { useFavoritesStore, useAuthStore } from '@/lib/store';
import { useToggleFavorite, useListingBySlug, useListings } from '@/hooks/use-listings';
import { useAddToComparisonCart, useComparisonCart } from '@/hooks/use-dashboard';
import { cn, getImageUrl } from '@/lib/utils';
import { getApiErrorMessage } from '@/lib/error-utils';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useBookAppointment, useRefreshBadgeCounts } from '@/hooks/use-dashboard';

export default function VehicleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [isAppointmentOpen, setIsAppointmentOpen] = useState(false);
  const [preferredAt, setPreferredAt] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [appointmentLocation, setAppointmentLocation] = useState('');
  const [appointmentMessage, setAppointmentMessage] = useState('');
  const [appointmentPhone, setAppointmentPhone] = useState('');
  const [isSubmittingAppointment, setIsSubmittingAppointment] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [phoneCopied, setPhoneCopied] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  
  const { isAuthenticated } = useAuthStore();
  const { user } = useAuthStore();
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  const toggleFavoriteMutation = useToggleFavorite();
  const bookAppointmentMutation = useBookAppointment();
  const refreshBadgeCounts = useRefreshBadgeCounts();
  
  // Comparison cart
  const addToComparisonCartMutation = useAddToComparisonCart();
  const { data: comparisonCart } = useComparisonCart('vehicle', isAuthenticated);

  // Fetch vehicle data from API
  const { data: vehicleData, isLoading, error } = useListingBySlug(slug);
  
  // Fetch similar vehicles
  const { data: similarListingsData } = useListings({
    type: 'vehicle',
    limit: 4,
  });
  
  // Filter out current vehicle from similar listings
  const similarVehicles = similarListingsData?.data?.filter(v => v.slug !== slug)?.slice(0, 4) || [];

  const isLiked = vehicleData ? isFavorite(vehicleData.id) : false;
  const isInCart = vehicleData && comparisonCart?.listingIds?.includes(vehicleData.id);
  const canCompare = comparisonCart?.canCompare || false;
  const compareCount = comparisonCart?.listingIds?.length || 0;

  const toggleFavorite = async () => {
    if (!vehicleData) return;
    
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
      removeFavorite(vehicleData.id);
    } else {
      addFavorite(vehicleData.id);
    }

    // Call API
    try {
      await toggleFavoriteMutation.mutateAsync({ 
        listingId: vehicleData.id, 
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
        addFavorite(vehicleData.id);
      } else {
        removeFavorite(vehicleData.id);
      }
      toast.error('Failed to update favorites');
    }
  };

  const handleContactSeller = () => {
    if (!vehicleData) return;
    
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
    const attrs = vehicleData.vehicleAttributes || vehicleData.vehicleAttribute;
    setMessageText(`Hi, I'm interested in your ${attrs?.year} ${attrs?.make} ${attrs?.model}. Is it still available?`);
    setIsContactDialogOpen(true);
  };

  const canRequestAppointment = () => {
    if (!vehicleData) return false;
    if (!isAuthenticated) return false;
    if (user?.id === vehicleData.user?.id) return false;
    if (vehicleData.status !== 'active') return false;
    return true;
  };

  const openAppointmentModal = () => {
    if (!canRequestAppointment()) {
      toast.error('You cannot request an appointment for this listing');
      return;
    }
    setPreferredAt('');
    setDurationMinutes(30);
    const addr = (vehicleData as any)?.address || `${vehicleData?.city}, ${vehicleData?.location}` || '';
    setAppointmentLocation(addr);
    setAppointmentMessage('');
    setAppointmentPhone(user?.phone || '');
    setIsAppointmentOpen(true);
  };

  const handleRequestAppointment = async () => {
    if (!vehicleData) return;
    if (!preferredAt) {
      toast.error('Please select preferred date and time');
      return;
    }
    setIsSubmittingAppointment(true);
    try {
      const iso = new Date(preferredAt).toISOString();
      const res = await bookAppointmentMutation.mutateAsync({
        listingId: vehicleData.id,
        scheduledAt: iso,
        durationMinutes,
        location: appointmentLocation,
        notes: appointmentMessage,
      });

      if (res) {
        toast.success('Appointment requested');
        setIsAppointmentOpen(false);
        refreshBadgeCounts();
      }
    } catch (err) {
      toast.error('Failed to request appointment', {
        description: getApiErrorMessage(err, 'Please try again.'),
      });
    } finally {
      setIsSubmittingAppointment(false);
    }
  };

  const handleSendMessage = async () => {
    if (!vehicleData) return;
    
    if (!messageText.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (!isAuthenticated) {
      toast.error('Please sign in', {
        description: 'You need to be logged in to send messages',
        action: {
          label: 'Sign in',
          onClick: () => router.push('/auth/login'),
        },
      });
      return;
    }

    setIsSendingMessage(true);
    try {
      const sellerId = vehicleData.user?.id;
      if (!sellerId) {
        toast.error('Cannot contact seller', {
          description: 'Seller information not available',
        });
        return;
      }
      
      const response = await api.startConversation(vehicleData.id, sellerId, messageText.trim());
      if (response.success) {
        toast.success('Message sent!', {
          description: 'The seller will be notified',
        });
        setIsContactDialogOpen(false);
        setMessageText('');
        // Optionally redirect to the conversation
        router.push(`/dashboard/messages?conversation=${response.data.conversationId}`);
      }
    } catch (error) {
      toast.error('Failed to send message', {
        description: 'Please try again later',
      });
    } finally {
      setIsSendingMessage(false);
    }
  };

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

  const handleCopyPhone = () => {
    if (vehicleData?.user?.phone) {
      navigator.clipboard.writeText(vehicleData.user.phone);
      setPhoneCopied(true);
      toast.success('Phone number copied!');
      setTimeout(() => setPhoneCopied(false), 2000);
    }
  };

  const handleCallPhone = () => {
    if (vehicleData?.user?.phone) {
      window.location.href = `tel:${vehicleData.user.phone}`;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const nextImage = () => {
    if (!vehicleData?.images?.length) return;
    setCurrentImageIndex((prev) => (prev + 1) % vehicleData.images.length);
  };

  const prevImage = () => {
    if (!vehicleData?.images?.length) return;
    setCurrentImageIndex((prev) => (prev - 1 + vehicleData.images.length) % vehicleData.images.length);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 pb-20">
        <div className="bg-background border-b">
          <div className="container py-4">
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="container py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="overflow-hidden">
                <Skeleton className="aspect-[16/10] w-full" />
                <div className="p-4 flex gap-2">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="w-20 h-16 rounded-lg" />
                  ))}
                </div>
              </Card>
              <Card className="p-6">
                <Skeleton className="h-8 w-3/4 mb-4" />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-12 w-12 rounded-lg" />
                      <div>
                        <Skeleton className="h-3 w-16 mb-2" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
            <div className="space-y-6">
              <Card className="p-6">
                <Skeleton className="h-6 w-full mb-4" />
                <Skeleton className="h-10 w-32 mb-4" />
                <Skeleton className="h-10 w-full mb-2" />
                <Skeleton className="h-10 w-full" />
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !vehicleData) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Card className="max-w-md mx-auto p-8 text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Vehicle Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The vehicle you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => router.back()}>
              Go Back
            </Button>
            <Link href="/vehicles">
              <Button className="bg-amber-500 hover:bg-amber-600">
                Browse Vehicles
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // Get vehicle attributes (handle both singular and plural naming from API)
  const vehicleAttrs = vehicleData.vehicleAttributes || vehicleData.vehicleAttribute;
  const images = vehicleData.images || [];

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      {/* Breadcrumb */}
      <div className="bg-background border-b">
        <div className="container py-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <Link href="/vehicles" className="hover:text-foreground">Vehicles</Link>
            <span>/</span>
            <span className="text-foreground truncate max-w-[200px]">{vehicleData.title}</span>
          </nav>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card className="overflow-hidden">
              <div className="relative aspect-[16/10] bg-muted">
                {images.length > 0 ? (
                  <Image
                    src={getImageUrl(images[currentImageIndex]?.url)}
                    alt={vehicleData.title}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <Car className="h-24 w-24 text-muted-foreground/50" />
                  </div>
                )}

                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                {images.length > 0 && (
                  <div className="absolute bottom-4 right-4 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                )}

                {/* Featured Badge */}
                {vehicleData.isFeatured && (
                  <Badge className="absolute top-4 left-4 bg-amber-500 hover:bg-amber-600">
                    Featured
                  </Badge>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={cn(
                        'relative w-20 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-colors',
                        currentImageIndex === index ? 'border-amber-500' : 'border-transparent'
                      )}
                    >
                      <Image
                        src={getImageUrl(image.url || image.thumbnail)}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </Card>

            {/* Title & Actions (Mobile) */}
            <div className="lg:hidden">
              <h1 className="text-2xl font-bold mb-2">{vehicleData.title}</h1>
              <div className="flex items-center gap-4 text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {vehicleData.city}, {vehicleData.location}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {vehicleData.viewsCount} views
                </span>
              </div>
              <div className="text-3xl font-bold text-amber-600 mb-4">
                {formatPrice(vehicleData.price)}
                {vehicleData.isNegotiable && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">Negotiable</span>
                )}
              </div>
            <div className="mb-4">
              <Button
                className="w-full gap-2"
                variant="outline"
                onClick={(e) => {
                  if (!isAuthenticated) {
                    e.preventDefault();
                    toast.error('Please sign in to request an appointment', {
                      action: { label: 'Sign in', onClick: () => router.push('/auth/login') },
                    });
                    return;
                  }
                  openAppointmentModal();
                }}
              >
                <Calendar className="h-5 w-5" />
                Request Appointment
              </Button>
            </div>
            {/* Ensure visible on all screen sizes: duplicate CTA placed in main area (not mobile-only) */}
            </div>

            {/* Details Tabs */}
            <Card>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto p-0">
                  <TabsTrigger
                    value="overview"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:bg-transparent py-4 px-6"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="features"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:bg-transparent py-4 px-6"
                  >
                    Features
                  </TabsTrigger>
                  <TabsTrigger
                    value="description"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:bg-transparent py-4 px-6"
                  >
                    Description
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-amber-50">
                        <Calendar className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Year</p>
                        <p className="font-semibold">{vehicleAttrs?.year || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-amber-50">
                        <Gauge className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Mileage</p>
                        <p className="font-semibold">{vehicleAttrs?.mileage?.toLocaleString() || 'N/A'} km</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-amber-50">
                        <Fuel className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Fuel Type</p>
                        <p className="font-semibold capitalize">{vehicleAttrs?.fuelType || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-amber-50">
                        <Settings2 className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Transmission</p>
                        <p className="font-semibold capitalize">{vehicleAttrs?.transmission || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-amber-50">
                        <Car className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Body Type</p>
                        <p className="font-semibold">{vehicleAttrs?.bodyType || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-amber-50">
                        <Palette className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Color</p>
                        <p className="font-semibold">{vehicleAttrs?.color || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Make</span>
                      <span className="font-medium">{vehicleAttrs?.make || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Model</span>
                      <span className="font-medium">{vehicleAttrs?.model || 'N/A'}</span>
                    </div>
                    {vehicleAttrs?.engineSize && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Engine Size</span>
                        <span className="font-medium">{vehicleAttrs.engineSize}L</span>
                      </div>
                    )}
                    {vehicleAttrs?.horsepower && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Horsepower</span>
                        <span className="font-medium">{vehicleAttrs.horsepower} HP</span>
                      </div>
                    )}
                    {vehicleAttrs?.doors && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Doors</span>
                        <span className="font-medium">{vehicleAttrs.doors}</span>
                      </div>
                    )}
                    {vehicleAttrs?.seats && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Seats</span>
                        <span className="font-medium">{vehicleAttrs.seats}</span>
                      </div>
                    )}
                    {vehicleAttrs?.interiorColor && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Interior Color</span>
                        <span className="font-medium">{vehicleAttrs.interiorColor}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Condition</span>
                      <span className="font-medium capitalize">{vehicleAttrs?.condition || 'N/A'}</span>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="features" className="p-6">
                  {vehicleAttrs?.features && vehicleAttrs.features.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {vehicleAttrs.features.map((feature: string) => (
                        <div key={feature} className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No features listed</p>
                  )}
                </TabsContent>

                <TabsContent value="description" className="p-6">
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-line">{vehicleData.description || 'No description provided'}</p>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>

            {/* Similar Vehicles */}
            {similarVehicles.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4">Similar Vehicles</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {similarVehicles.map((vehicle) => (
                    <ListingCard key={vehicle.id} listing={vehicle} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-24 space-y-6 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 scrollbar-thin">
            {/* Price Card (Desktop) */}
            <Card>
              <CardContent className="p-6">
                <h1 className="text-xl font-bold mb-2 line-clamp-2">{vehicleData.title}</h1>
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
                  <MapPin className="h-4 w-4" />
                  <span>{vehicleData.city}, {vehicleData.location}</span>
                </div>

                <div className="text-3xl font-bold text-amber-600 mb-1">
                  {formatPrice(vehicleData.price)}
                </div>
                {vehicleData.isNegotiable && (
                  <Badge variant="outline" className="mb-4">Negotiable</Badge>
                )}

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {vehicleData.viewsCount || 0} views
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    {vehicleData.favoritesCount || 0} saves
                  </span>
                </div>

                <div className="space-y-3">
                  <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                        onClick={(e) => {
                          if (!isAuthenticated) {
                            e.preventDefault();
                            handleContactSeller();
                          } else {
                            const attrs = vehicleData.vehicleAttributes || vehicleData.vehicleAttribute;
                            setMessageText(`Hi, I'm interested in your ${attrs?.year} ${attrs?.make} ${attrs?.model}. Is it still available?`);
                          }
                        }}
                      >
                        <MessageSquare className="h-5 w-5" />
                        Contact Seller
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Contact {vehicleData.user?.name || 'Seller'}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={vehicleData.user?.avatar} />
                            <AvatarFallback>{vehicleData.user?.name?.charAt(0) || 'S'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{vehicleData.user?.name || 'Seller'}</p>
                            {vehicleData.user?.isVerified && (
                              <Badge variant="secondary" className="text-xs text-emerald-600 bg-emerald-50">
                                Verified Seller
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Regarding: {vehicleData.title}
                        </p>
                        <Textarea
                          placeholder="Write your message..."
                          className="min-h-[120px]"
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                        />
                        <Button 
                          className="w-full gap-2" 
                          onClick={handleSendMessage}
                          disabled={isSendingMessage || !messageText.trim()}
                        >
                          {isSendingMessage ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <MessageSquare className="h-4 w-4" />
                              Send Message
                            </>
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Request Appointment Dialog (Desktop) */}
                  <Dialog open={isAppointmentOpen} onOpenChange={setIsAppointmentOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={(e) => {
                          if (!isAuthenticated) {
                            e.preventDefault();
                            toast.error('Please sign in to request an appointment', {
                              action: { label: 'Sign in', onClick: () => router.push('/auth/login') },
                            });
                            return;
                          }
                          openAppointmentModal();
                        }}
                      >
                        <Calendar className="h-5 w-5" />
                        Request Appointment
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Request Appointment</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="grid gap-2">
                          <Label>Preferred Date & Time</Label>
                          <input
                            type="datetime-local"
                            value={preferredAt}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPreferredAt(e.target.value)}
                            className="w-full border rounded-md p-2"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Duration (minutes)</Label>
                          <input
                            type="number"
                            value={durationMinutes}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDurationMinutes(Number(e.target.value))}
                            className="w-full border rounded-md p-2"
                            min={15}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Location</Label>
                          <Input value={appointmentLocation} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAppointmentLocation(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                          <Label>Message (optional)</Label>
                          <Textarea value={appointmentMessage} onChange={(e) => setAppointmentMessage(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                          <Label>Contact Phone</Label>
                          <Input value={appointmentPhone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAppointmentPhone(e.target.value)} />
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => setIsAppointmentOpen(false)}>Cancel</Button>
                          <Button className="bg-amber-500 hover:bg-amber-600" onClick={handleRequestAppointment} disabled={isSubmittingAppointment}>
                            {isSubmittingAppointment ? (<><Loader2 className="h-4 w-4 animate-spin mr-2" />Sending...</>) : 'Send Request'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {!showPhone ? (
                    <Button variant="outline" className="w-full gap-2" onClick={handleShowPhone}>
                      <Phone className="h-5 w-5" />
                      Show Phone Number
                    </Button>
                  ) : vehicleData.user?.phone ? (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1 gap-2 font-mono"
                        onClick={handleCallPhone}
                      >
                        <PhoneCall className="h-4 w-4" />
                        {vehicleData.user.phone}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={handleCopyPhone}
                      >
                        {phoneCopied ? (
                          <Check className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ) : (
                    <Button variant="outline" className="w-full gap-2" disabled>
                      <Phone className="h-5 w-5" />
                      No phone available
                    </Button>
                  )}
                </div>

                <Separator className="my-6" />

                <TooltipProvider>
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={toggleFavorite}
                          disabled={toggleFavoriteMutation.isPending}
                          className={cn(isLiked && 'text-red-500 border-red-200')}
                        >
                          {toggleFavoriteMutation.isPending ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Heart className={cn('h-5 w-5', isLiked && 'fill-current')} />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isLiked ? 'Remove from favorites' : 'Add to favorites'}</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            if (!isAuthenticated) {
                              toast.error('Please sign in to compare listings', {
                                action: {
                                  label: 'Sign in',
                                  onClick: () => router.push('/auth/login'),
                                },
                              });
                              return;
                            }
                            
                            if (isInCart) {
                              // Already in cart, navigate to compare page
                              router.push('/compare?type=vehicle');
                              return;
                            }
                            
                            // Add to comparison cart via API
                            addToComparisonCartMutation.mutate(vehicleData.id, {
                              onSuccess: (data) => {
                                const count = data?.listingIds?.length || 0;
                                if (data?.canCompare) {
                                  toast.success(`Added to comparison (${count} items)`, {
                                    action: {
                                      label: 'Compare Now',
                                      onClick: () => router.push('/compare?type=vehicle'),
                                    },
                                  });
                                } else {
                                  toast.success(`Added to comparison (${count}/2 - add one more to compare)`);
                                }
                              },
                              onError: () => {
                                toast.error('Failed to add to comparison');
                              },
                            });
                          }}
                          disabled={addToComparisonCartMutation.isPending}
                          className={cn(isInCart && 'text-amber-500 border-amber-200')}
                        >
                          {addToComparisonCartMutation.isPending ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Scale className="h-5 w-5" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isInCart ? `In comparison (${compareCount}) - Click to compare` : 'Add to compare'}</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            toast.success('Link copied to clipboard!');
                          }}
                        >
                          <Share2 className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Share this listing</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="text-muted-foreground"
                          onClick={() => {
                            if (!isAuthenticated) {
                              toast.error('Please sign in to report listings', {
                                action: {
                                  label: 'Sign in',
                                  onClick: () => router.push('/auth/login'),
                                },
                              });
                              return;
                            }
                            toast.info('Report feature coming soon');
                          }}
                        >
                          <Flag className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Report this listing</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
              </CardContent>
            </Card>

            {/* Seller Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">About the Seller</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={vehicleData.user?.avatar} />
                    <AvatarFallback className="bg-amber-100 text-amber-700 text-lg">
                      {vehicleData.user?.name?.charAt(0) || 'S'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{vehicleData.user?.name || 'Seller'}</p>
                      {vehicleData.user?.isVerified && (
                        <Badge variant="secondary" className="gap-1 text-emerald-600 bg-emerald-50">
                          <Shield className="h-3 w-3" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    {vehicleData.user?.memberSince && (
                      <p className="text-sm text-muted-foreground">
                        Member since {new Date(vehicleData.user.memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="font-semibold">{vehicleData.user?.rating || 'N/A'}</p>
                    <p className="text-muted-foreground flex items-center justify-center gap-1">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      Rating
                    </p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="font-semibold">{vehicleData.user?.listingsCount || 'N/A'}</p>
                    <p className="text-muted-foreground">Listings</p>
                  </div>
                </div>

                {vehicleData.user?.id && (
                  <Link href={`/sellers/${vehicleData.user.id}`}>
                    <Button variant="outline" className="w-full">
                      View Profile
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            {/* Safety Tips */}
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-4">
                <h4 className="font-semibold flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-amber-600" />
                  Safety Tips
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Meet in a public place</li>
                  <li>• Verify documents before payment</li>
                  <li>• Never pay upfront without inspection</li>
                  <li>• Use secure payment methods</li>
                </ul>
              </CardContent>
            </Card>

            {/* Posted Date */}
            {vehicleData.createdAt && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Posted {formatDistanceToNow(new Date(vehicleData.createdAt), { addSuffix: true })}</span>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-background border-t p-4 flex items-center gap-3">
        <div className="flex-1">
          <p className="text-2xl font-bold text-amber-600">{formatPrice(vehicleData.price)}</p>
          {vehicleData.isNegotiable && (
            <p className="text-xs text-muted-foreground">Negotiable</p>
          )}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={toggleFavorite}
          disabled={toggleFavoriteMutation.isPending}
          className={cn(isLiked && 'text-red-500 border-red-200')}
        >
          {toggleFavoriteMutation.isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Heart className={cn('h-5 w-5', isLiked && 'fill-current')} />
          )}
        </Button>
        <Button 
          className="gap-2 bg-gradient-to-r from-amber-500 to-orange-600" 
          onClick={handleContactSeller}
        >
          <MessageSquare className="h-5 w-5" />
          Contact
        </Button>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => {
            if (!isAuthenticated) {
              toast.error('Please sign in to request an appointment', {
                action: { label: 'Sign in', onClick: () => router.push('/auth/login') },
              });
              return;
            }
            openAppointmentModal();
          }}
        >
          <Calendar className="h-5 w-5" />
          Request
        </Button>
      </div>
    </div>
  );
}
