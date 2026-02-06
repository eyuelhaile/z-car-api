'use client';

import Link from 'next/link';
import {
  Users,
  Car,
  Building2,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminAnalytics, useAdminPendingListings, useAdminReports, useApproveAdminListing, useRejectAdminListing } from '@/hooks/use-admin';
import { formatDistanceToNow } from 'date-fns';
import { formatPrice } from '@/lib/utils';

export default function AdminDashboardPage() {
  const { data: analytics, isLoading: isLoadingAnalytics } = useAdminAnalytics();
  const { data: pendingListingsData, isLoading: isLoadingListings } = useAdminPendingListings({ limit: 20 });
  const { data: reportsData, isLoading: isLoadingReports } = useAdminReports({ limit: 20 });
  const approveMutation = useApproveAdminListing();
  const rejectMutation = useRejectAdminListing();

  const isLoading = isLoadingAnalytics || isLoadingListings || isLoadingReports;

  // Pending listings response: { data: { data: Listing[], pagination: {...} } } (nested structure)
  const pendingListings = pendingListingsData?.data?.data || [];
  // Reports response: { data: { data: Report[], pagination: {...}, summary: {...} } }
  const reports = reportsData?.data?.data || [];

  // Extract stats from analytics
  const stats = analytics ? [
    { 
      name: 'Total Users', 
      value: analytics.totalUsers?.toLocaleString() || '0', 
      icon: Users, 
      change: analytics.usersChange || '0%', 
      trend: analytics.usersChange?.startsWith('+') || !analytics.usersChange?.startsWith('-') ? 'up' as const : 'down' as const
    },
    { 
      name: 'Active Listings', 
      value: analytics.activeListings?.toLocaleString() || '0', 
      icon: Car, 
      change: analytics.listingsChange || '0%', 
      trend: analytics.listingsChange?.startsWith('+') || !analytics.listingsChange?.startsWith('-') ? 'up' as const : 'down' as const
    },
    { 
      name: 'Pending Reviews', 
      value: analytics.pendingListings?.toLocaleString() || '0', 
      icon: Clock, 
      change: analytics.pendingChange || '0%', 
      trend: analytics.pendingChange?.startsWith('+') || !analytics.pendingChange?.startsWith('-') ? 'up' as const : 'down' as const
    },
    { 
      name: 'Total Revenue', 
      value: analytics.totalRevenue ? formatPrice(analytics.totalRevenue, 'ETB') : formatPrice(0, 'ETB'), 
      icon: DollarSign, 
      change: analytics.revenueChange || '0%', 
      trend: analytics.revenueChange?.startsWith('+') || !analytics.revenueChange?.startsWith('-') ? 'up' as const : 'down' as const
    },
  ] : [];

  const handleApprove = (id: string) => {
    approveMutation.mutate(id);
  };

  const handleReject = (id: string) => {
    if (confirm('Are you sure you want to reject this listing?')) {
      const reason = prompt('Please provide a reason for rejection:');
      if (reason) {
        rejectMutation.mutate({ id, reason });
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'resolved':
        return 'bg-emerald-100 text-emerald-700';
      case 'pending':
        return 'bg-amber-100 text-amber-700';
      case 'investigating':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 space-y-8">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of platform activity and management
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.length > 0 ? stats.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-amber-100">
                  <stat.icon className="h-5 w-5 text-amber-600" />
                </div>
                <div className={`flex items-center gap-1 text-sm ${
                  stat.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {stat.trend === 'up' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  {stat.change}
                </div>
              </div>
              <p className="text-2xl font-bold mt-4">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.name}</p>
            </CardContent>
          </Card>
        )) : (
          [...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-8 w-8 mb-4" />
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending Listings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Pending Listings</CardTitle>
              <CardDescription>Listings awaiting approval</CardDescription>
            </div>
            <Badge variant="secondary">{pendingListings.length} pending</Badge>
          </CardHeader>
          <CardContent>
            {pendingListings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No pending listings</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {pendingListings.slice(0, 3).map((listing) => (
                    <div
                      key={listing.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="flex-1 min-w-0 mr-4">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium truncate">{listing.title}</h4>
                          <Badge variant="outline" className="capitalize">
                            {listing.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          by {listing.user?.name || 'Unknown'} • {formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })}
                        </p>
                        <p className="text-amber-600 font-semibold mt-1">
                          {formatPrice(listing.price)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-600"
                          onClick={() => handleReject(listing.id)}
                          disabled={rejectMutation.isPending}
                        >
                          {rejectMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => handleApprove(listing.id)}
                          disabled={approveMutation.isPending}
                        >
                          {approveMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/dashboard/admin/listings">
                  <Button variant="outline" className="w-full mt-4">
                    View All Pending
                  </Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>

        {/* Recent Reports */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Reports</CardTitle>
              <CardDescription>User-submitted reports</CardDescription>
            </div>
            <Badge variant="secondary">{reports.length} total</Badge>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No reports</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {reports.slice(0, 3).map((report: any) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="flex-1 min-w-0 mr-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="capitalize">
                            {report.entityType}
                          </Badge>
                          <Badge className={getStatusColor(report.status)}>
                            {report.status}
                          </Badge>
                        </div>
                        <p className="font-medium truncate mt-1">{report.target || report.entityId}</p>
                        <p className="text-sm text-muted-foreground">
                          {report.reason} • {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/dashboard/admin/reports">
                  <Button variant="outline" className="w-full mt-4">
                    View All Reports
                  </Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4">
            <Link href="/dashboard/admin/users">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Users className="h-4 w-4" />
                Manage Users
              </Button>
            </Link>
            <Link href="/dashboard/admin/listings">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Car className="h-4 w-4" />
                Review Listings
              </Button>
            </Link>
            <Link href="/dashboard/admin/reports">
              <Button variant="outline" className="w-full justify-start gap-2">
                <AlertTriangle className="h-4 w-4" />
                Handle Reports
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
