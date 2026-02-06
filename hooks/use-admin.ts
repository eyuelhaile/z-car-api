'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { User, Listing } from '@/types';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/error-utils';

// ============================================
// Admin Query Keys
// ============================================
export const adminKeys = {
  all: ['admin'] as const,
  users: (filters?: any) =>
    filters
      ? ([...adminKeys.all, 'users', filters] as const)
      : ([...adminKeys.all, 'users'] as const),
  userById: (id: string) => [...adminKeys.all, 'users', id] as const,
  usersByCategory: () => [...adminKeys.all, 'users', 'categories'] as const,
  listings: (filters?: any) =>
    filters
      ? ([...adminKeys.all, 'listings', filters] as const)
      : ([...adminKeys.all, 'listings'] as const),
  pendingListings: (filters?: any) =>
    filters
      ? ([...adminKeys.all, 'listings', 'pending', filters] as const)
      : ([...adminKeys.all, 'listings', 'pending'] as const),
  reports: (filters?: any) =>
    filters
      ? ([...adminKeys.all, 'reports', filters] as const)
      : ([...adminKeys.all, 'reports'] as const),
  analytics: () => [...adminKeys.all, 'analytics'] as const,
};

// ============================================
// Admin Users Hooks
// ============================================
export function useAdminUsers(filters?: {
  role?: string;
  isVerified?: boolean;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}) {
  return useQuery({
    queryKey: adminKeys.users(filters),
    queryFn: async () => {
      const response = await api.getAdminUsers(filters);
      // API returns: { success, message, data: User[], pagination: {...} }
      // Return both data and pagination
      return {
        data: response.data || [],
        pagination: (response as any).pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 20,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useAdminUsersByCategory() {
  return useQuery({
    queryKey: adminKeys.usersByCategory(),
    queryFn: async () => {
      const response = await api.getAdminUsersByCategory();
      return response.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useAdminUserById(id: string) {
  return useQuery({
    queryKey: adminKeys.userById(id),
    queryFn: async () => {
      const response = await api.getAdminUserById(id);
      return response.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { 
      id: string; 
      data: { 
        role?: string; 
        isVerified?: boolean; 
        isActive?: boolean;
        subscriptionPlan?: string;
        emailVerifiedAt?: string;
        phoneVerifiedAt?: string;
      } 
    }) => {
      const response = await api.updateAdminUser(id, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
      queryClient.invalidateQueries({ queryKey: adminKeys.userById(variables.id) });
      queryClient.invalidateQueries({ queryKey: adminKeys.usersByCategory() });
      toast.success('User updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update user', {
        description: getApiErrorMessage(error, 'Please try again.'),
      });
    },
  });
}

// ============================================
// Admin Listings Hooks
// ============================================
export function useAdminListings(filters?: {
  page?: number;
  limit?: number;
  type?: 'vehicle' | 'property';
  status?: 'draft' | 'pending' | 'active' | 'sold' | 'expired' | 'rejected';
  isFeatured?: boolean;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  city?: string;
  region?: string;
  userId?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}) {
  return useQuery({
    queryKey: adminKeys.listings(filters),
    queryFn: async () => {
      const response = await api.getAdminListings(filters);
      // API returns: { success, message, data: Listing[], pagination: {...} }
      return {
        data: response.data || [],
        pagination: (response as any).pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 20,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    },
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useAdminPendingListings(filters?: {
  page?: number;
  limit?: number;
  search?: string;
  type?: 'vehicle' | 'property';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  return useQuery({
    queryKey: adminKeys.pendingListings(filters),
    queryFn: async () => {
      const response = await api.getAdminPendingListings(filters);
      // API returns: { success, data: { data: Listing[], pagination: {...} } }
      // So response.data is { data: Listing[], pagination: {...} }
      return response.data;
    },
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useApproveAdminListing() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.approveAdminListing(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.pendingListings() });
      queryClient.invalidateQueries({ queryKey: adminKeys.listings() });
      toast.success('Listing approved successfully');
    },
    onError: (error) => {
      toast.error('Failed to approve listing', {
        description: getApiErrorMessage(error, 'Please try again.'),
      });
    },
  });
}

export function useReapproveAdminListing() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.reapproveAdminListing(id);
      return response.data;
    },
    onSuccess: async () => {
      // Invalidate and refetch all listings queries (matches any query starting with the key)
      await queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey;
          return (
            Array.isArray(key) &&
            key.length >= 2 &&
            key[0] === 'admin' &&
            (key[1] === 'listings')
          );
        },
        refetchType: 'active'
      });
      toast.success('Listing reapproved successfully');
    },
    onError: (error) => {
      toast.error('Failed to reapprove listing', {
        description: getApiErrorMessage(error, 'Please try again.'),
      });
    },
  });
}

export function useRejectAdminListing() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await api.rejectAdminListing(id, reason);
      return response.data;
    },
    onSuccess: async () => {
      // Invalidate and refetch all listings queries (matches any query starting with the key)
      await queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey;
          return (
            Array.isArray(key) &&
            key.length >= 2 &&
            key[0] === 'admin' &&
            (key[1] === 'listings')
          );
        },
        refetchType: 'active'
      });
      toast.success('Listing denied successfully');
    },
    onError: (error) => {
      toast.error('Failed to deny listing', {
        description: getApiErrorMessage(error, 'Please try again.'),
      });
    },
  });
}

export function useBlockAdminListing() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await api.blockAdminListing(id, reason);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.listings() });
      queryClient.invalidateQueries({ queryKey: adminKeys.pendingListings() });
      toast.success('Listing blocked successfully');
    },
    onError: (error) => {
      toast.error('Failed to block listing', {
        description: getApiErrorMessage(error, 'Please try again.'),
      });
    },
  });
}

export function useUnblockAdminListing() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.unblockAdminListing(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.listings() });
      toast.success('Listing unblocked successfully');
    },
    onError: (error) => {
      toast.error('Failed to unblock listing', {
        description: getApiErrorMessage(error, 'Please try again.'),
      });
    },
  });
}

export function useFeatureAdminListing() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.featureAdminListing(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.listings() });
      toast.success('Listing featured successfully');
    },
    onError: (error) => {
      toast.error('Failed to feature listing', {
        description: getApiErrorMessage(error, 'Please try again.'),
      });
    },
  });
}

// ============================================
// Admin Reports Hooks
// ============================================
export function useAdminReports(filters?: {
  entityType?: 'listing' | 'user';
  status?: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  return useQuery({
    queryKey: adminKeys.reports(filters),
    queryFn: async () => {
      const response = await api.getAdminReports(filters);
      // Response structure: { data: [], pagination: {}, summary: {} }
      return response.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useAdminReportStats() {
  return useQuery({
    queryKey: [...adminKeys.reports(), 'stats'],
    queryFn: async () => {
      const response = await api.getAdminReportStats();
      return response.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useAdminReportById(reportId: string) {
  return useQuery({
    queryKey: [...adminKeys.reports(), reportId],
    queryFn: async () => {
      const response = await api.getAdminReportById(reportId);
      return response.data;
    },
    enabled: !!reportId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useAssignAdminReport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ reportId, assignedTo }: { reportId: string; assignedTo: string }) => {
      const response = await api.assignAdminReport(reportId, assignedTo);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.reports() });
      toast.success('Report assigned successfully');
    },
    onError: (error) => {
      toast.error('Failed to assign report', {
        description: getApiErrorMessage(error, 'Please try again.'),
      });
    },
  });
}

export function useResolveAdminReport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { action: string; notes?: string } }) => {
      await api.resolveAdminReport(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.reports() });
      toast.success('Report resolved');
    },
    onError: (error) => {
      toast.error('Failed to resolve report', {
        description: getApiErrorMessage(error, 'Please try again.'),
      });
    },
  });
}

export function useDismissAdminReport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (reportId: string) => {
      await api.dismissAdminReport(reportId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.reports() });
      toast.success('Report dismissed');
    },
    onError: (error) => {
      toast.error('Failed to dismiss report', {
        description: getApiErrorMessage(error, 'Please try again.'),
      });
    },
  });
}

// ============================================
// Admin Analytics Hooks
// ============================================
export function useAdminAnalytics() {
  return useQuery({
    queryKey: adminKeys.analytics(),
    queryFn: async () => {
      const response = await api.getAdminAnalytics();
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes (matches API cache)
  });
}

