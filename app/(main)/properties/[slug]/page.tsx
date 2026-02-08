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
  Phone,
  MessageSquare,
  Shield,
  Star,
  ChevronLeft,
  ChevronRight,
  Flag,
  Scale,
  Eye,
  Calendar,
  Clock,
  CheckCircle2,
  Loader2,
  PhoneCall,
  Copy,
  Check,
  Home,
  Bed,
  Bath,
  Maximize,
  Building,
  Sofa,
  ParkingCircle,
  Trees,
  Wifi,
  AirVent,
  Droplets,
  Zap,
  DoorOpen,
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
import { useToggleFavorite, useListingBySlug } from '@/hooks/use-listings';
import { useAddToComparisonCart, useComparisonCart } from '@/hooks/use-dashboard';
import { cn, getImageUrl } from '@/lib/utils';
import { getApiErrorMessage } from '@/lib/error-utils';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useBookAppointment, useRefreshBadgeCounts } from '@/hooks/use-dashboard';

// Helper to get property attributes
function getPropertyAttributes(listing: any) {
  return listing?.propertyAttributes || listing?.propertyAttribute;
}

export default function PropertyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [phoneCopied, setPhoneCopied] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  
  const { isAuthenticated, user } = useAuthStore();
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  const toggleFavoriteMutation = useToggleFavorite();
  
  // Comparison cart
  const addToComparisonCartMutation = useAddToComparisonCart();
  const { data: comparisonCart } = useComparisonCart('property', isAuthenticated);

  // Fetch listing data from API
  const { data: propertyData, isLoading, error } = useListingBySlug(slug);

  const isLiked = propertyData ? isFavorite(propertyData.id) : false;
  const isInCart = propertyData && comparisonCart?.listingIds?.includes(propertyData.id);
  const canCompare = comparisonCart?.canCompare || false;
  const compareCount = comparisonCart?.listingIds?.length || 0;
  const propertyAttrs = propertyData ? getPropertyAttributes(propertyData) : null;

  const toggleFavorite = async () => {
    if (!propertyData) return;
    
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
      removeFavorite(propertyData.id);
    } else {
      addFavorite(propertyData.id);
    }

    try {
      await toggleFavoriteMutation.mutateAsync({ 
        listingId: propertyData.id, 
        isFavorited: isLiked 
      });
      
      if (!isLiked) {
        toast.success('Added to favorites');
      } else {
        toast.success('Removed from favorites');
      }
    } catch {
      if (isLiked) {
        addFavorite(propertyData.id);
      } else {
        removeFavorite(propertyData.id);
      }
      toast.error('Failed to update favorites');
    }
  };

  // Appointment states
  const [isAppointmentOpen, setIsAppointmentOpen] = useState(false);
  const [preferredAt, setPreferredAt] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [appointmentLocation, setAppointmentLocation] = useState('');
  const [appointmentMessage, setAppointmentMessage] = useState('');
  const [appointmentPhone, setAppointmentPhone] = useState('');
  const [isSubmittingAppointment, setIsSubmittingAppointment] = useState(false);
  const bookAppointmentMutation = useBookAppointment();
  const refreshBadgeCounts = useRefreshBadgeCounts();

  const handleContactSeller = () => {
    if (!propertyData) return;
    
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
    setMessageText(`Hi, I'm interested in your property "${propertyData.title}". Is it still available?`);
    setIsContactDialogOpen(true);
  };

  const handleSendMessage = async () => {
    if (!propertyData || !messageText.trim()) {
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
      const sellerId = propertyData.user?.id;
      if (!sellerId) {
        toast.error('Cannot contact seller', {
          description: 'Seller information not available',
        });
        return;
      }
      
      const response = await api.startConversation(propertyData.id, sellerId, messageText.trim());
      if (response.success) {
        toast.success('Message sent!', {
          description: 'The seller will be notified',
        });
        setIsContactDialogOpen(false);
        setMessageText('');
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

  const canRequestAppointment = () => {
    if (!propertyData) return false;
    if (!isAuthenticated) return false;
    if (user?.id === propertyData.user?.id) return false;
    if (propertyData.status !== 'active') return false;
    return true;
  };

  const openAppointmentModal = () => {
    if (!canRequestAppointment()) {
      toast.error('You cannot request an appointment for this listing');
      return;
    }
    setPreferredAt('');
    setDurationMinutes(30);
    const addr = (propertyData as any)?.address || `${propertyData?.city}, ${propertyData?.location}` || '';
    setAppointmentLocation(addr);
    setAppointmentMessage('');
    setAppointmentPhone(user?.phone || '');
    setIsAppointmentOpen(true);
  };

  const handleRequestAppointment = async () => {
    if (!propertyData) return;
    if (!preferredAt) {
      toast.error('Please select preferred date and time');
      return;
    }
    setIsSubmittingAppointment(true);
    try {
      const iso = new Date(preferredAt).toISOString();
      const res = await bookAppointmentMutation.mutateAsync({
        listingId: propertyData.id,
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

  const handleCopyPhone = () => {
    if (propertyData?.user?.phone) {
      navigator.clipboard.writeText(propertyData.user.phone);
      setPhoneCopied(true);
      toast.success('Phone number copied!');
      setTimeout(() => setPhoneCopied(false), 2000);
    }
  };

  const handleCallPhone = () => {
    if (propertyData?.user?.phone) {
      window.location.href = `tel:${propertyData.user.phone}`;
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
    if (propertyData?.images) {
      setCurrentImageIndex((prev) => (prev + 1) % propertyData.images.length);
    }
  };

  const prevImage = () => {
    if (propertyData?.images) {
      setCurrentImageIndex((prev) => (prev - 1 + propertyData.images.length) % propertyData.images.length);
    }
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
              <Skeleton className="aspect-[16/10] rounded-xl" />
              <Skeleton className="h-96 rounded-xl" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-80 rounded-xl" />
              <Skeleton className="h-48 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !propertyData) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <Home className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Property Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The property you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/properties">
              <Button>Browse Properties</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentImage = getImageUrl(propertyData.images?.[currentImageIndex]?.url);

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      {/* Breadcrumb */}
      <div className="bg-background border-b">
        <div className="container py-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <Link href="/properties" className="hover:text-foreground">Properties</Link>
            <span>/</span>
            <span className="text-foreground truncate max-w-[200px]">{propertyData.title}</span>
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
                <Image
                  src={currentImage}
                  alt={propertyData.title}
                  fill
                  className="object-cover"
                  priority
                />

                {/* Navigation Arrows */}
                {propertyData.images && propertyData.images.length > 1 && (
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
                {propertyData.images && propertyData.images.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
                    {currentImageIndex + 1} / {propertyData.images.length}
                  </div>
                )}

                {/* Featured Badge */}
                {propertyData.isFeatured && (
                  <Badge className="absolute top-4 left-4 bg-emerald-500 hover:bg-emerald-600">
                    Featured
                  </Badge>
                )}

                {/* Listing Type Badge */}
                {propertyAttrs?.listingType && (
                  <Badge className="absolute top-4 left-24 bg-blue-500 hover:bg-blue-600">
                    For {propertyAttrs.listingType === 'rent' ? 'Rent' : 'Sale'}
                  </Badge>
                )}
              </div>

              {/* Thumbnails */}
              {propertyData.images && propertyData.images.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {propertyData.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={cn(
                        'relative w-20 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-colors',
                        currentImageIndex === index ? 'border-emerald-500' : 'border-transparent'
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
              <h1 className="text-2xl font-bold mb-2">{propertyData.title}</h1>
              <div className="flex items-center gap-4 text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {propertyData.city}{propertyData.location && `, ${propertyData.location}`}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {propertyData.viewsCount} views
                </span>
              </div>
              <div className="text-3xl font-bold text-emerald-600 mb-4">
                {formatPrice(propertyData.price)}
                {propertyAttrs?.listingType === 'rent' && (
                  <span className="text-sm font-normal text-muted-foreground">/month</span>
                )}
                {propertyData.isNegotiable && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">Negotiable</span>
                )}
              </div>
            </div>

            {/* Details Tabs */}
            <Card>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto p-0">
                  <TabsTrigger
                    value="overview"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent py-4 px-6"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="amenities"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent py-4 px-6"
                  >
                    Amenities
                  </TabsTrigger>
                  <TabsTrigger
                    value="description"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent py-4 px-6"
                  >
                    Description
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {propertyAttrs?.bedrooms && (
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-lg bg-emerald-50">
                          <Bed className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Bedrooms</p>
                          <p className="font-semibold">{propertyAttrs.bedrooms}</p>
                        </div>
                      </div>
                    )}
                    {propertyAttrs?.bathrooms && (
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-lg bg-emerald-50">
                          <Bath className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Bathrooms</p>
                          <p className="font-semibold">{propertyAttrs.bathrooms}</p>
                        </div>
                      </div>
                    )}
                    {propertyAttrs?.area && (
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-lg bg-emerald-50">
                          <Maximize className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Area</p>
                          <p className="font-semibold">{propertyAttrs.area} m²</p>
                        </div>
                      </div>
                    )}
                    {propertyAttrs?.propertyType && (
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-lg bg-emerald-50">
                          <Building className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Type</p>
                          <p className="font-semibold capitalize">{propertyAttrs.propertyType}</p>
                        </div>
                      </div>
                    )}
                    {propertyAttrs?.furnished !== undefined && (
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-lg bg-emerald-50">
                          <Sofa className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Furnished</p>
                          <p className="font-semibold">{propertyAttrs.furnished ? 'Yes' : 'No'}</p>
                        </div>
                      </div>
                    )}
                    {propertyAttrs?.floor && (
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-lg bg-emerald-50">
                          <DoorOpen className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Floor</p>
                          <p className="font-semibold">{propertyAttrs.floor}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator className="my-6" />

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {propertyAttrs?.yearBuilt && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Year Built</span>
                        <span className="font-medium">{propertyAttrs.yearBuilt}</span>
                      </div>
                    )}
                    {propertyAttrs?.totalFloors && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Total Floors</span>
                        <span className="font-medium">{propertyAttrs.totalFloors}</span>
                      </div>
                    )}
                    {propertyAttrs?.parkingSpaces !== undefined && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Parking Spaces</span>
                        <span className="font-medium">{propertyAttrs.parkingSpaces}</span>
                      </div>
                    )}
                    {propertyAttrs?.condition && (
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Condition</span>
                        <span className="font-medium capitalize">{propertyAttrs.condition}</span>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="amenities" className="p-6">
                  {propertyAttrs?.amenities && propertyAttrs.amenities.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {propertyAttrs.amenities.map((amenity: string) => (
                        <div key={amenity} className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          <span className="capitalize">{amenity}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No amenities listed</p>
                  )}
                </TabsContent>

                <TabsContent value="description" className="p-6">
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-line">{propertyData.description || 'No description provided.'}</p>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>

            {/* Similar Properties */}
            {propertyData.similarListings && propertyData.similarListings.length > 0 && (
              <div>
                <h2 className="text-xl font-bold mb-4">Similar Properties</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {propertyData.similarListings.map((property: any) => (
                    <ListingCard key={property.id} listing={property} />
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
                <h1 className="text-xl font-bold mb-2 line-clamp-2">{propertyData.title}</h1>
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
                  <MapPin className="h-4 w-4" />
                  <span>{propertyData.city}{propertyData.location && `, ${propertyData.location}`}</span>
                </div>

                <div className="text-3xl font-bold text-emerald-600 mb-1">
                  {formatPrice(propertyData.price)}
                  {propertyAttrs?.listingType === 'rent' && (
                    <span className="text-sm font-normal text-muted-foreground">/month</span>
                  )}
                </div>
                {propertyData.isNegotiable && (
                  <Badge variant="outline" className="mb-4">Negotiable</Badge>
                )}

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {propertyData.viewsCount} views
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    {propertyData.favoritesCount} saves
                  </span>
                </div>

                {/* Quick stats */}
                {propertyAttrs && (
                  <div className="flex items-center gap-4 mb-6 text-sm">
                    {propertyAttrs.bedrooms && (
                      <span className="flex items-center gap-1">
                        <Bed className="h-4 w-4" />
                        {propertyAttrs.bedrooms} Beds
                      </span>
                    )}
                    {propertyAttrs.bathrooms && (
                      <span className="flex items-center gap-1">
                        <Bath className="h-4 w-4" />
                        {propertyAttrs.bathrooms} Baths
                      </span>
                    )}
                    {propertyAttrs.area && (
                      <span className="flex items-center gap-1">
                        <Maximize className="h-4 w-4" />
                        {propertyAttrs.area}m²
                      </span>
                    )}
                  </div>
                )}

                <div className="space-y-3">
                  <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                        onClick={(e) => {
                          if (!isAuthenticated) {
                            e.preventDefault();
                            handleContactSeller();
                          } else {
                            setMessageText(`Hi, I'm interested in your property "${propertyData.title}". Is it still available?`);
                          }
                        }}
                      >
                        <MessageSquare className="h-5 w-5" />
                        Contact Seller
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Contact {propertyData.user?.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={propertyData.user?.avatar} />
                            <AvatarFallback>{propertyData.user?.name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{propertyData.user?.name}</p>
                            {propertyData.user?.isVerified && (
                              <Badge variant="secondary" className="text-xs text-emerald-600 bg-emerald-50">
                                Verified Seller
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Regarding: {propertyData.title}
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
                  
                  {/* Request Appointment Dialog (Desktop & Mobile) */}
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
                          <Button className="bg-emerald-500 hover:bg-emerald-600" onClick={handleRequestAppointment} disabled={isSubmittingAppointment}>
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
                  ) : propertyData.user?.phone ? (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1 gap-2 font-mono"
                        onClick={handleCallPhone}
                      >
                        <PhoneCall className="h-4 w-4" />
                        {propertyData.user.phone}
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
                              router.push('/compare?type=property');
                              return;
                            }
                            
                            // Add to comparison cart via API
                            addToComparisonCartMutation.mutate(propertyData.id, {
                              onSuccess: (data) => {
                                const count = data?.listingIds?.length || 0;
                                if (data?.canCompare) {
                                  toast.success(`Added to comparison (${count} items)`, {
                                    action: {
                                      label: 'Compare Now',
                                      onClick: () => router.push('/compare?type=property'),
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
                          className={cn(isInCart && 'text-emerald-500 border-emerald-200')}
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
                    <AvatarImage src={propertyData.user?.avatar} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 text-lg">
                      {propertyData.user?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{propertyData.user?.name}</p>
                      {propertyData.user?.isVerified && (
                        <Badge variant="secondary" className="gap-1 text-emerald-600 bg-emerald-50">
                          <Shield className="h-3 w-3" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    {propertyData.user?.memberSince && (
                      <p className="text-sm text-muted-foreground">
                        Member since {new Date(propertyData.user.memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>

                <Link href={`/sellers/${propertyData.user?.id}`}>
                  <Button variant="outline" className="w-full">
                    View Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Safety Tips */}
            <Card className="bg-emerald-50 border-emerald-200">
              <CardContent className="p-4">
                <h4 className="font-semibold flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-emerald-600" />
                  Safety Tips
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Visit the property in person</li>
                  <li>• Verify ownership documents</li>
                  <li>• Don't pay without a proper contract</li>
                  <li>• Use secure payment methods</li>
                </ul>
              </CardContent>
            </Card>

            {/* Posted Date */}
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Posted {formatDistanceToNow(new Date(propertyData.createdAt), { addSuffix: true })}</span>
            </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-background border-t p-4 flex items-center gap-3">
        <div className="flex-1">
          <p className="text-2xl font-bold text-emerald-600">
            {formatPrice(propertyData.price)}
            {propertyAttrs?.listingType === 'rent' && (
              <span className="text-xs font-normal text-muted-foreground">/mo</span>
            )}
          </p>
          {propertyData.isNegotiable && (
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
          className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600" 
          onClick={handleContactSeller}
        >
          <MessageSquare className="h-5 w-5" />
          Contact
        </Button>
      </div>
    </div>
  );
}

