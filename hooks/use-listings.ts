'use client';

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ListingFilters, Listing, CreateListingRequest } from '@/types';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/error-utils';

// Query keys
export const listingKeys = {
  all: ['listings'] as const,
  lists: () => [...listingKeys.all, 'list'] as const,
  list: (filters: ListingFilters) => [...listingKeys.lists(), filters] as const,
  featured: (type?: 'vehicle' | 'property', limit?: number) => [...listingKeys.all, 'featured', { type, limit }] as const,
  details: () => [...listingKeys.all, 'detail'] as const,
  detail: (id: string) => [...listingKeys.details(), id] as const,
  slug: (slug: string) => [...listingKeys.details(), 'slug', slug] as const,
  my: (status?: string) => [...listingKeys.all, 'my', { status }] as const,
};

// Hook to get paginated listings with filters
export function useListings(filters: ListingFilters = {}) {
  return useQuery({
    queryKey: listingKeys.list(filters),
    queryFn: async () => {
      const response = await api.getListings(filters);
      return response;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Hook for infinite scroll listings
export function useInfiniteListings(filters: Omit<ListingFilters, 'page'> = {}) {
  return useInfiniteQuery({
    queryKey: [...listingKeys.lists(), 'infinite', filters] as const,
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.getListings({ ...filters, page: pageParam });
      return response;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.hasMore) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 2,
  });
}

// Hook to get featured listings
export function useFeaturedListings(type?: 'vehicle' | 'property', limit: number = 8) {
  return useQuery({
    queryKey: listingKeys.featured(type, limit),
    queryFn: async () => {
      const response = await api.getFeaturedListings(type, limit);
      return response.data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook to get latest listings
export function useLatestListings(type?: 'vehicle' | 'property', limit: number = 10) {
  return useQuery({
    queryKey: ['listings', 'latest', { type, limit }],
    queryFn: async () => {
      const response = await api.getLatestListings(type, limit);
      return response.data || [];
    },
    staleTime: 1000 * 60 * 2, // 2 minutes - more frequent updates for latest listings
  });
}

// Hook to get a single listing by ID
export function useListing(id: string) {
  return useQuery({
    queryKey: listingKeys.detail(id),
    queryFn: async () => {
      const response = await api.getListing(id);
      return response.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

// Hook to get a single listing by slug
export function useListingBySlug(slug: string) {
  return useQuery({
    queryKey: listingKeys.slug(slug),
    queryFn: async () => {
      const response = await api.getListingBySlug(slug);
      return response.data;
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });
}

// Hook to get user's own listings
export function useMyListings(status?: string, page?: number, limit?: number) {
  return useQuery({
    queryKey: listingKeys.my(status),
    queryFn: async () => {
      const response = await api.getMyListings(status, page, limit);
      return response;
    },
    staleTime: 1000 * 60 * 2,
  });
}

// Hook to create a listing
export function useCreateListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateListingRequest | Partial<Listing>) => {
      const response = await api.createListing(data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate all listing queries to refresh data
      queryClient.invalidateQueries({ queryKey: listingKeys.all });
      // Specifically invalidate my listings to refresh dashboard
      queryClient.invalidateQueries({ queryKey: listingKeys.my() });
      // Invalidate lists to refresh homepage and listing pages
      queryClient.invalidateQueries({ queryKey: listingKeys.lists() });
      // Invalidate latest listings (though it won't show until published)
      queryClient.invalidateQueries({ queryKey: ['listings', 'latest'] });
      toast.success('Listing created successfully!', {
        description: 'Your listing has been submitted for review.',
      });
    },
    onError: (error) => {
      toast.error('Failed to create listing', {
        description: getApiErrorMessage(error, 'Please try again.'),
      });
    },
  });
}

// Hook to update a listing
export function useUpdateListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Listing> }) => {
      const response = await api.updateListing(id, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: listingKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: listingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: listingKeys.my() });
      toast.success('Listing updated successfully!');
    },
    onError: (error) => {
      toast.error('Failed to update listing', {
        description: getApiErrorMessage(error, 'Please try again.'),
      });
    },
  });
}

// Hook to publish a listing (seller)
export function usePublishListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.publishListing(id);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: listingKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: listingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: listingKeys.my() });
      // Invalidate latest listings to update homepage
      queryClient.invalidateQueries({ queryKey: ['listings', 'latest'] });
      toast.success('Listing published successfully!', {
        description: 'Your listing is now active and visible to buyers.',
      });
    },
    onError: (error) => {
      toast.error('Failed to publish listing', {
        description: getApiErrorMessage(error, 'Please try again.'),
      });
    },
  });
}

// Hook to approve a listing (admin)
export function useApproveListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.approveListing(id);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: listingKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: listingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: listingKeys.my() });
      toast.success('Listing approved successfully!');
    },
    onError: (error) => {
      toast.error('Failed to approve listing', {
        description: getApiErrorMessage(error, 'Please try again.'),
      });
    },
  });
}

// Hook to feature a listing (admin)
export function useFeatureListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, durationDays }: { id: string; durationDays: number }) => {
      const response = await api.featureListing(id, durationDays);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: listingKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: listingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: listingKeys.my() });
      toast.success('Listing featured successfully!');
    },
    onError: (error) => {
      toast.error('Failed to feature listing', {
        description: getApiErrorMessage(error, 'Please try again.'),
      });
    },
  });
}

// Hook to delete a listing
export function useDeleteListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.deleteListing(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listingKeys.all });
      toast.success('Listing deleted successfully!');
    },
    onError: (error) => {
      toast.error('Failed to delete listing', {
        description: getApiErrorMessage(error, 'Please try again.'),
      });
    },
  });
}

// Hook to mark a listing as sold
export function useMarkListingSold() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.markListingSold(id);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: listingKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: listingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: listingKeys.my() });
      toast.success('Listing marked as sold!');
    },
    onError: (error) => {
      toast.error('Failed to mark listing as sold', {
        description: getApiErrorMessage(error, 'Please try again.'),
      });
    },
  });
}

// Hook to remove a listing from user's listings
export function useRemoveListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.removeListing(id);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: listingKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: listingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: listingKeys.my() });
      queryClient.invalidateQueries({ queryKey: listingKeys.all });
      toast.success('Listing removed successfully!');
    },
    onError: (error) => {
      toast.error('Failed to remove listing', {
        description: getApiErrorMessage(error, 'Please try again.'),
      });
    },
  });
}

// Hook to upload a single image (returns image URL)
// Use this BEFORE creating/updating listings
export function useUploadImage() {
  return useMutation({
    mutationFn: async ({ file, folder, watermark }: { file: File; folder?: string; watermark?: string }) => {
      const response = await api.uploadImage(file, folder, watermark);
      return response.data; // Returns image object with URLs
    },
    onError: (error) => {
      toast.error('Failed to upload image', {
        description: getApiErrorMessage(error, 'Please try again.'),
      });
    },
  });
}

// Hook to upload multiple images (returns image URLs)
// Use this BEFORE creating/updating listings
export function useUploadImages() {
  return useMutation({
    mutationFn: async ({ files, folder }: { files: File[]; folder?: string }) => {
      const response = await api.uploadImages(files, folder);
      return response.data; // Returns array of image objects with URLs
    },
    onError: (error) => {
      toast.error('Failed to upload images', {
        description: getApiErrorMessage(error, 'Please try again.'),
      });
    },
  });
}

// Hook for favorites
export function useFavorites() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const response = await api.getFavorites();
      return response.data || [];
    },
    staleTime: 1000 * 60 * 2,
    refetchOnMount: true, // Always refetch when component mounts for fresh data
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ listingId, isFavorited }: { listingId: string; isFavorited: boolean }) => {
      if (isFavorited) {
        await api.removeFavorite(listingId);
      } else {
        await api.addFavorite(listingId);
      }
      return { listingId, newState: !isFavorited };
    },
    onSuccess: () => {
      // Invalidate both query keys used for favorites
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'favorites'] });
      queryClient.invalidateQueries({ queryKey: listingKeys.all });
    },
  });
}

// Hook to get boost pricing
export function useBoostPricing() {
  return useQuery({
    queryKey: ['boosts', 'pricing'],
    queryFn: async () => {
      const response = await api.getBoostPricing();
      return response.data || [];
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

// Hook to create a boost (feature listing)
export function useCreateBoost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      listingId: string;
      type: 'featured' | 'top_search' | 'homepage' | 'category_top' | 'urgent' | 'highlight';
      durationDays: number;
      paymentMethod: 'subscription' | 'wallet' | 'telebirr' | 'mpesa';
      autoRenew?: boolean;
    }) => {
      const response = await api.createBoost(data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: listingKeys.detail(variables.listingId) });
      queryClient.invalidateQueries({ queryKey: listingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: listingKeys.my() });
      queryClient.invalidateQueries({ queryKey: ['boosts'] });
      toast.success('Listing boosted successfully!', {
        description: 'Your listing is now featured.',
      });
    },
    onError: (error) => {
      toast.error('Failed to boost listing', {
        description: getApiErrorMessage(error, 'Please try again.'),
      });
    },
  });
}
