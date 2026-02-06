'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Plus,
  Search,
  MoreVertical,
  Eye,
  Heart,
  Edit,
  Trash2,
  Rocket,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Loader2,
  ImageIcon,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useMyListings, usePublishListing, useMarkListingSold, useRemoveListing } from '@/hooks/use-listings';
import { Listing } from '@/types';
import { format } from 'date-fns';
import { getImageUrl, cn } from '@/lib/utils';

export default function ListingsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [listingToPublish, setListingToPublish] = useState<string | null>(null);
  const [listingToSell, setListingToSell] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const { data: listingsData, isLoading } = useMyListings(
    statusFilter !== 'all' ? statusFilter : undefined,
    page,
    12 // itemsPerPage from API response
  );
  const removeMutation = useRemoveListing();
  const publishMutation = usePublishListing();
  const markSoldMutation = useMarkListingSold();

  const listings = listingsData?.data || [];
  // Handle both meta.pagination and pagination (for backward compatibility)
  // API returns meta.pagination, but type might have pagination directly
  const pagination = (listingsData as any)?.meta?.pagination || (listingsData as any)?.pagination;

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, typeFilter, searchQuery]);

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
      case 'sold':
        return 'bg-blue-100 text-blue-700';
      case 'expired':
        return 'bg-gray-100 text-gray-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'draft':
        return 'bg-slate-100 text-slate-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="h-3 w-3" />;
      case 'pending':
        return <Clock className="h-3 w-3" />;
      case 'sold':
        return <CheckCircle2 className="h-3 w-3" />;
      case 'expired':
        return <AlertCircle className="h-3 w-3" />;
      case 'rejected':
        return <XCircle className="h-3 w-3" />;
      case 'draft':
        return <FileText className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const handleRemove = (id: string) => {
    removeMutation.mutate(id);
  };

  const filteredListings = listings.filter((listing: Listing) => {
    if (typeFilter !== 'all' && listing.type !== typeFilter) return false;
    if (searchQuery && !listing.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: listings.length,
    active: listings.filter((l: Listing) => l.status === 'active').length,
    pending: listings.filter((l: Listing) => l.status === 'pending').length,
    sold: listings.filter((l: Listing) => l.status === 'sold').length,
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-14 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">My Listings</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track your listings
          </p>
        </div>
        <Link href="/dashboard/listings/create">
          <Button className="gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700">
            <Plus className="h-5 w-5" />
            New Listing
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total Listings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-emerald-600">{stats.active}</p>
            <p className="text-sm text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
            <p className="text-sm text-muted-foreground">Pending Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-blue-600">{stats.sold}</p>
            <p className="text-sm text-muted-foreground">Sold</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search listings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="vehicle">Vehicles</SelectItem>
                <SelectItem value="property">Properties</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Listings Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Listing</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="hidden md:table-cell">Performance</TableHead>
                <TableHead className="hidden lg:table-cell">Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredListings.map((listing: Listing) => (
                <TableRow key={listing.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-12 rounded-lg overflow-hidden bg-muted shrink-0 relative">
                        {listing.images?.[0]?.url ? (
                          <Image
                            src={getImageUrl(listing.images[0].thumbnail || listing.images[0].url)}
                            alt={listing.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link
                            href={`/${listing.type === 'vehicle' ? 'vehicles' : 'properties'}/${listing.slug}`}
                            className="font-medium truncate max-w-[200px] hover:text-amber-600 transition-colors"
                          >
                            {listing.title}
                          </Link>
                          <Badge
                            variant="outline"
                            className={cn(
                              "capitalize text-xs",
                              (listing.category === 'vehicle' || listing.type === 'vehicle')
                                ? "border-blue-500 text-blue-700 bg-blue-50"
                                : "border-purple-500 text-purple-700 bg-purple-50"
                            )}
                          >
                            {(listing.category || listing.type) === 'vehicle' ? 'Vehicle' : 'Property'}
                          </Badge>
                          {listing.isFeatured && (
                            <Badge className="bg-amber-500 text-xs">Featured</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(listing.status)} variant="secondary">
                      {getStatusIcon(listing.status)}
                      <span className="ml-1 capitalize">{listing.status}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <p className="font-semibold text-amber-600">{formatPrice(listing.price)}</p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {listing.viewsCount || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {listing.favoritesCount || 0}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">
                    {listing.createdAt ? format(new Date(listing.createdAt), 'MMM d, yyyy') : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onSelect={() => {
                            router.push(`/${listing.type === 'vehicle' ? 'vehicles' : 'properties'}/${listing.slug}`);
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => {
                            router.push(`/dashboard/listings/${listing.id}/edit`);
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        {listing.status === 'pending' && (
                          <AlertDialog open={listingToPublish === listing.id} onOpenChange={(open) => {
                            if (!open) {
                              setListingToPublish(null);
                            }
                          }}>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(e) => {
                                  e.preventDefault();
                                  setListingToPublish(listing.id);
                                }}
                                disabled={publishMutation.isPending}
                              >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                {publishMutation.isPending ? 'Publishing...' : 'Publish'}
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Publish Listing</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to publish this listing? Once published, it will be visible to all buyers and appear in search results. You can still edit or unpublish it later.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setListingToPublish(null)}>
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => {
                                    if (listingToPublish) {
                                      publishMutation.mutate(listingToPublish);
                                      setListingToPublish(null);
                                    }
                                  }}
                                  disabled={publishMutation.isPending}
                                  className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                                >
                                  {publishMutation.isPending ? (
                                    <>
                                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                      Publishing...
                                    </>
                                  ) : (
                                    'Yes, Publish'
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        {listing.status === 'active' && (
                          <DropdownMenuItem
                            onSelect={() => {
                              router.push(`/dashboard/boosts?listing=${listing.id}`);
                            }}
                          >
                            <Rocket className="mr-2 h-4 w-4" />
                            Boost / Feature
                          </DropdownMenuItem>
                        )}
                        {listing.status === 'active' && (
                          <AlertDialog open={listingToSell === listing.id} onOpenChange={(open) => {
                            if (!open) {
                              setListingToSell(null);
                            }
                          }}>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(e) => {
                                  e.preventDefault();
                                  setListingToSell(listing.id);
                                }}
                                disabled={markSoldMutation.isPending}
                              >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Mark as Sold
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Mark Listing as Sold</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to mark &quot;{listing.title}&quot; as sold? It will be shown as sold to buyers.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setListingToSell(null)}>
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => {
                                    if (listingToSell) {
                                      markSoldMutation.mutate(listingToSell);
                                      setListingToSell(null);
                                    }
                                  }}
                                  disabled={markSoldMutation.isPending}
                                  className="bg-emerald-600 hover:bg-emerald-700"
                                >
                                  {markSoldMutation.isPending ? (
                                    <>
                                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                      Updating...
                                    </>
                                  ) : (
                                    'Yes, Mark Sold'
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              className="text-red-600"
                              onSelect={(e) => e.preventDefault()}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Listing</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove &quot;{listing.title}&quot; from your listings?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRemove(listing.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                {removeMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  'Remove'
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredListings.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No listings found</h3>
              <p className="text-muted-foreground text-center max-w-sm">
                {listings.length === 0
                  ? "You haven't created any listings yet."
                  : 'No listings match your filters.'}
              </p>
              {listings.length === 0 && (
                <Link href="/dashboard/listings/create">
                  <Button className="mt-4">Create Your First Listing</Button>
                </Link>
              )}
            </div>
          )}

          {/* Pagination */}
          {pagination && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Showing {((pagination.currentPage || pagination.page || 1) - 1) * (pagination.itemsPerPage || pagination.limit || 12) + 1} to{' '}
                {Math.min((pagination.currentPage || pagination.page || 1) * (pagination.itemsPerPage || pagination.limit || 12), pagination.totalItems || pagination.total || 0)} of{' '}
                {pagination.totalItems || pagination.total || 0} listings
              </p>
              {pagination.totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || isLoading}
                  >
                    Previous
                  </Button>

                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                    {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                      let pageNum: number;
                      const currentPage = pagination.currentPage || pagination.page || page;
                      const totalPages = pagination.totalPages;

                      // Show pages around current page
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant="outline"
                          size="sm"
                          className={cn(
                            page === pageNum && 'bg-amber-500 text-white hover:bg-amber-600'
                          )}
                          onClick={() => setPage(pageNum)}
                          disabled={isLoading}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  {pagination.totalPages > 5 && (
                    <>
                      <span className="px-2 text-muted-foreground">...</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(pagination.totalPages)}
                        disabled={isLoading}
                      >
                        {pagination.totalPages}
                      </Button>
                    </>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={page === pagination.totalPages || (!pagination.hasNextPage && !pagination.hasMore) || isLoading}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
