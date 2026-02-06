'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Car,
  Eye,
  Heart,
  MessageSquare,
  Calendar,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Search,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { useDashboardAnalytics } from '@/hooks/use-dashboard';
import { useListing } from '@/hooks/use-listings';
import { formatDistanceToNow, format } from 'date-fns';
import { getImageUrl } from '@/lib/utils';
import api from '@/lib/api';
import { toast } from 'sonner';

// Icon mapping for stats
const statIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Saved Favorites': Heart,
  'Messages': MessageSquare,
  'Appointments': Calendar,
  'Saved Searches': Search,
  'Active Listings': Car,
  'Total Views': Eye,
};

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: analytics, isLoading, error } = useDashboardAnalytics();
  
  const isSeller = user?.role === 'private' || user?.role === 'broker' || user?.role === 'dealership';
  const currentStats = isSeller ? analytics?.stats?.seller : analytics?.stats?.buyer;
  const recentListings = analytics?.recentListings || [];
  const recentMessages = analytics?.recentMessages || [];
  const upcomingAppointments = analytics?.upcomingAppointments || [];
  const subscription = analytics?.subscription;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-700';
      case 'pending':
        return 'bg-amber-100 text-amber-700';
      case 'confirmed':
        return 'bg-emerald-100 text-emerald-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'confirmed':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatMessageTime = (time: string) => {
    try {
      return formatDistanceToNow(new Date(time), { addSuffix: true });
    } catch {
      return time;
    }
  };

  const formatAppointmentDate = (date: string) => {
    try {
      return format(new Date(date), "MMM d, h:mm a");
    } catch {
      return date;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 space-y-8">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
          {isSeller && <Skeleton className="h-10 w-32" />}
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-10 w-10 rounded-lg mb-4" />
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s what&apos;s happening with your {isSeller ? 'listings' : 'searches'} today.
          </p>
        </div>
        {isSeller && (
          <Link href="/dashboard/listings/create">
            <Button className="gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700">
              <Plus className="h-5 w-5" />
              New Listing
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {(currentStats || []).map((stat) => {
          const IconComponent = statIcons[stat.name] || TrendingUp;
          return (
            <Card key={stat.name}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-amber-100">
                    <IconComponent className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${
                    stat.trend === 'up' ? 'text-emerald-600' : stat.trend === 'down' ? 'text-red-600' : 'text-muted-foreground'
                  }`}>
                    {stat.trend === 'up' && <ArrowUpRight className="h-4 w-4" />}
                    {stat.trend === 'down' && <ArrowDownRight className="h-4 w-4" />}
                    {stat.change}
                  </div>
                </div>
                <p className="text-2xl font-bold mt-4">{stat.value.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">{stat.name}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Listings (Seller) or Favorites (Buyer) */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{isSeller ? 'Recent Listings' : 'Recent Favorites'}</CardTitle>
              <CardDescription>
                {isSeller ? 'Your latest listings and their performance' : 'Properties you recently saved'}
              </CardDescription>
            </div>
            <Link href={isSeller ? '/dashboard/listings' : '/dashboard/favorites'}>
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentListings.length > 0 ? (
              <div className="space-y-4">
                {recentListings.map((listing) => (
                  <div
                    key={listing.id}
                    className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                      {listing.image ? (
                        <img
                          src={getImageUrl(listing.image)}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Car className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium truncate">{listing.title}</h4>
                        <Badge className={getStatusColor(listing.status)} variant="secondary">
                          {getStatusIcon(listing.status)}
                          <span className="ml-1 capitalize">{listing.status}</span>
                        </Badge>
                      </div>
                      <p className="text-amber-600 font-semibold">{formatPrice(listing.price)}</p>
                      {isSeller && listing.status === 'active' && (
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {listing.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            {listing.favorites}
                          </span>
                        </div>
                      )}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={async () => {
                        try {
                          // Fetch full listing to get slug and type
                          const response = await api.getListing(listing.id);
                          const listingData = response.data;
                          if (listingData?.slug && listingData?.type) {
                            router.push(`/${listingData.type === 'vehicle' ? 'vehicles' : 'properties'}/${listingData.slug}`);
                          } else {
                            toast.error('Unable to load listing details');
                          }
                        } catch (error) {
                          toast.error('Failed to load listing');
                        }
                      }}
                    >
                      View
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Car className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {isSeller ? 'No listings yet' : 'No favorites yet'}
                </p>
                {isSeller && (
                  <Link href="/dashboard/listings/create">
                    <Button size="sm" className="mt-2">Create Listing</Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Messages */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Messages</CardTitle>
              <CardDescription>Recent conversations</CardDescription>
            </div>
            <Link href="/dashboard/messages">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentMessages.length > 0 ? (
              <div className="space-y-4">
                {recentMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={msg.avatar} />
                      <AvatarFallback>{msg.user.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`font-medium truncate ${msg.unread ? '' : 'text-muted-foreground'}`}>
                          {msg.user}
                        </p>
                        {msg.unread && (
                          <div className="w-2 h-2 rounded-full bg-amber-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{msg.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{formatMessageTime(msg.time)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent messages</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Appointments */}
      {(isSeller || upcomingAppointments.length > 0) && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>Your scheduled viewings and meetings</CardDescription>
            </div>
            <Link href="/dashboard/appointments">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {upcomingAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-4 rounded-lg border"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Badge className={getStatusColor(apt.status)} variant="secondary">
                        {apt.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                      </Badge>
                      <span className="text-sm font-medium">{formatAppointmentDate(apt.date)}</span>
                    </div>
                    <h4 className="font-medium mb-1">{apt.listing}</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      with {apt.buyer}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {apt.location}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No upcoming appointments</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Subscription Status (Seller) */}
      {isSeller && subscription && (
        <Card>
          <CardHeader>
            <CardTitle>Subscription Status</CardTitle>
            <CardDescription>Your current plan and usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-amber-500">{subscription.plan}</Badge>
                  <span className="text-sm text-muted-foreground">
                    Expires in {subscription.expiresIn} day{subscription.expiresIn !== 1 ? 's' : ''}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  You have used {subscription.listingsUsed} of {subscription.listingsLimit} listing slots
                </p>
              </div>
              <Link href="/dashboard/subscription">
                <Button variant="outline">Upgrade Plan</Button>
              </Link>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Listings</span>
                  <span>{subscription.listingsUsed} / {subscription.listingsLimit}</span>
                </div>
                <Progress 
                  value={(subscription.listingsUsed / subscription.listingsLimit) * 100} 
                  className="h-2" 
                />
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Featured Listings</span>
                  <span>{subscription.featuredUsed} / {subscription.featuredLimit}</span>
                </div>
                <Progress 
                  value={(subscription.featuredUsed / subscription.featuredLimit) * 100} 
                  className="h-2" 
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

