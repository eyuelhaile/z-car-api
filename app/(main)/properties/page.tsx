'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Search,
  SlidersHorizontal,
  Grid3X3,
  List,
  X,
  Home,
  Loader2,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { ListingCard } from '@/components/listings/listing-card';
import { useListings } from '@/hooks/use-listings';
import { usePropertyTypes, usePropertyConditions, useAmenities, useRegions, useCities } from '@/hooks/use-reference-data';
import { useCreateSavedSearch } from '@/hooks/use-dashboard';
import { useAuthStore } from '@/lib/store';
import { ListingFilters } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

function PropertiesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Auth
  const { isAuthenticated } = useAuthStore();
  
  // UI state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [isSaveSearchOpen, setIsSaveSearchOpen] = useState(false);
  const [saveSearchName, setSaveSearchName] = useState('');
  
  // Saved search mutation
  const createSavedSearchMutation = useCreateSavedSearch();
  
  // Filter state
  const [filters, setFilters] = useState<ListingFilters>({
    type: 'property',
    page: parseInt(searchParams.get('page') || '1'),
    limit: 12,
    sortBy: (searchParams.get('sortBy') as 'price' | 'createdAt' | 'viewsCount') || 'createdAt',
    sortOrder: (searchParams.get('sortOrder') as 'ASC' | 'DESC') || 'DESC',
    propertyType: searchParams.get('propertyType') || undefined,
    listingType: (searchParams.get('listingType') as 'sale' | 'rent') || undefined,
    minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined,
    maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined,
    minBedrooms: searchParams.get('minBedrooms') ? parseInt(searchParams.get('minBedrooms')!) : undefined,
    minBathrooms: searchParams.get('minBathrooms') ? parseInt(searchParams.get('minBathrooms')!) : undefined,
    minArea: searchParams.get('minArea') ? parseInt(searchParams.get('minArea')!) : undefined,
    maxArea: searchParams.get('maxArea') ? parseInt(searchParams.get('maxArea')!) : undefined,
    furnished: searchParams.get('furnished') === 'true' ? true : undefined,
    sellerRole: (searchParams.get('sellerRole') as 'private' | 'broker' | 'dealership') || undefined,
    city: searchParams.get('city') || undefined,
    region: searchParams.get('region') || undefined,
  });

  // Price range state for slider
  const [priceRange, setPriceRange] = useState([
    filters.minPrice || 0,
    filters.maxPrice || 50000000,
  ]);

  // Bedrooms range
  const [bedroomsRange, setBedroomsRange] = useState([
    filters.minBedrooms || 0,
    10,
  ]);

  // Selected filter arrays for checkboxes
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState<string[]>(
    filters.propertyType ? filters.propertyType.split(',') : []
  );
  const [selectedListingType, setSelectedListingType] = useState<string>(
    filters.listingType || ''
  );
  const [isFurnished, setIsFurnished] = useState<boolean | undefined>(filters.furnished);
  const [selectedRegion, setSelectedRegion] = useState(filters.region || '');
  const [selectedCity, setSelectedCity] = useState(filters.city || '');
  const [selectedSellerRole, setSelectedSellerRole] = useState<string>(
    filters.sellerRole || ''
  );

  // Seller role options
  const sellerRoleOptions = [
    { value: 'private', label: 'Private Owner', icon: '👤' },
    { value: 'broker', label: 'Broker/Agent', icon: '💼' },
    { value: 'dealership', label: 'Real Estate Agency', icon: '🏢' },
  ];

  // Fetch reference data from API
  const { data: propertyTypesData, isLoading: loadingPropertyTypes } = usePropertyTypes();
  const { data: regionsData, isLoading: loadingRegions } = useRegions();
  const { data: citiesData, isLoading: loadingCities } = useCities(selectedRegion || undefined);

  // Build API filters
  const apiFilters = useMemo<ListingFilters>(() => ({
    ...filters,
    q: searchQuery || undefined,
    propertyType: selectedPropertyTypes.length > 0 ? selectedPropertyTypes.join(',') : undefined,
    listingType: selectedListingType as 'sale' | 'rent' || undefined,
    sellerRole: selectedSellerRole ? (selectedSellerRole as 'private' | 'broker' | 'dealership') : undefined,
    minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
    maxPrice: priceRange[1] < 50000000 ? priceRange[1] : undefined,
    minBedrooms: bedroomsRange[0] > 0 ? bedroomsRange[0] : undefined,
    furnished: isFurnished,
    city: selectedCity || undefined,
    region: selectedRegion || undefined,
  }), [filters, searchQuery, selectedPropertyTypes, selectedListingType, selectedSellerRole, priceRange, bedroomsRange, isFurnished, selectedCity, selectedRegion]);

  // Fetch listings from API
  const { data: listingsData, isLoading, error, isFetching } = useListings(apiFilters);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.page && filters.page > 1) params.set('page', String(filters.page));
    if (filters.sortBy && filters.sortBy !== 'createdAt') params.set('sortBy', filters.sortBy);
    if (filters.sortOrder && filters.sortOrder !== 'DESC') params.set('sortOrder', filters.sortOrder);
    if (selectedPropertyTypes.length > 0) params.set('propertyType', selectedPropertyTypes.join(','));
    if (selectedListingType) params.set('listingType', selectedListingType);
    if (selectedSellerRole) params.set('sellerRole', selectedSellerRole);
    if (priceRange[0] > 0) params.set('minPrice', String(priceRange[0]));
    if (priceRange[1] < 50000000) params.set('maxPrice', String(priceRange[1]));
    if (bedroomsRange[0] > 0) params.set('minBedrooms', String(bedroomsRange[0]));
    if (isFurnished !== undefined) params.set('furnished', String(isFurnished));
    if (selectedRegion) params.set('region', selectedRegion);
    if (selectedCity) params.set('city', selectedCity);
    if (searchQuery) params.set('q', searchQuery);
    
    const queryString = params.toString();
    router.replace(`/properties${queryString ? `?${queryString}` : ''}`, { scroll: false });
  }, [filters, selectedPropertyTypes, selectedListingType, selectedSellerRole, priceRange, bedroomsRange, isFurnished, selectedRegion, selectedCity, searchQuery, router]);

  const activeFiltersCount = 
    selectedPropertyTypes.length + 
    (selectedListingType ? 1 : 0) +
    (selectedSellerRole ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < 50000000 ? 1 : 0) +
    (bedroomsRange[0] > 0 ? 1 : 0) +
    (isFurnished !== undefined ? 1 : 0) +
    (selectedCity || selectedRegion ? 1 : 0);

  const clearFilters = () => {
    setSelectedPropertyTypes([]);
    setSelectedListingType('');
    setSelectedSellerRole('');
    setPriceRange([0, 50000000]);
    setBedroomsRange([0, 10]);
    setIsFurnished(undefined);
    setSelectedRegion('');
    setSelectedCity('');
    setSearchInput('');
    setSearchQuery('');
    setFilters((prev) => ({ ...prev, page: 1 }));
  };

  // Handle search
  const handleSearch = () => {
    setSearchQuery(searchInput);
    setFilters((prev) => ({ ...prev, page: 1 }));
  };

  // Handle save search
  const handleSaveSearch = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to save searches', {
        action: {
          label: 'Sign in',
          onClick: () => router.push('/auth/login'),
        },
      });
      return;
    }
    setIsSaveSearchOpen(true);
    setSaveSearchName(`Property Search${searchQuery ? `: ${searchQuery}` : ''}`);
  };

  const submitSaveSearch = () => {
    if (!saveSearchName.trim()) {
      toast.error('Please enter a name for your saved search');
      return;
    }

    createSavedSearchMutation.mutate(
      {
        name: saveSearchName,
        filters: {
          type: 'property',
          q: searchQuery || undefined,
          propertyType: selectedPropertyTypes.length > 0 ? selectedPropertyTypes.join(',') : undefined,
          listingType: selectedListingType || undefined,
          sellerRole: selectedSellerRole || undefined,
          minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
          maxPrice: priceRange[1] < 50000000 ? priceRange[1] : undefined,
          minBedrooms: bedroomsRange[0] > 0 ? bedroomsRange[0] : undefined,
          furnished: isFurnished,
          city: selectedCity || undefined,
          region: selectedRegion || undefined,
        },
        notifyEnabled: true,
        notifyFrequency: 'instant' as const,
      },
      {
        onSuccess: () => {
          toast.success('Search saved successfully!', {
            action: {
              label: 'View',
              onClick: () => router.push('/dashboard/saved-searches'),
            },
          });
          setIsSaveSearchOpen(false);
          setSaveSearchName('');
        },
        onError: () => {
          toast.error('Failed to save search. Please try again.');
        },
      }
    );
  };

  const handleSortChange = (value: string) => {
    let sortBy: 'price' | 'createdAt' | 'viewsCount' = 'createdAt';
    let sortOrder: 'ASC' | 'DESC' = 'DESC';
    
    switch (value) {
      case 'newest':
        sortBy = 'createdAt';
        sortOrder = 'DESC';
        break;
      case 'oldest':
        sortBy = 'createdAt';
        sortOrder = 'ASC';
        break;
      case 'price-low':
        sortBy = 'price';
        sortOrder = 'ASC';
        break;
      case 'price-high':
        sortBy = 'price';
        sortOrder = 'DESC';
        break;
      case 'popular':
        sortBy = 'viewsCount';
        sortOrder = 'DESC';
        break;
    }
    
    setFilters((prev) => ({ ...prev, sortBy, sortOrder, page: 1 }));
  };

  const getSortValue = () => {
    if (filters.sortBy === 'createdAt' && filters.sortOrder === 'DESC') return 'newest';
    if (filters.sortBy === 'createdAt' && filters.sortOrder === 'ASC') return 'oldest';
    if (filters.sortBy === 'price' && filters.sortOrder === 'ASC') return 'price-low';
    if (filters.sortBy === 'price' && filters.sortOrder === 'DESC') return 'price-high';
    if (filters.sortBy === 'viewsCount') return 'popular';
    return 'newest';
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M`;
    }
    return `${(price / 1000).toFixed(0)}K`;
  };

  const listings = listingsData?.data || [];
  const pagination = listingsData?.pagination;
  const totalCount = pagination?.total || 0;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Listing Type (Sale/Rent) */}
      <div>
        <h4 className="font-medium mb-4">Listing Type</h4>
        <div className="flex gap-2">
          <Button
            variant={selectedListingType === 'sale' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSelectedListingType(selectedListingType === 'sale' ? '' : 'sale');
              setFilters((prev) => ({ ...prev, page: 1 }));
            }}
            className={selectedListingType === 'sale' ? 'bg-amber-500 hover:bg-amber-600' : ''}
          >
            For Sale
          </Button>
          <Button
            variant={selectedListingType === 'rent' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSelectedListingType(selectedListingType === 'rent' ? '' : 'rent');
              setFilters((prev) => ({ ...prev, page: 1 }));
            }}
            className={selectedListingType === 'rent' ? 'bg-amber-500 hover:bg-amber-600' : ''}
          >
            For Rent
          </Button>
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div>
        <h4 className="font-medium mb-4">Price Range (ETB)</h4>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          max={50000000}
          step={500000}
          className="mb-4"
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{formatPrice(priceRange[0])} ETB</span>
          <span>{formatPrice(priceRange[1])} ETB</span>
        </div>
      </div>

      <Separator />

      {/* Property Type */}
      <div>
        <h4 className="font-medium mb-4">Property Type</h4>
        {loadingPropertyTypes ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {(propertyTypesData || []).map((type) => (
              <label key={type.id} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={selectedPropertyTypes.includes(type.slug)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedPropertyTypes([...selectedPropertyTypes, type.slug]);
                    } else {
                      setSelectedPropertyTypes(selectedPropertyTypes.filter((t) => t !== type.slug));
                    }
                    setFilters((prev) => ({ ...prev, page: 1 }));
                  }}
                />
                <span className="text-sm">{type.icon} {type.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Bedrooms */}
      <div>
        <h4 className="font-medium mb-4">Bedrooms</h4>
        <div className="flex flex-wrap gap-2">
          {[0, 1, 2, 3, 4, 5].map((num) => (
            <Button
              key={num}
              variant={bedroomsRange[0] === num ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setBedroomsRange([num, 10]);
                setFilters((prev) => ({ ...prev, page: 1 }));
              }}
              className={bedroomsRange[0] === num ? 'bg-amber-500 hover:bg-amber-600' : ''}
            >
              {num === 0 ? 'Any' : num === 5 ? '5+' : num}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Furnished */}
      <div>
        <h4 className="font-medium mb-4">Furnished</h4>
        <div className="flex gap-2">
          <Button
            variant={isFurnished === undefined ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setIsFurnished(undefined);
              setFilters((prev) => ({ ...prev, page: 1 }));
            }}
            className={isFurnished === undefined ? 'bg-amber-500 hover:bg-amber-600' : ''}
          >
            Any
          </Button>
          <Button
            variant={isFurnished === true ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setIsFurnished(true);
              setFilters((prev) => ({ ...prev, page: 1 }));
            }}
            className={isFurnished === true ? 'bg-amber-500 hover:bg-amber-600' : ''}
          >
            Furnished
          </Button>
          <Button
            variant={isFurnished === false ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setIsFurnished(false);
              setFilters((prev) => ({ ...prev, page: 1 }));
            }}
            className={isFurnished === false ? 'bg-amber-500 hover:bg-amber-600' : ''}
          >
            Unfurnished
          </Button>
        </div>
      </div>

      <Separator />

      {/* Seller Type */}
      <div>
        <h4 className="font-medium mb-4">Seller Type</h4>
        <div className="space-y-2">
          {sellerRoleOptions.map((option) => (
            <label key={option.value} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={selectedSellerRole === option.value}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedSellerRole(option.value);
                  } else {
                    setSelectedSellerRole('');
                  }
                  setFilters((prev) => ({ ...prev, page: 1 }));
                }}
              />
              <span className="text-sm">{option.icon} {option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <Separator />

      {/* Location */}
      <div>
        <h4 className="font-medium mb-4">Location</h4>
        {loadingRegions ? (
          <Skeleton className="h-10 w-full mb-2" />
        ) : (
          <Select value={selectedRegion || '__all__'} onValueChange={(value) => {
            setSelectedRegion(value === '__all__' ? '' : value);
            setSelectedCity('');
            setFilters((prev) => ({ ...prev, page: 1 }));
          }}>
            <SelectTrigger className="mb-2">
              <SelectValue placeholder="Select Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Regions</SelectItem>
              {(regionsData || []).map((region) => (
                <SelectItem key={region.id} value={region.slug}>
                  {region.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        
        {selectedRegion && (
          loadingCities ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select value={selectedCity || '__all__'} onValueChange={(value) => {
              setSelectedCity(value === '__all__' ? '' : value);
              setFilters((prev) => ({ ...prev, page: 1 }));
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Cities</SelectItem>
                {(citiesData || []).map((city) => (
                  <SelectItem key={city.id} value={city.slug}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )
        )}
      </div>

      {activeFiltersCount > 0 && (
        <Button variant="outline" className="w-full" onClick={clearFilters}>
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="container py-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-emerald-100">
              <Home className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Properties</h1>
              <div className="text-muted-foreground">
                {isLoading ? (
                  <Skeleton className="h-4 w-32 inline-block" />
                ) : (
                  <span>Browse {totalCount.toLocaleString()} properties for sale &amp; rent</span>
                )}
              </div>
            </div>
            {isFetching && !isLoading && (
              <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
            )}
          </div>

          {/* Search and Controls */}
          <div className="flex flex-col lg:flex-row gap-4 mt-6">
            <div className="relative flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search by location, property type, or keyword..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                  className="pl-10 h-12"
                />
              </div>
              <Button 
                onClick={handleSearch} 
                className="h-12 px-6 bg-emerald-500 hover:bg-emerald-600"
                disabled={isFetching}
              >
                {isFetching ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Search className="h-5 w-5 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {/* Mobile Filter Button */}
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterContent />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Sort */}
              <Select value={getSortValue()} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[160px] h-12">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                </SelectContent>
              </Select>

              {/* Save Search */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-12 w-12"
                      onClick={handleSaveSearch}
                      disabled={createSavedSearchMutation.isPending}
                    >
                      {createSavedSearchMutation.isPending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Bookmark className="h-5 w-5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Save this search</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* View Toggle */}
              <div className="hidden sm:flex items-center border rounded-lg">
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
          </div>

          {/* Active Filters */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {selectedListingType && (
                <Badge variant="secondary" className="gap-1">
                  For {selectedListingType === 'sale' ? 'Sale' : 'Rent'}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => {
                      setSelectedListingType('');
                      setFilters((prev) => ({ ...prev, page: 1 }));
                    }}
                  />
                </Badge>
              )}
              {selectedPropertyTypes.map((type) => (
                <Badge key={type} variant="secondary" className="gap-1">
                  {type}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => {
                      setSelectedPropertyTypes(selectedPropertyTypes.filter((t) => t !== type));
                      setFilters((prev) => ({ ...prev, page: 1 }));
                    }}
                  />
                </Badge>
              ))}
              {(priceRange[0] > 0 || priceRange[1] < 50000000) && (
                <Badge variant="secondary" className="gap-1">
                  {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])} ETB
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setPriceRange([0, 50000000])}
                  />
                </Badge>
              )}
              {bedroomsRange[0] > 0 && (
                <Badge variant="secondary" className="gap-1">
                  {bedroomsRange[0]}+ Bedrooms
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setBedroomsRange([0, 10])}
                  />
                </Badge>
              )}
              {isFurnished !== undefined && (
                <Badge variant="secondary" className="gap-1">
                  {isFurnished ? 'Furnished' : 'Unfurnished'}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setIsFurnished(undefined)}
                  />
                </Badge>
              )}
              {selectedSellerRole && (
                <Badge variant="secondary" className="gap-1">
                  {sellerRoleOptions.find(o => o.value === selectedSellerRole)?.label || selectedSellerRole}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setSelectedSellerRole('')}
                  />
                </Badge>
              )}
              {(selectedCity || selectedRegion) && (
                <Badge variant="secondary" className="gap-1">
                  {selectedCity || selectedRegion}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => {
                      setSelectedRegion('');
                      setSelectedCity('');
                    }}
                  />
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-destructive">
                Clear all
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 bg-background rounded-xl border p-6 max-h-[calc(100vh-120px)] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold">Filters</h3>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary">{activeFiltersCount}</Badge>
                )}
              </div>
              <FilterContent />
            </div>
          </aside>

          {/* Listings Grid */}
          <main className="flex-1">
            {isLoading ? (
              <div
                className={cn(
                  'grid gap-6',
                  viewMode === 'grid'
                    ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
                    : 'grid-cols-1'
                )}
              >
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="aspect-[4/3]" />
                    <div className="p-4 space-y-3">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-6 w-1/3" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-destructive mb-4">Failed to load properties. Please try again.</p>
                <Button onClick={() => window.location.reload()}>Retry</Button>
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-12">
                <Home className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No properties found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or search criteria
                </p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </div>
            ) : (
              <>
                <div
                  className={cn(
                    'grid gap-6',
                    viewMode === 'grid'
                      ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
                      : 'grid-cols-1'
                  )}
                >
                  {listings.map((property) => (
                    <ListingCard
                      key={property.id}
                      listing={property}
                      variant={viewMode === 'list' ? 'horizontal' : 'default'}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      disabled={filters.page === 1}
                      onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page || 1) - 1 }))}
                    >
                      Previous
                    </Button>
                    
                    {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                      const pageNum = i + 1;
                      return (
                        <Button
                          key={pageNum}
                          variant="outline"
                          className={cn(
                            filters.page === pageNum && 'bg-emerald-500 text-white hover:bg-emerald-600'
                          )}
                          onClick={() => setFilters((prev) => ({ ...prev, page: pageNum }))}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    
                    {pagination.totalPages > 5 && (
                      <>
                        <span className="px-2">...</span>
                        <Button
                          variant="outline"
                          onClick={() => setFilters((prev) => ({ ...prev, page: pagination.totalPages }))}
                        >
                          {pagination.totalPages}
                        </Button>
                      </>
                    )}
                    
                    <Button
                      variant="outline"
                      disabled={!pagination.hasMore}
                      onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Save Search Dialog */}
      <Dialog open={isSaveSearchOpen} onOpenChange={setIsSaveSearchOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Search</DialogTitle>
            <DialogDescription>
              Save your current search filters to get notified when new listings match your criteria.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Enter a name for this search..."
              value={saveSearchName}
              onChange={(e) => setSaveSearchName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  submitSaveSearch();
                }
              }}
            />
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Current filters:</p>
              <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
                {searchQuery && <Badge variant="outline">Search: {searchQuery}</Badge>}
                {selectedPropertyTypes.map((t) => <Badge key={t} variant="outline">{t}</Badge>)}
                {selectedListingType && <Badge variant="outline">{selectedListingType === 'sale' ? 'For Sale' : 'For Rent'}</Badge>}
                {selectedRegion && <Badge variant="outline">{selectedRegion}</Badge>}
                {selectedCity && <Badge variant="outline">{selectedCity}</Badge>}
                {bedroomsRange[0] > 0 && <Badge variant="outline">{bedroomsRange[0]}+ bedrooms</Badge>}
                {isFurnished !== undefined && <Badge variant="outline">{isFurnished ? 'Furnished' : 'Unfurnished'}</Badge>}
                {(priceRange[0] > 0 || priceRange[1] < 50000000) && (
                  <Badge variant="outline">
                    Price: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                  </Badge>
                )}
                {!searchQuery && selectedPropertyTypes.length === 0 && !selectedListingType && 
                 !selectedRegion && !selectedCity && bedroomsRange[0] === 0 && isFurnished === undefined &&
                 priceRange[0] === 0 && priceRange[1] === 50000000 && (
                  <span>All properties</span>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaveSearchOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={submitSaveSearch}
              disabled={createSavedSearchMutation.isPending}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              {createSavedSearchMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <BookmarkCheck className="h-4 w-4 mr-2" />
                  Save Search
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    }>
      <PropertiesPageContent />
    </Suspense>
  );
}
