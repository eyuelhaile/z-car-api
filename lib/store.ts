import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Listing, VehicleMake, BodyType, FuelTypeRef, TransmissionRef, ColorRef, ConditionRef, PropertyTypeRef, AmenityRef, Region, City, PriceRange, YearRange, BadgeCounts } from '@/types';

// Auth Store
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      setLoading: (isLoading) => set({ isLoading }),
      login: (user, token) => set({ user, token, isAuthenticated: true, isLoading: false }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'zcar-auth',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);

// Reference Data Store
interface ReferenceDataState {
  // Vehicle data
  vehicleMakes: VehicleMake[];
  bodyTypes: BodyType[];
  fuelTypes: FuelTypeRef[];
  transmissions: TransmissionRef[];
  colors: ColorRef[];
  vehicleConditions: ConditionRef[];
  yearRanges: YearRange[];
  vehiclePriceRanges: PriceRange[];
  
  // Property data
  propertyTypes: PropertyTypeRef[];
  propertyConditions: ConditionRef[];
  amenities: AmenityRef[];
  propertyPriceRanges: PriceRange[];
  
  // Location data
  regions: Region[];
  cities: City[];
  popularCities: City[];
  
  // State
  isLoaded: boolean;
  
  // Actions
  setVehicleData: (data: {
    makes: VehicleMake[];
    bodyTypes: BodyType[];
    fuelTypes: FuelTypeRef[];
    transmissions: TransmissionRef[];
    colors: ColorRef[];
    conditions: ConditionRef[];
    yearRanges: YearRange[];
    priceRanges: PriceRange[];
  }) => void;
  setPropertyData: (data: {
    propertyTypes: PropertyTypeRef[];
    conditions: ConditionRef[];
    amenities: AmenityRef[];
    priceRanges: PriceRange[];
  }) => void;
  setLocationData: (data: {
    regions: Region[];
    popularCities: City[];
  }) => void;
  setCities: (cities: City[]) => void;
  setLoaded: (loaded: boolean) => void;
}

export const useReferenceDataStore = create<ReferenceDataState>()((set) => ({
  vehicleMakes: [],
  bodyTypes: [],
  fuelTypes: [],
  transmissions: [],
  colors: [],
  vehicleConditions: [],
  yearRanges: [],
  vehiclePriceRanges: [],
  propertyTypes: [],
  propertyConditions: [],
  amenities: [],
  propertyPriceRanges: [],
  regions: [],
  cities: [],
  popularCities: [],
  isLoaded: false,
  
  setVehicleData: (data) => set({
    vehicleMakes: data.makes,
    bodyTypes: data.bodyTypes,
    fuelTypes: data.fuelTypes,
    transmissions: data.transmissions,
    colors: data.colors,
    vehicleConditions: data.conditions,
    yearRanges: data.yearRanges,
    vehiclePriceRanges: data.priceRanges,
  }),
  
  setPropertyData: (data) => set({
    propertyTypes: data.propertyTypes,
    propertyConditions: data.conditions,
    amenities: data.amenities,
    propertyPriceRanges: data.priceRanges,
  }),
  
  setLocationData: (data) => set({
    regions: data.regions,
    popularCities: data.popularCities,
  }),
  
  setCities: (cities) => set({ cities }),
  setLoaded: (isLoaded) => set({ isLoaded }),
}));

// Favorites Store
interface FavoritesState {
  favorites: Set<string>;
  addFavorite: (listingId: string) => void;
  removeFavorite: (listingId: string) => void;
  isFavorite: (listingId: string) => boolean;
  setFavorites: (listingIds: string[]) => void;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: new Set<string>(),
      addFavorite: (listingId) => set((state) => ({
        favorites: new Set(state.favorites).add(listingId),
      })),
      removeFavorite: (listingId) => set((state) => {
        const newFavorites = new Set(state.favorites);
        newFavorites.delete(listingId);
        return { favorites: newFavorites };
      }),
      isFavorite: (listingId) => get().favorites.has(listingId),
      setFavorites: (listingIds) => set({ favorites: new Set(listingIds) }),
      clearFavorites: () => set({ favorites: new Set() }),
    }),
    {
      name: 'zcar-favorites',
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const { state } = JSON.parse(str);
          return {
            state: {
              ...state,
              favorites: new Set(state.favorites),
            },
          };
        },
        setItem: (name, value) => {
          const { state } = value;
          const serializedState = {
            state: {
              ...state,
              favorites: Array.from(state.favorites),
            },
          };
          localStorage.setItem(name, JSON.stringify(serializedState));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);

// Comparison Store
interface ComparisonState {
  comparisonItems: Listing[];
  addToComparison: (listing: Listing) => void;
  removeFromComparison: (listingId: string) => void;
  clearComparison: () => void;
  isInComparison: (listingId: string) => boolean;
}

export const useComparisonStore = create<ComparisonState>()(
  persist(
    (set, get) => ({
      comparisonItems: [],
      addToComparison: (listing) => set((state) => {
        if (state.comparisonItems.length >= 4) return state;
        if (state.comparisonItems.some((item) => item.id === listing.id)) return state;
        return { comparisonItems: [...state.comparisonItems, listing] };
      }),
      removeFromComparison: (listingId) => set((state) => ({
        comparisonItems: state.comparisonItems.filter((item) => item.id !== listingId),
      })),
      clearComparison: () => set({ comparisonItems: [] }),
      isInComparison: (listingId) => get().comparisonItems.some((item) => item.id === listingId),
    }),
    {
      name: 'zcar-comparison',
    }
  )
);

// Search Filters Store
interface SearchFiltersState {
  filters: Record<string, unknown>;
  setFilter: (key: string, value: unknown) => void;
  setFilters: (filters: Record<string, unknown>) => void;
  clearFilters: () => void;
  getFilters: () => Record<string, unknown>;
}

export const useSearchFiltersStore = create<SearchFiltersState>()((set, get) => ({
  filters: {},
  setFilter: (key, value) => set((state) => ({
    filters: { ...state.filters, [key]: value },
  })),
  setFilters: (filters) => set({ filters }),
  clearFilters: () => set({ filters: {} }),
  getFilters: () => get().filters,
}));

// UI Store
interface UIState {
  isSidebarOpen: boolean;
  isMobileMenuOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  toggleSidebar: () => void;
  toggleMobileMenu: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  closeMobileMenu: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isSidebarOpen: true,
      isMobileMenuOpen: false,
      theme: 'system',
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
      setTheme: (theme) => set({ theme }),
      closeMobileMenu: () => set({ isMobileMenuOpen: false }),
    }),
    {
      name: 'zcar-ui',
      partialize: (state) => ({ theme: state.theme, isSidebarOpen: state.isSidebarOpen }),
    }
  )
);

// Badge Counts Store
interface BadgeCountsState {
  counts: BadgeCounts;
  isLoading: boolean;
  lastUpdated: number | null;
  setCounts: (counts: BadgeCounts) => void;
  setLoading: (loading: boolean) => void;
  incrementCount: (type: keyof BadgeCounts) => void;
  decrementCount: (type: keyof BadgeCounts) => void;
  clearCounts: () => void;
}

const initialBadgeCounts: BadgeCounts = {
  notifications: 0,
  messages: 0,
  appointments: 0,
  favorites: 0,
  total: 0,
};

export const useBadgeCountsStore = create<BadgeCountsState>()((set) => ({
  counts: initialBadgeCounts,
  isLoading: false,
  lastUpdated: null,
  setCounts: (counts) => set({ counts, lastUpdated: Date.now() }),
  setLoading: (isLoading) => set({ isLoading }),
  incrementCount: (type) => set((state) => ({
    counts: {
      ...state.counts,
      [type]: state.counts[type] + 1,
      total: state.counts.total + 1,
    },
  })),
  decrementCount: (type) => set((state) => ({
    counts: {
      ...state.counts,
      [type]: Math.max(0, state.counts[type] - 1),
      total: Math.max(0, state.counts.total - 1),
    },
  })),
  clearCounts: () => set({ counts: initialBadgeCounts, lastUpdated: null }),
}));

