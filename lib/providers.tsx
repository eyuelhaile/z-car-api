'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { Toaster } from '@/components/ui/sonner';
import { useAuthStore, useFavoritesStore, useBadgeCountsStore } from '@/lib/store';
import api from '@/lib/api';

// Badge counts polling interval (30 seconds)
const BADGE_COUNTS_POLL_INTERVAL = 30 * 1000;

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { token, isAuthenticated, setUser, setLoading, logout } = useAuthStore();
  const { setFavorites, clearFavorites } = useFavoritesStore();
  const { setCounts, clearCounts, setLoading: setBadgeLoading } = useBadgeCountsStore();
  const hasInitialized = useRef(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch badge counts
  const fetchBadgeCounts = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await api.getBadgeCounts();
      if (response.success && response.data?.data?.counts) {
        setCounts(response.data.data.counts);
      }
    } catch {
      // Silently fail badge count fetches
    }
  }, [token, setCounts]);

  // Start polling for badge counts
  const startBadgePolling = useCallback(() => {
    // Clear any existing interval
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    
    // Fetch immediately
    fetchBadgeCounts();
    
    // Set up polling
    pollIntervalRef.current = setInterval(fetchBadgeCounts, BADGE_COUNTS_POLL_INTERVAL);
  }, [fetchBadgeCounts]);

  // Stop polling
  const stopBadgePolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Skip auth initialization on OAuth callback pages - they handle their own auth
    const isAuthCallback = pathname?.includes('/auth/success') || pathname?.includes('/oauth/callback');
    if (isAuthCallback) {
      setLoading(false);
      return;
    }

    // Only run initialization once per session (unless token changes from null to something)
    const initAuth = async () => {
      if (token) {
        api.setToken(token);
        
        // If we already have a user, don't re-fetch unless the token changed
        if (hasInitialized.current) {
          setLoading(false);
          return;
        }
        
        try {
          const response = await api.getMe();
          if (response.success) {
            setUser(response.data);
            hasInitialized.current = true;
            
            // Fetch and sync favorites from API
            try {
              const favoritesResponse = await api.getFavorites();
              if (favoritesResponse.success && favoritesResponse.data) {
                const favoriteIds = favoritesResponse.data.map(fav => fav.listing.id);
                setFavorites(favoriteIds);
              }
            } catch {
              // Ignore favorites fetch errors
            }

            // Start polling for badge counts
            startBadgePolling();
          } else {
            logout();
            clearFavorites();
            clearCounts();
            stopBadgePolling();
            hasInitialized.current = false;
          }
        } catch {
          logout();
          clearFavorites();
          clearCounts();
          stopBadgePolling();
          hasInitialized.current = false;
        }
      } else {
        hasInitialized.current = false;
        stopBadgePolling();
      }
      setLoading(false);
    };

    initAuth();

    // Cleanup on unmount
    return () => {
      stopBadgePolling();
    };
  }, [token, pathname, setUser, setLoading, logout, setFavorites, clearFavorites, setCounts, clearCounts, startBadgePolling, stopBadgePolling]);

  // Clear data when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      clearFavorites();
      clearCounts();
      stopBadgePolling();
    }
  }, [isAuthenticated, clearFavorites, clearCounts, stopBadgePolling]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </AuthInitializer>
    </QueryClientProvider>
  );
}

