'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  BarChart3,
  Eye,
  Heart,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Calendar,
  ArrowUpRight,
  ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { AnalyticsOverview } from '@/types';
import { useAnalyticsOverview } from '@/hooks/use-dashboard';

const periodOptions = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'all', label: 'All time' },
];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('30d');
  
  // Fetch analytics data from API
  const { data: analytics, isLoading } = useAnalyticsOverview(period);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    }
    if (trend < 0) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-muted-foreground';
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">No analytics data available</p>
        </div>
      </div>
    );
  }

  const overview = analytics.overview;
  const performance = analytics.performance;
  const topListings = analytics.topListings || [];
  const recentActivity = analytics.recentActivity || [];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your listings performance and engagement
          </p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            {periodOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Overview Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Views
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatNumber(overview.totalViews)}</div>
            <div className={cn('flex items-center gap-1 text-sm mt-1', getTrendColor(performance.viewsTrend))}>
              {getTrendIcon(performance.viewsTrend)}
              <span>{performance.viewsTrend > 0 ? '+' : ''}{performance.viewsTrend}%</span>
              <span className="text-muted-foreground">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Favorites
            </CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatNumber(overview.totalFavorites)}</div>
            <div className={cn('flex items-center gap-1 text-sm mt-1', getTrendColor(performance.favoritesTrend))}>
              {getTrendIcon(performance.favoritesTrend)}
              <span>{performance.favoritesTrend > 0 ? '+' : ''}{performance.favoritesTrend}%</span>
              <span className="text-muted-foreground">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Contacts
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatNumber(overview.totalContacts)}</div>
            <div className={cn('flex items-center gap-1 text-sm mt-1', getTrendColor(performance.contactsTrend))}>
              {getTrendIcon(performance.contactsTrend)}
              <span>{performance.contactsTrend > 0 ? '+' : ''}{performance.contactsTrend}%</span>
              <span className="text-muted-foreground">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Listings
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overview.activeListings}</div>
            <p className="text-sm text-muted-foreground mt-1">
              of {overview.totalListings} total listings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Listings & Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Performing Listings */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Listings</CardTitle>
            <CardDescription>Your best performing listings by views</CardDescription>
          </CardHeader>
          <CardContent>
            {topListings.length > 0 ? (
              <div className="space-y-4">
                {topListings.map((listing: any, index: number) => (
                  <div key={listing.id} className="flex items-center gap-4">
                    <div className="text-lg font-bold text-muted-foreground w-6">
                      #{index + 1}
                    </div>
                    <div className="w-16 h-12 rounded-lg overflow-hidden bg-muted relative shrink-0">
                      {listing.thumbnail ? (
                        <Image
                          src={listing.thumbnail}
                          alt={listing.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <ImageIcon className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/listings/${listing.id}`}
                        className="font-medium hover:text-amber-600 transition-colors line-clamp-1"
                      >
                        {listing.title}
                      </Link>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {formatNumber(listing.views)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {formatNumber(listing.favorites)}
                        </span>
                      </div>
                    </div>
                    <Link href={`/dashboard/listings/${listing.id}/analytics`}>
                      <Button variant="ghost" size="icon">
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground text-center">
                  No listing data available yet
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest interactions on your listings</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity: any, index: number) => (
                  <div key={index} className="flex items-start gap-4">
                    <div
                      className={cn(
                        'p-2 rounded-full shrink-0',
                        activity.type === 'new_favorite'
                          ? 'bg-red-100 text-red-600'
                          : activity.type === 'new_message'
                          ? 'bg-blue-100 text-blue-600'
                          : activity.type === 'new_view'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-600'
                      )}
                    >
                      {activity.type === 'new_favorite' ? (
                        <Heart className="h-4 w-4" />
                      ) : activity.type === 'new_message' ? (
                        <MessageSquare className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium">
                          {activity.type === 'new_favorite'
                            ? 'New favorite'
                            : activity.type === 'new_message'
                            ? 'New message'
                            : 'Page view'}
                        </span>
                        {' on '}
                        <Link
                          href={`/listings/${activity.listingId}`}
                          className="text-amber-600 hover:underline"
                        >
                          {activity.listing}
                        </Link>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {activity.createdAt
                          ? format(new Date(activity.createdAt), 'MMM d, h:mm a')
                          : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <TrendingUp className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground text-center">
                  No recent activity to show
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tips */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-amber-900 mb-2">
            💡 Tips to improve your performance
          </h3>
          <ul className="space-y-2 text-sm text-amber-800">
            <li>• Add high-quality photos to your listings to attract more views</li>
            <li>• Keep your listings updated with accurate information</li>
            <li>• Respond quickly to messages to improve engagement</li>
            <li>• Consider boosting your top listings for more visibility</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

