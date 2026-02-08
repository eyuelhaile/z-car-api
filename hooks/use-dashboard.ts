'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import api from '@/lib/api';
import { useBadgeCountsStore } from '@/lib/store';
import {
  Conversation,
  Message,
  Notification,
  Appointment,
  SavedSearch,
  Comparison,
  SubscriptionPlanDetails,
  UserSubscription,
  Wallet,
  WalletTransaction,
  BoostOption,
  Boost,
  DashboardAnalytics,
  ListingAnalytics,
  AnalyticsOverview,
  Favorite,
  BadgeCounts,
} from '@/types';

// ============================================
// Query Keys
// ============================================
export const dashboardKeys = {
  all: ['dashboard'] as const,
  badgeCounts: () => [...dashboardKeys.all, 'badgeCounts'] as const,
  conversations: () => [...dashboardKeys.all, 'conversations'] as const,
  messages: (conversationId: string) => [...dashboardKeys.all, 'messages', conversationId] as const,
  notifications: () => [...dashboardKeys.all, 'notifications'] as const,
  appointments: (status?: string, role?: 'buyer' | 'seller') => [...dashboardKeys.all, 'appointments', { status, role }] as const,
  savedSearches: () => [...dashboardKeys.all, 'savedSearches'] as const,
  comparisons: () => [...dashboardKeys.all, 'comparisons'] as const,
  favorites: () => [...dashboardKeys.all, 'favorites'] as const,
  subscriptionPlans: () => [...dashboardKeys.all, 'subscriptionPlans'] as const,
  mySubscription: () => [...dashboardKeys.all, 'mySubscription'] as const,
  wallet: () => [...dashboardKeys.all, 'wallet'] as const,
  walletTransactions: () => [...dashboardKeys.all, 'walletTransactions'] as const,
  boostOptions: () => [...dashboardKeys.all, 'boostOptions'] as const,
  myBoosts: () => [...dashboardKeys.all, 'myBoosts'] as const,
  analytics: () => [...dashboardKeys.all, 'analytics'] as const,
  listingAnalytics: (listingId: string, period?: string) => [...dashboardKeys.all, 'listingAnalytics', listingId, period] as const,
};

// ============================================
// Badge Counts Hook
// ============================================
export function useBadgeCounts(enabled: boolean = true) {
  const { setCounts } = useBadgeCountsStore();
  
  return useQuery({
    queryKey: dashboardKeys.badgeCounts(),
    queryFn: async (): Promise<BadgeCounts> => {
      const response = await api.getBadgeCounts();
      const counts = response.data?.data?.counts;
      if (counts) {
        setCounts(counts);
      }
      return counts || { notifications: 0, messages: 0, appointments: 0, favorites: 0, total: 0 };
    },
    enabled,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 15000, // Consider data stale after 15 seconds
  });
}

// Hook to manually refresh badge counts
export function useRefreshBadgeCounts() {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: dashboardKeys.badgeCounts() });
  };
}

// ============================================
// Conversations & Messages Hooks
// ============================================
export function useConversations() {
  return useQuery({
    queryKey: dashboardKeys.conversations(),
    queryFn: async () => {
      const response = await api.getConversations();
      // API returns { conversations: [], pagination: {...} }
      return response.data?.conversations || [];
    },
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useMessages(conversationId: string, page?: number, limit?: number) {
  return useQuery({
    queryKey: dashboardKeys.messages(conversationId),
    queryFn: async () => {
      const response = await api.getMessages(conversationId, page, limit);
      return response.data;
    },
    enabled: !!conversationId,
    staleTime: 0, // Always consider stale to ensure fresh data
    gcTime: 1000 * 60, // Keep in cache for 1 minute
    refetchInterval: 1000 * 10, // Poll every 10 seconds for new messages
    refetchOnMount: 'always', // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: string; content: string }) => {
      const response = await api.sendMessage(conversationId, content);
      return response;
    },
    onSuccess: (_, variables) => {
      // Just invalidate to trigger refetch - simple and reliable
      queryClient.invalidateQueries({ queryKey: dashboardKeys.messages(variables.conversationId) });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.conversations() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.badgeCounts() });
    },
  });
}

export function useStartConversation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ listingId, receiverId, message }: { listingId: string; receiverId: string; message: string }) => {
      const response = await api.startConversation(listingId, receiverId, message);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.conversations() });
    },
  });
}

export function useMarkConversationRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (conversationId: string) => {
      await api.markConversationRead(conversationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.conversations() });
      // Also refresh badge counts since unread count changed
      queryClient.invalidateQueries({ queryKey: dashboardKeys.badgeCounts() });
    },
  });
}

// ============================================
// Notifications Hooks
// ============================================
export function useNotifications(unreadOnly?: boolean, page?: number, limit?: number) {
  return useQuery({
    queryKey: [...dashboardKeys.notifications(), { unreadOnly, page, limit }],
    queryFn: async () => {
      const response = await api.getNotifications(unreadOnly, page, limit);
      return response.data;
    },
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (notificationId: string) => {
      await api.markNotificationRead(notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.notifications() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.badgeCounts() });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      await api.markAllNotificationsRead();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.notifications() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.badgeCounts() });
    },
  });
}

// ============================================
// Appointments Hooks
// ============================================
export function useAppointments(status?: string, role?: 'buyer' | 'seller') {
  return useQuery({
    queryKey: dashboardKeys.appointments(status, role),
    queryFn: async () => {
      const response = await api.getAppointments(status, role);
      // API may return either:
      // - an array of appointments directly, or
      // - an object: { success, message, data: [appointments...] }
      if (Array.isArray(response)) return response;
      if (response?.data && Array.isArray(response.data)) return response.data;
      // Fallback: sometimes API nests under 'appointments' or returns null
      const responseAny = response as any;
      if (responseAny?.appointments && Array.isArray(responseAny.appointments)) {
        return responseAny.appointments;
      }
      return [];
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useBookAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      listingId: string;
      scheduledAt: string;
      durationMinutes: number;
      location: string;
      notes?: string;
    }) => {
      const response = await api.bookAppointment(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.appointments() });
    },
  });
}

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await api.updateAppointmentStatus(id, status);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.appointments() });
    },
  });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await api.cancelAppointment(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.appointments() });
    },
  });
}

// ============================================
// Favorites Hooks
// ============================================
export function useFavorites() {
  return useQuery({
    queryKey: dashboardKeys.favorites(),
    queryFn: async () => {
      const response = await api.getFavorites();
      return response.data || [];
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnMount: true, // Always refetch when component mounts for fresh data
  });
}

export function useAddFavorite() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (listingId: string) => {
      await api.addFavorite(listingId);
    },
    onSuccess: () => {
      // Invalidate both query keys used for favorites
      queryClient.invalidateQueries({ queryKey: dashboardKeys.favorites() });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.badgeCounts() });
    },
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (listingId: string) => {
      await api.removeFavorite(listingId);
    },
    onSuccess: () => {
      // Invalidate both query keys used for favorites
      queryClient.invalidateQueries({ queryKey: dashboardKeys.favorites() });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.badgeCounts() });
    },
  });
}

// ============================================
// Saved Searches Hooks
// ============================================
export function useSavedSearches() {
  return useQuery({
    queryKey: dashboardKeys.savedSearches(),
    queryFn: async () => {
      const response = await api.getSavedSearches();
      return response.data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCreateSavedSearch() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      name: string;
      filters: Record<string, unknown>;
      notifyEnabled: boolean;
      notifyFrequency: 'daily' | 'weekly' | 'instant';
    }) => {
      const response = await api.createSavedSearch(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.savedSearches() });
    },
  });
}

export function useDeleteSavedSearch() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await api.deleteSavedSearch(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.savedSearches() });
    },
  });
}

// ============================================
// Comparisons Hooks
// ============================================
export function useComparisons() {
  return useQuery({
    queryKey: dashboardKeys.comparisons(),
    queryFn: async () => {
      const response = await api.getComparisons();
      return response.data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useCreateComparison() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ name, listingIds }: { name: string; listingIds: string[] }) => {
      const response = await api.createComparison(name, listingIds);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.comparisons() });
    },
  });
}

export function useAddToComparison() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ comparisonId, listingId }: { comparisonId: string; listingId: string }) => {
      await api.addToComparison(comparisonId, listingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.comparisons() });
    },
  });
}

export function useRemoveFromComparison() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ comparisonId, listingId }: { comparisonId: string; listingId: string }) => {
      await api.removeFromComparison(comparisonId, listingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.comparisons() });
    },
  });
}

// Comparison Cart Hooks
export function useComparisonCart(type: 'vehicle' | 'property', enabled: boolean = true) {
  return useQuery({
    queryKey: ['comparison-cart', type],
    queryFn: async () => {
      const response = await api.getComparisonCart(type);
      return response.data;
    },
    enabled,
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useAddToComparisonCart() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (listingId: string) => {
      const response = await api.addToComparisonCart(listingId);
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate both vehicle and property carts to be safe
      queryClient.invalidateQueries({ queryKey: ['comparison-cart'] });
      return data;
    },
  });
}

export function useRemoveFromComparisonCart() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ listingId, type }: { listingId: string; type: 'vehicle' | 'property' }) => {
      await api.removeFromComparisonCart(listingId, type);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comparison-cart'] });
    },
  });
}

export function useClearComparisonCart() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (type: 'vehicle' | 'property') => {
      await api.clearComparisonCart(type);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comparison-cart'] });
    },
  });
}

// ============================================
// Subscription Hooks
// ============================================
export function useSubscriptionPlans() {
  return useQuery({
    queryKey: dashboardKeys.subscriptionPlans(),
    queryFn: async () => {
      const response = await api.getSubscriptionPlans();
      return response.data || [];
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

export function useMySubscription() {
  return useQuery({
    queryKey: dashboardKeys.mySubscription(),
    queryFn: async () => {
      const response = await api.getMySubscription();
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useSubscribe() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ planName, billingPeriod, paymentMethod, autoRenew }: { 
      planName: string;
      billingPeriod: 'monthly' | 'yearly';
      paymentMethod: string; 
      autoRenew: boolean;
    }) => {
      const response = await api.subscribe(planName, billingPeriod, paymentMethod, autoRenew);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.mySubscription() });
    },
  });
}

// ============================================
// Wallet Hooks
// ============================================
export function useWallet() {
  return useQuery({
    queryKey: dashboardKeys.wallet(),
    queryFn: async () => {
      const response = await api.getWallet();
      return response.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useWalletTransactions() {
  return useQuery({
    queryKey: dashboardKeys.walletTransactions(),
    queryFn: async () => {
      const response = await api.getWalletTransactions();
      return response.data || [];
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useTopUpWallet() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ amount, paymentMethod }: { amount: number; paymentMethod: string }) => {
      const response = await api.topUpWallet(amount, paymentMethod);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.wallet() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.walletTransactions() });
    },
  });
}

// ============================================
// Boost Hooks
// ============================================
export function useBoostOptions() {
  return useQuery({
    queryKey: dashboardKeys.boostOptions(),
    queryFn: async () => {
      const response = await api.getBoostOptions();
      return response.data || [];
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

export function useBoostPricing() {
  return useQuery({
    queryKey: [...dashboardKeys.boostOptions(), 'pricing'],
    queryFn: async () => {
      const response = await api.getBoostPricing();
      return response.data || [];
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

export function useBoostSubscriptionCredits() {
  return useQuery({
    queryKey: [...dashboardKeys.boostOptions(), 'subscription-credits'],
    queryFn: async () => {
      const response = await api.getBoostSubscriptionCredits();
      return response.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes - refresh frequently
  });
}

export function useCalculateBoostPrice() {
  return useMutation({
    mutationFn: async ({ type, durationDays }: { type: string; durationDays: number }) => {
      const response = await api.calculateBoostPrice(type, durationDays);
      return response.data;
    },
  });
}

export function useMyBoosts() {
  return useQuery({
    queryKey: dashboardKeys.myBoosts(),
    queryFn: async () => {
      const response = await api.getMyBoosts();
      return response.data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useBoostListing() {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.myBoosts() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.wallet() });
      queryClient.invalidateQueries({ queryKey: [...dashboardKeys.boostOptions(), 'subscription-credits'] });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.mySubscription() });
    },
  });
}

// ============================================
// Analytics Hooks
// ============================================
export function useDashboardAnalytics() {
  return useQuery({
    queryKey: dashboardKeys.analytics(),
    queryFn: async () => {
      const response = await api.getDashboardAnalytics();
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useListingAnalytics(listingId: string, period?: string) {
  return useQuery({
    queryKey: dashboardKeys.listingAnalytics(listingId, period),
    queryFn: async () => {
      const response = await api.getListingAnalytics(listingId, period);
      return response.data;
    },
    enabled: !!listingId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useAnalyticsOverview(period?: string) {
  return useQuery({
    queryKey: [...dashboardKeys.analytics(), 'overview', period],
    queryFn: async () => {
      const response = await api.getAnalyticsOverview(period);
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// ============================================
// External Payment (Soreti) Hooks
// ============================================

export interface SoretiPaymentService {
  id: string;
  name: string;
  type: string;
  vendor_type: string;
  icon_url: string | null;
}

export function useSoretiPaymentServices() {
  return useQuery({
    queryKey: ['soretiPaymentServices'],
    queryFn: async (): Promise<SoretiPaymentService[]> => {
      const res = await axios.get('http://pay.cheche.et/api/v1/payments/payment-services/SORETI');
      return res.data?.data || [];
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export async function createSoretiOrder(payload: {
  title: string;
  amount: number;
  userId: string;
  phoneNumber: string;
  paymentServiceId: string;
  transactionId?: string; // Optional: if provided, use this instead of generating one
}): Promise<string | null> {
  const transactionId = payload.transactionId || (
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  );

  // Use base API URL instead of hardcoded pay.cheche.et
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';
  
  const res = await axios.post(`${API_BASE_URL}/payments/createOrder`, {
    title: payload.title,
    paymentType: 'C2B',
    transaction_id: transactionId,
    user_id: payload.userId,
    amount: String(payload.amount),
    phone_number: payload.phoneNumber,
    // Pass selected payment service ID so backend/aggregator knows which config to use
    payment_service_id: payload.paymentServiceId,
  }, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('zcar_token') || ''}`,
      'Content-Type': 'application/json',
    },
  });

  // Response structure: { success: true, data: { url: "...", ... } }
  return res.data?.data?.url || null;
}


