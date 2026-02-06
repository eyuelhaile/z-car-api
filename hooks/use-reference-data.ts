'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Helper to extract display name from API response
// The API might return name as a string OR an object {en, am, om}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getDisplayName(item: any, lang: string = 'en'): string {
  // If there's a label field, use it (new format)
  if (item.label && typeof item.label === 'string') {
    return item.label;
  }
  // If name is a string, use it directly
  if (typeof item.name === 'string') {
    return item.name;
  }
  // If name is an object with translations, extract the requested language
  if (item.name && typeof item.name === 'object') {
    return item.name[lang] || item.name.en || Object.values(item.name)[0] || '';
  }
  // Fallback to value or slug
  return item.value || item.slug || '';
}

// Normalize an array of items to always have string 'name' and 'slug' properties
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeItems<T extends Record<string, any>>(items: T[] | undefined, lang: string = 'en'): T[] {
  if (!items) return [];
  return items.map(item => {
    const slug = item.slug || item.value || item.id || '';
    return {
      ...item,
      name: getDisplayName(item, lang),
      slug: slug,
      value: item.value || slug,
    };
  });
}

// Query keys
export const referenceKeys = {
  all: ['reference'] as const,
  allData: () => [...referenceKeys.all, 'all'] as const,
  vehicleFormData: () => [...referenceKeys.all, 'vehicle', 'form-data'] as const,
  propertyFormData: () => [...referenceKeys.all, 'property', 'form-data'] as const,
  makes: (popular?: boolean) => [...referenceKeys.all, 'makes', { popular }] as const,
  models: (makeId: string) => [...referenceKeys.all, 'models', makeId] as const,
  bodyTypes: () => [...referenceKeys.all, 'bodyTypes'] as const,
  fuelTypes: () => [...referenceKeys.all, 'fuelTypes'] as const,
  transmissions: () => [...referenceKeys.all, 'transmissions'] as const,
  colors: () => [...referenceKeys.all, 'colors'] as const,
  vehicleConditions: () => [...referenceKeys.all, 'vehicleConditions'] as const,
  propertyTypes: () => [...referenceKeys.all, 'propertyTypes'] as const,
  propertyConditions: () => [...referenceKeys.all, 'propertyConditions'] as const,
  amenities: (category?: string) => [...referenceKeys.all, 'amenities', { category }] as const,
  regions: () => [...referenceKeys.all, 'regions'] as const,
  cities: (regionId?: string) => [...referenceKeys.all, 'cities', { regionId }] as const,
  popularCities: () => [...referenceKeys.all, 'popularCities'] as const,
  priceRanges: (category: 'vehicle' | 'property') => [...referenceKeys.all, 'priceRanges', category] as const,
  yearRanges: () => [...referenceKeys.all, 'yearRanges'] as const,
};

// Hook to get all reference data at once (ideal for app initialization)
export function useAllReferenceData() {
  return useQuery({
    queryKey: referenceKeys.allData(),
    queryFn: async () => {
      const response = await api.getAllReferenceData();
      return response.data;
    },
    staleTime: 1000 * 60 * 60, // 1 hour - reference data rarely changes
    gcTime: 1000 * 60 * 60 * 24, // 24 hours cache
  });
}

// Hook to get vehicle form data (for create listing forms)
export function useVehicleFormData() {
  return useQuery({
    queryKey: referenceKeys.vehicleFormData(),
    queryFn: async () => {
      const response = await api.getVehicleFormData('en');
      const data = response.data;
      if (!data) return null;
      
      // Normalize all arrays in the vehicle form data
      return {
        makes: data.makes?.map((item: any) => ({
          ...item,
          label: getDisplayName(item, 'en'),
          value: item.value || item.slug || item.id || '',
        })) || [],
        bodyTypes: data.bodyTypes?.map((item: any) => ({
          ...item,
          label: getDisplayName(item, 'en'),
          value: item.value || item.slug || item.id || '',
        })) || [],
        fuelTypes: data.fuelTypes?.map((item: any) => ({
          ...item,
          label: getDisplayName(item, 'en'),
          value: item.value || item.slug || item.id || '',
        })) || [],
        transmissions: data.transmissions?.map((item: any) => ({
          ...item,
          label: getDisplayName(item, 'en'),
          value: item.value || item.slug || item.id || '',
        })) || [],
        colors: data.colors?.map((item: any) => ({
          ...item,
          label: getDisplayName(item, 'en'),
          value: item.value || item.slug || item.id || '',
        })) || [],
        conditions: data.conditions?.map((item: any) => ({
          ...item,
          label: getDisplayName(item, 'en'),
          value: item.value || item.slug || item.id || '',
        })) || [],
        features: data.features?.map((item: any) => ({
          ...item,
          label: getDisplayName(item, 'en'),
          value: item.value || item.slug || item.id || '',
        })) || [],
      };
    },
    staleTime: 1000 * 60 * 60,
  });
}

// Hook to get property form data (for create listing forms)
export function usePropertyFormData() {
  return useQuery({
    queryKey: referenceKeys.propertyFormData(),
    queryFn: async () => {
      const response = await api.getPropertyFormData('en');
      const data = response.data;
      if (!data) return null;
      
      // Normalize all arrays in the property form data
      return {
        propertyTypes: data.propertyTypes?.map((item: any) => ({
          ...item,
          label: getDisplayName(item, 'en'),
          value: item.value || item.slug || item.id || '',
        })) || [],
        conditions: data.conditions?.map((item: any) => ({
          ...item,
          label: getDisplayName(item, 'en'),
          value: item.value || item.slug || item.id || '',
        })) || [],
        amenities: data.amenities?.map((item: any) => ({
          ...item,
          label: getDisplayName(item, 'en'),
          value: item.value || item.slug || item.id || '',
        })) || [],
        features: data.features?.map((item: any) => ({
          ...item,
          label: getDisplayName(item, 'en'),
          value: item.value || item.slug || item.id || '',
        })) || [],
      };
    },
    staleTime: 1000 * 60 * 60,
  });
}

// Hook to get vehicle makes
export function useVehicleMakes(popular?: boolean) {
  return useQuery({
    queryKey: referenceKeys.makes(popular),
    queryFn: async () => {
      const response = await api.getVehicleMakes(popular);
      return normalizeItems(response.data || []);
    },
    staleTime: 1000 * 60 * 60,
  });
}

// Hook to get vehicle models by make
export function useVehicleModels(makeId: string) {
  return useQuery({
    queryKey: referenceKeys.models(makeId),
    queryFn: async () => {
      const response = await api.getVehicleModels(makeId);
      return normalizeItems(response.data || []);
    },
    enabled: !!makeId,
    staleTime: 1000 * 60 * 60,
  });
}

// Hook to get body types
export function useBodyTypes() {
  return useQuery({
    queryKey: referenceKeys.bodyTypes(),
    queryFn: async () => {
      const response = await api.getBodyTypes();
      return normalizeItems(response.data || []);
    },
    staleTime: 1000 * 60 * 60,
  });
}

// Hook to get fuel types
export function useFuelTypes() {
  return useQuery({
    queryKey: referenceKeys.fuelTypes(),
    queryFn: async () => {
      const response = await api.getFuelTypes();
      return normalizeItems(response.data || []);
    },
    staleTime: 1000 * 60 * 60,
  });
}

// Hook to get transmissions
export function useTransmissions() {
  return useQuery({
    queryKey: referenceKeys.transmissions(),
    queryFn: async () => {
      const response = await api.getTransmissions();
      return normalizeItems(response.data || []);
    },
    staleTime: 1000 * 60 * 60,
  });
}

// Hook to get colors
export function useColors() {
  return useQuery({
    queryKey: referenceKeys.colors(),
    queryFn: async () => {
      const response = await api.getColors();
      return normalizeItems(response.data || []);
    },
    staleTime: 1000 * 60 * 60,
  });
}

// Hook to get vehicle conditions
export function useVehicleConditions() {
  return useQuery({
    queryKey: referenceKeys.vehicleConditions(),
    queryFn: async () => {
      const response = await api.getVehicleConditions();
      return normalizeItems(response.data || []);
    },
    staleTime: 1000 * 60 * 60,
  });
}

// Hook to get property types
export function usePropertyTypes() {
  return useQuery({
    queryKey: referenceKeys.propertyTypes(),
    queryFn: async () => {
      const response = await api.getPropertyTypes();
      return normalizeItems(response.data || []);
    },
    staleTime: 1000 * 60 * 60,
  });
}

// Hook to get property conditions
export function usePropertyConditions() {
  return useQuery({
    queryKey: referenceKeys.propertyConditions(),
    queryFn: async () => {
      const response = await api.getPropertyConditions();
      return normalizeItems(response.data || []);
    },
    staleTime: 1000 * 60 * 60,
  });
}

// Hook to get amenities
export function useAmenities(category?: string) {
  return useQuery({
    queryKey: referenceKeys.amenities(category),
    queryFn: async () => {
      const response = await api.getAmenities(category);
      return normalizeItems(response.data || []);
    },
    staleTime: 1000 * 60 * 60,
  });
}

// Hook to get regions
export function useRegions() {
  return useQuery({
    queryKey: referenceKeys.regions(),
    queryFn: async () => {
      const response = await api.getRegions('en');
      return normalizeItems(response.data || []);
    },
    staleTime: 1000 * 60 * 60,
  });
}

// Hook to get cities
export function useCities(regionId?: string) {
  return useQuery({
    queryKey: referenceKeys.cities(regionId),
    queryFn: async () => {
      const response = await api.getCities(regionId, 'en');
      return normalizeItems(response.data || []);
    },
    staleTime: 1000 * 60 * 60,
  });
}

// Hook to get popular cities
export function usePopularCities() {
  return useQuery({
    queryKey: referenceKeys.popularCities(),
    queryFn: async () => {
      const response = await api.getPopularCities();
      return normalizeItems(response.data || []);
    },
    staleTime: 1000 * 60 * 60,
  });
}

// Hook to get price ranges
export function usePriceRanges(category: 'vehicle' | 'property') {
  return useQuery({
    queryKey: referenceKeys.priceRanges(category),
    queryFn: async () => {
      const response = await api.getPriceRanges(category);
      return response.data || [];
    },
    staleTime: 1000 * 60 * 60,
  });
}

// Hook to get year ranges
export function useYearRanges() {
  return useQuery({
    queryKey: referenceKeys.yearRanges(),
    queryFn: async () => {
      const response = await api.getYearRanges();
      return response.data || [];
    },
    staleTime: 1000 * 60 * 60,
  });
}
