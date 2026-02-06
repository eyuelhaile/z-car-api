'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Bell,
  BellOff,
  Trash2,
  ExternalLink,
  Car,
  Home,
  Loader2,
  Plus,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
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
import { cn } from '@/lib/utils';
import { useSavedSearches, useDeleteSavedSearch } from '@/hooks/use-dashboard';
import { SavedSearch } from '@/types';
import { formatDistanceToNow } from 'date-fns';

export default function SavedSearchesPage() {
  const { data: savedSearches, isLoading } = useSavedSearches();
  const deleteMutation = useDeleteSavedSearch();

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const buildSearchUrl = (search: SavedSearch) => {
    const filters = search.filters as Record<string, any>;
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value));
      }
    });

    const type = filters.type || 'vehicle';
    return `/${type === 'vehicle' ? 'vehicles' : 'properties'}?${params.toString()}`;
  };

  const getFilterSummary = (filters: Record<string, any>) => {
    const parts: string[] = [];
    
    if (filters.make) parts.push(filters.make);
    if (filters.model) parts.push(filters.model);
    if (filters.propertyType) parts.push(filters.propertyType);
    if (filters.city) parts.push(filters.city);
    if (filters.minPrice || filters.maxPrice) {
      const min = filters.minPrice ? `${(filters.minPrice / 1000000).toFixed(1)}M` : '0';
      const max = filters.maxPrice ? `${(filters.maxPrice / 1000000).toFixed(1)}M` : '∞';
      parts.push(`${min} - ${max} ETB`);
    }
    if (filters.minBedrooms) parts.push(`${filters.minBedrooms}+ beds`);
    if (filters.minYear || filters.maxYear) {
      const min = filters.minYear || 'Any';
      const max = filters.maxYear || 'Any';
      parts.push(`${min} - ${max}`);
    }
    
    return parts.length > 0 ? parts.join(' • ') : 'All listings';
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
            <Search className="h-8 w-8" />
            Saved Searches
          </h1>
          <p className="text-muted-foreground mt-1">
            Get notified when new listings match your criteria
          </p>
        </div>
        <Link href="/vehicles">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Search
          </Button>
        </Link>
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <p className="text-sm text-blue-800">
            <strong>💡 Tip:</strong> When browsing listings, use the filters and click &quot;Save Search&quot; 
            to create a saved search. You&apos;ll be notified when new listings match your criteria.
          </p>
        </CardContent>
      </Card>

      {/* Saved Searches List */}
      {(savedSearches || []).length > 0 ? (
        <div className="grid gap-4">
          {savedSearches?.map((search) => {
            const filters = search.filters as Record<string, any>;
            const isVehicle = filters.type === 'vehicle';

            return (
              <Card key={search.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        'p-3 rounded-full shrink-0',
                        isVehicle ? 'bg-amber-100' : 'bg-emerald-100'
                      )}
                    >
                      {isVehicle ? (
                        <Car className={cn('h-6 w-6', 'text-amber-600')} />
                      ) : (
                        <Home className={cn('h-6 w-6', 'text-emerald-600')} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-lg">{search.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {getFilterSummary(filters)}
                          </p>
                        </div>
                        {search.matchCount !== undefined && search.matchCount > 0 && (
                          <Badge className="bg-amber-500">
                            {search.matchCount} match{search.matchCount !== 1 ? 'es' : ''}
                          </Badge>
                        )}
                      </div>

                      {/* Filter Tags */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant="outline" className="text-xs">
                          <Filter className="h-3 w-3 mr-1" />
                          {isVehicle ? 'Vehicles' : 'Properties'}
                        </Badge>
                        {filters.city && (
                          <Badge variant="outline" className="text-xs">
                            {filters.city}
                          </Badge>
                        )}
                        {filters.make && (
                          <Badge variant="outline" className="text-xs">
                            {filters.make}
                          </Badge>
                        )}
                        {filters.propertyType && (
                          <Badge variant="outline" className="text-xs">
                            {filters.propertyType}
                          </Badge>
                        )}
                      </div>

                      {/* Meta Info */}
                      <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                        <span>
                          Created{' '}
                          {search.createdAt
                            ? formatDistanceToNow(new Date(search.createdAt), { addSuffix: true })
                            : ''}
                        </span>
                        {search.lastMatchedAt && (
                          <span>
                            Last match{' '}
                            {formatDistanceToNow(new Date(search.lastMatchedAt), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-2 mr-4">
                        {search.notifyEmail || search.notifyPush ? (
                          <Bell className="h-4 w-4 text-amber-500" />
                        ) : (
                          <BellOff className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-sm text-muted-foreground">
                          {search.notifyEmail || search.notifyPush ? 'Alerts on' : 'Alerts off'}
                        </span>
                      </div>

                      <Link href={buildSearchUrl(search)}>
                        <Button variant="outline" size="sm" className="gap-1">
                          <ExternalLink className="h-4 w-4" />
                          View
                        </Button>
                      </Link>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Saved Search?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete &quot;{search.name}&quot;? You will stop receiving 
                              notifications for this search.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(search.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              {deleteMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                'Delete'
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No saved searches yet</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              Save your favorite search criteria to get notified when new listings match.
            </p>
            <Link href="/vehicles">
              <Button className="mt-4">Start Searching</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

