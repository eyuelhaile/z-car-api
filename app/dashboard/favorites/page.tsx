'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, Grid3X3, List, Search, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { ListingCard } from '@/components/listings/listing-card';
import { cn } from '@/lib/utils';
import { useFavorites, useRemoveFavorite } from '@/hooks/use-dashboard';
import { Listing } from '@/types';

export default function FavoritesPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<'all' | 'vehicle' | 'property'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: favorites, isLoading } = useFavorites();
  const removeFavoriteMutation = useRemoveFavorite();

  // Favorites can return either Favorite[] with listing or Listing[] directly
  const listings: Listing[] = (favorites || []).map((fav: any) => fav.listing || fav);

  const filteredFavorites = listings.filter((item) => {
    if (filterType !== 'all' && item.type !== filterType) return false;
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleRemoveFavorite = (listingId: string) => {
    removeFavoriteMutation.mutate(listingId);
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32 mt-2" />
        </div>
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-[180px]" />
              <Skeleton className="h-10 w-20" />
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="aspect-[4/3] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
          <Heart className="h-8 w-8 text-red-500" />
          My Favorites
        </h1>
        <p className="text-muted-foreground mt-1">
          You have {listings.length} saved listing{listings.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search favorites..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={(v) => setFilterType(v as 'all' | 'vehicle' | 'property')}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="vehicle">Vehicles</SelectItem>
                <SelectItem value="property">Properties</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center border rounded-lg">
              <Button
                variant="ghost"
                size="icon"
                className={cn('rounded-r-none', viewMode === 'grid' && 'bg-muted')}
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn('rounded-l-none', viewMode === 'list' && 'bg-muted')}
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Favorites Grid */}
      {filteredFavorites.length > 0 ? (
        <div
          className={cn(
            'grid gap-6',
            viewMode === 'grid'
              ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
              : 'grid-cols-1'
          )}
        >
          {filteredFavorites.map((item) => (
            <div key={item.id} className="relative group">
              <ListingCard
                listing={item}
                variant={viewMode === 'list' ? 'horizontal' : 'default'}
              />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove from favorites?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to remove &quot;{item.title}&quot; from your favorites?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleRemoveFavorite(item.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {removeFavoriteMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Remove'
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Heart className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              {searchQuery || filterType !== 'all'
                ? 'No favorites match your search criteria.'
                : 'Start browsing listings and save your favorites to see them here.'}
            </p>
            <Link href="/vehicles">
              <Button className="mt-4">Browse Listings</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
