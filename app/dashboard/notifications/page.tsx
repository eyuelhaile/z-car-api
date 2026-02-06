'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  MessageSquare,
  Heart,
  CheckCircle2,
  Calendar,
  CreditCard,
  AlertCircle,
  Check,
  Trash2,
  Loader2,
  Star,
  Package,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '@/hooks/use-dashboard';
import { Notification } from '@/types';
import { formatDistanceToNow } from 'date-fns';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'new_message':
      return <MessageSquare className="h-5 w-5 text-blue-500" />;
    case 'listing_approved':
      return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
    case 'listing_rejected':
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    case 'listing_expired':
      return <Package className="h-5 w-5 text-gray-500" />;
    case 'new_favorite':
      return <Heart className="h-5 w-5 text-red-500" />;
    case 'appointment_confirmed':
    case 'appointment_request':
    case 'appointment_cancelled':
      return <Calendar className="h-5 w-5 text-amber-500" />;
    case 'subscription_expiring':
    case 'payment_received':
      return <CreditCard className="h-5 w-5 text-purple-500" />;
    case 'new_review':
      return <Star className="h-5 w-5 text-yellow-500" />;
    case 'saved_search_match':
      return <TrendingUp className="h-5 w-5 text-green-500" />;
    default:
      return <Bell className="h-5 w-5 text-gray-500" />;
  }
};

const getNotificationLink = (notification: Notification): string | null => {
  const data = notification.data as Record<string, string> | undefined;
  if (!data) return null;
  
  switch (notification.type) {
    case 'new_message':
      return data.conversationId ? `/dashboard/messages?id=${data.conversationId}` : '/dashboard/messages';
    case 'listing_approved':
    case 'listing_rejected':
    case 'listing_expired':
    case 'new_favorite':
      return data.listingId ? `/listings/${data.listingId}` : null;
    case 'appointment_confirmed':
    case 'appointment_request':
    case 'appointment_cancelled':
      return '/dashboard/appointments';
    case 'subscription_expiring':
      return '/dashboard/subscription';
    case 'payment_received':
      return '/dashboard/wallet';
    case 'new_review':
      return data.reviewId ? `/dashboard/reviews` : null;
    case 'saved_search_match':
      return data.searchId ? `/dashboard/saved-searches` : null;
    default:
      return null;
  }
};

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('all');

  const { data: notificationsData, isLoading } = useNotifications(
    activeTab === 'unread' ? true : undefined
  );
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  const notifications = notificationsData?.notifications || [];
  const unreadCount = notificationsData?.unreadCount || 0;

  const handleMarkAsRead = (notification: Notification) => {
    if (!notification.isRead) {
      markReadMutation.mutate(notification.id);
    }
  };

  const handleMarkAllAsRead = () => {
    markAllReadMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32 mt-2" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>
        <Skeleton className="h-10 w-48" />
        <Card>
          <CardContent className="p-0">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-4 p-4 border-b last:border-0">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-24" />
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
            <Bell className="h-8 w-8" />
            Notifications
          </h1>
          <p className="text-muted-foreground mt-1">
            You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            onClick={handleMarkAllAsRead}
            disabled={markAllReadMutation.isPending}
            className="gap-2"
          >
            {markAllReadMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all" className="gap-2">
            All
            <Badge variant="secondary">{notifications.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="unread" className="gap-2">
            Unread
            {unreadCount > 0 && (
              <Badge className="bg-amber-500">{unreadCount}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <CardContent className="p-0 divide-y">
              {notifications.length > 0 ? (
                notifications.map((notification) => {
                  const link = getNotificationLink(notification);
                  const content = (
                    <div
                      className={cn(
                        'flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer',
                        !notification.isRead && 'bg-amber-50/50'
                      )}
                      onClick={() => handleMarkAsRead(notification)}
                    >
                      <div className="p-2 rounded-full bg-muted">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className={cn('font-medium', !notification.isRead && 'text-amber-900')}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.body}
                            </p>
                          </div>
                          {!notification.isRead && (
                            <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-2" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {notification.createdAt
                            ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })
                            : ''}
                        </p>
                      </div>
                    </div>
                  );

                  return link ? (
                    <Link key={notification.id} href={link}>
                      {content}
                    </Link>
                  ) : (
                    <div key={notification.id}>{content}</div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <Bell className="h-16 w-16 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                  <p className="text-muted-foreground text-center">
                    {activeTab === 'unread'
                      ? "You're all caught up! No unread notifications."
                      : 'You have no notifications yet.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
