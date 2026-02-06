'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Car,
  Home,
  XCircle,
  Eye,
  Loader2,
  ImageIcon,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAdminListings, useRejectAdminListing, useReapproveAdminListing } from '@/hooks/use-admin';
import { formatDistanceToNow } from 'date-fns';
import { formatPrice, getImageUrl } from '@/lib/utils';

export default function AdminListingsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [appliedStatus, setAppliedStatus] = useState<string>('all');
  const [appliedType, setAppliedType] = useState<string>('all');

  const { data: listingsData, isLoading, refetch } = useAdminListings({
    status: appliedStatus !== 'all' ? appliedStatus as any : undefined,
    type: appliedType !== 'all' ? appliedType as any : undefined,
    search: appliedSearch || undefined,
    page,
    limit: 20,
  });
  const rejectMutation = useRejectAdminListing();
  const reapproveMutation = useReapproveAdminListing();

  const [denyDialogOpen, setDenyDialogOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<string | null>(null);
  const [denyReason, setDenyReason] = useState('');

  // API returns: { data: Listing[], pagination: {...} } (flat structure)
  const listings = (listingsData?.data || []) as any[];
  const pagination = listingsData?.pagination;

  const handleDenyClick = (id: string) => {
    setSelectedListing(id);
    setDenyDialogOpen(true);
  };

  const handleDenyConfirm = () => {
    if (selectedListing && denyReason.trim()) {
      rejectMutation.mutate({ id: selectedListing, reason: denyReason });
      setDenyDialogOpen(false);
      setSelectedListing(null);
      setDenyReason('');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
            <Car className="h-8 w-8" />
            All Listings
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and review all listings on the platform
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search listings..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                  }}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => {
                  const nextSearch = searchQuery.trim();
                  const shouldRefetch =
                    nextSearch === appliedSearch &&
                    statusFilter === appliedStatus &&
                    typeFilter === appliedType;
                  setAppliedSearch(nextSearch);
                  setAppliedStatus(statusFilter);
                  setAppliedType(typeFilter);
                  setPage(1);
                  if (shouldRefetch) {
                    refetch();
                  }
                }}
              >
                Search
              </Button>
              <Select value={statusFilter} onValueChange={(value) => {
                setStatusFilter(value);
              }}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="rejected">Denied</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={(value) => {
                setTypeFilter(value);
              }}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="vehicle">Vehicle</SelectItem>
                  <SelectItem value="property">Property</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Listings */}
        {listings.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No listings found</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {listings.map((listing) => (
              <Card key={listing.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Image */}
                    <div className="relative w-full lg:w-48 h-48 rounded-lg overflow-hidden bg-muted shrink-0">
                      {listing.images && listing.images.length > 0 ? (
                        <Image
                          src={getImageUrl(listing.images[0].url || listing.images[0].thumbnail)}
                          alt={listing.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <ImageIcon className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 space-y-4">
                      <div>
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold mb-2">{listing.title}</h3>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className="capitalize">
                                {listing.type}
                              </Badge>
                              <Badge 
                                variant={
                                  listing.status === 'active' ? 'default' :
                                  listing.status === 'rejected' ? 'destructive' :
                                  listing.status === 'pending' ? 'secondary' :
                                  'outline'
                                }
                                className="capitalize"
                              >
                                {listing.status}
                              </Badge>
                              {listing.isSubmitted !== undefined && (
                                <Badge variant={listing.isSubmitted ? 'default' : 'outline'}>
                                  {listing.isSubmitted ? 'Submitted' : 'Draft'}
                                </Badge>
                              )}
                              <span className="text-amber-600 font-semibold text-lg">
                                {formatPrice(listing.price, listing.currency)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {listing.description}
                        </p>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Seller: </span>
                          <span className="font-medium">{listing.user?.name || 'Unknown'}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Location: </span>
                          <span className="font-medium">{listing.location}, {listing.city}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Submitted: </span>
                          <span>{formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Views: </span>
                          <span>{listing.viewsCount || 0}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Favorites: </span>
                          <span>{listing.stats?.favoritesCount ?? listing.favoritesCount ?? 0}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Appointment Requests: </span>
                          <span>{listing.stats?.appointmentsCount ?? 0}</span>
                        </div>
                        {listing.isSubmitted !== undefined && (
                          <div>
                            <span className="text-muted-foreground">Submission Status: </span>
                            <Badge variant={listing.isSubmitted ? 'default' : 'outline'} className="ml-1">
                              {listing.isSubmitted ? 'Submitted' : 'Draft'}
                            </Badge>
                          </div>
                        )}
                      </div>
                      
                      {/* Rejection Reason */}
                      {listing.status === 'rejected' && listing.rejectionReason && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-3">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-red-900">Rejection Reason</p>
                              <p className="text-sm text-red-700 mt-1">{listing.rejectionReason}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-3 pt-4 border-t">
                        <Link href={`/${listing.type === 'vehicle' ? 'vehicles' : 'properties'}/${listing.slug || listing.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View Listing
                          </Button>
                        </Link>
                        {listing.status === 'rejected' ? (
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => reapproveMutation.mutate(listing.id)}
                            disabled={reapproveMutation.isPending}
                          >
                            {reapproveMutation.isPending ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                            )}
                            Reapprove
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDenyClick(listing.id)}
                            disabled={rejectMutation.isPending}
                          >
                            {rejectMutation.isPending ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <XCircle className="h-4 w-4 mr-2" />
                            )}
                            Deny
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {pagination.currentPage || pagination.page || 1} of {pagination.totalPages} ({pagination.totalItems || 0} total)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || !pagination.hasPrevPage}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages || !pagination.hasNextPage}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Deny Dialog */}
      <AlertDialog open={denyDialogOpen} onOpenChange={setDenyDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deny Listing</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for denying this listing. This will be sent to the seller.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason *</Label>
              <Textarea
                id="reason"
                placeholder="e.g., Images don't match description, misleading information..."
                value={denyReason}
                onChange={(e) => setDenyReason(e.target.value)}
                rows={4}
                required
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDenyDialogOpen(false);
              setDenyReason('');
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDenyConfirm}
              disabled={!denyReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              Deny Listing
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

