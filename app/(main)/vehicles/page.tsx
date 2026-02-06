'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Search,
  SlidersHorizontal,
  Grid3X3,
  List,
  X,
  Car,
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
import { useVehicleMakes, useBodyTypes, useFuelTypes, useTransmissions } from '@/hooks/use-reference-data';
import { useCreateSavedSearch } from '@/hooks/use-dashboard';
import { useAuthStore } from '@/lib/store';
import { ListingFilters } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

function VehiclesPageContent() {
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
    type: 'vehicle',
    page: parseInt(searchParams.get('page') || '1'),
    limit: 12,
    sortBy: (searchParams.get('sortBy') as 'price' | 'createdAt' | 'viewsCount') || 'createdAt',
    sortOrder: (searchParams.get('sortOrder') as 'ASC' | 'DESC') || 'DESC',
    make: searchParams.get('make') || undefined,
    bodyType: searchParams.get('bodyType') || undefined,
    fuelType: searchParams.get('fuelType') || undefined,
    transmission: searchParams.get('transmission') || undefined,
    sellerRole: (searchParams.get('sellerRole') as 'private' | 'broker' | 'dealership') || undefined,
    minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined,
    maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined,
    minYear: searchParams.get('minYear') ? parseInt(searchParams.get('minYear')!) : undefined,
    maxYear: searchParams.get('maxYear') ? parseInt(searchParams.get('maxYear')!) : undefined,
    city: searchParams.get('city') || undefined,
  });

  // Price range state for slider
  const [priceRange, setPriceRange] = useState([
    filters.minPrice || 0,
    filters.maxPrice || 15000000,
  ]);

  // Selected filter arrays for checkboxes
  const [selectedMakes, setSelectedMakes] = useState<string[]>(
    filters.make ? filters.make.split(',') : []
  );
  const [selectedBodyTypes, setSelectedBodyTypes] = useState<string[]>(
    filters.bodyType ? filters.bodyType.split(',') : []
  );
  const [selectedFuelTypes, setSelectedFuelTypes] = useState<string[]>(
    filters.fuelType ? filters.fuelType.split(',') : []
  );
  const [selectedTransmissions, setSelectedTransmissions] = useState<string[]>(
    filters.transmission ? filters.transmission.split(',') : []
  );
  const [selectedSellerRole, setSelectedSellerRole] = useState<string>(
    filters.sellerRole || ''
  );

  // Seller role options
  const sellerRoleOptions = [
    { value: 'private', label: 'Private Seller', icon: '👤' },
    { value: 'broker', label: 'Broker/Agent', icon: '💼' },
    { value: 'dealership', label: 'Dealership', icon: '🏢' },
  ];

  // Fetch reference data from API
  const { data: makesData, isLoading: loadingMakes } = useVehicleMakes();
  const { data: bodyTypesData, isLoading: loadingBodyTypes } = useBodyTypes();
  const { data: fuelTypesData, isLoading: loadingFuelTypes } = useFuelTypes();
  const { data: transmissionsData, isLoading: loadingTransmissions } = useTransmissions();

  // Build API filters
  const apiFilters = useMemo<ListingFilters>(() => ({
    ...filters,
    q: searchQuery || undefined,
    make: selectedMakes.length > 0 ? selectedMakes.join(',') : undefined,
    bodyType: selectedBodyTypes.length > 0 ? selectedBodyTypes.join(',') : undefined,
    fuelType: selectedFuelTypes.length > 0 ? selectedFuelTypes.join(',') : undefined,
    transmission: selectedTransmissions.length > 0 ? selectedTransmissions.join(',') : undefined,
    sellerRole: selectedSellerRole ? (selectedSellerRole as 'private' | 'broker' | 'dealership') : undefined,
    minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
    maxPrice: priceRange[1] < 15000000 ? priceRange[1] : undefined,
  }), [filters, searchQuery, selectedMakes, selectedBodyTypes, selectedFuelTypes, selectedTransmissions, selectedSellerRole, priceRange]);

  // Fetch listings from API
  const { data: listingsData, isLoading, error, isFetching } = useListings(apiFilters);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.page && filters.page > 1) params.set('page', String(filters.page));
    if (filters.sortBy && filters.sortBy !== 'createdAt') params.set('sortBy', filters.sortBy);
    if (filters.sortOrder && filters.sortOrder !== 'DESC') params.set('sortOrder', filters.sortOrder);
    if (selectedMakes.length > 0) params.set('make', selectedMakes.join(','));
    if (selectedBodyTypes.length > 0) params.set('bodyType', selectedBodyTypes.join(','));
    if (selectedFuelTypes.length > 0) params.set('fuelType', selectedFuelTypes.join(','));
    if (selectedTransmissions.length > 0) params.set('transmission', selectedTransmissions.join(','));
    if (selectedSellerRole) params.set('sellerRole', selectedSellerRole);
    if (priceRange[0] > 0) params.set('minPrice', String(priceRange[0]));
    if (priceRange[1] < 15000000) params.set('maxPrice', String(priceRange[1]));
    if (searchQuery) params.set('q', searchQuery);
    
    const queryString = params.toString();
    router.replace(`/vehicles${queryString ? `?${queryString}` : ''}`, { scroll: false });
  }, [filters, selectedMakes, selectedBodyTypes, selectedFuelTypes, selectedTransmissions, selectedSellerRole, priceRange, searchQuery, router]);

  const activeFiltersCount = 
    selectedMakes.length + 
    selectedBodyTypes.length + 
    selectedFuelTypes.length + 
    selectedTransmissions.length +
    (selectedSellerRole ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < 15000000 ? 1 : 0);

  const clearFilters = () => {
    setSelectedMakes([]);
    setSelectedBodyTypes([]);
    setSelectedFuelTypes([]);
    setSelectedTransmissions([]);
    setSelectedSellerRole('');
    setPriceRange([0, 15000000]);
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
    setSaveSearchName(`Vehicle Search${searchQuery ? `: ${searchQuery}` : ''}`);
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
          type: 'vehicle',
          q: searchQuery || undefined,
          make: selectedMakes.length > 0 ? selectedMakes.join(',') : undefined,
          bodyType: selectedBodyTypes.length > 0 ? selectedBodyTypes.join(',') : undefined,
          fuelType: selectedFuelTypes.length > 0 ? selectedFuelTypes.join(',') : undefined,
          transmission: selectedTransmissions.length > 0 ? selectedTransmissions.join(',') : undefined,
          sellerRole: selectedSellerRole || undefined,
          minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
          maxPrice: priceRange[1] < 15000000 ? priceRange[1] : undefined,
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
      {/* Price Range */}
      <div>
        <h4 className="font-medium mb-4">Price Range (ETB)</h4>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          max={15000000}
          step={100000}
          className="mb-4"
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{formatPrice(priceRange[0])} ETB</span>
          <span>{formatPrice(priceRange[1])} ETB</span>
        </div>
      </div>

      <Separator />

      {/* Make */}
      <div>
        <h4 className="font-medium mb-4">Make</h4>
        {loadingMakes ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {(makesData || []).map((make) => (
              <label key={make.id} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={selectedMakes.includes(make.slug)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedMakes([...selectedMakes, make.slug]);
                    } else {
                      setSelectedMakes(selectedMakes.filter((m) => m !== make.slug));
                    }
                    setFilters((prev) => ({ ...prev, page: 1 }));
                  }}
                />
                <span className="text-sm">{make.name}</span>
                {make.isPopular && (
                  <Badge variant="secondary" className="text-xs py-0 px-1">Popular</Badge>
                )}
              </label>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Body Type */}
      <div>
        <h4 className="font-medium mb-4">Body Type</h4>
        {loadingBodyTypes ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {(bodyTypesData || []).map((type) => (
              <label key={type.id} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={selectedBodyTypes.includes(type.slug)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedBodyTypes([...selectedBodyTypes, type.slug]);
                    } else {
                      setSelectedBodyTypes(selectedBodyTypes.filter((t) => t !== type.slug));
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

      {/* Fuel Type */}
      <div>
        <h4 className="font-medium mb-4">Fuel Type</h4>
        {loadingFuelTypes ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {(fuelTypesData || []).map((fuel) => (
              <label key={fuel.id} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={selectedFuelTypes.includes(fuel.slug)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedFuelTypes([...selectedFuelTypes, fuel.slug]);
                    } else {
                      setSelectedFuelTypes(selectedFuelTypes.filter((f) => f !== fuel.slug));
                    }
                    setFilters((prev) => ({ ...prev, page: 1 }));
                  }}
                />
                <span className="text-sm">{fuel.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Transmission */}
      <div>
        <h4 className="font-medium mb-4">Transmission</h4>
        {loadingTransmissions ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {(transmissionsData || []).map((trans) => (
              <label key={trans.id} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={selectedTransmissions.includes(trans.slug)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedTransmissions([...selectedTransmissions, trans.slug]);
                    } else {
                      setSelectedTransmissions(selectedTransmissions.filter((t) => t !== trans.slug));
                    }
                    setFilters((prev) => ({ ...prev, page: 1 }));
                  }}
                />
                <span className="text-sm">{trans.name}</span>
              </label>
            ))}
          </div>
        )}
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
            <div className="p-2 rounded-lg bg-amber-100">
              <Car className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Vehicles</h1>
              <div className="text-muted-foreground">
                {isLoading ? (
                  <Skeleton className="h-4 w-32 inline-block" />
                ) : (
                  <span>Browse {totalCount.toLocaleString()} vehicles for sale</span>
                )}
              </div>
            </div>
            {isFetching && !isLoading && (
              <Loader2 className="h-5 w-5 animate-spin text-amber-600" />
            )}
          </div>

          {/* Search and Controls */}
          <div className="flex flex-col lg:flex-row gap-4 mt-6">
            <div className="relative flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search by make, model, or keyword..."
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
                className="h-12 px-6 bg-amber-500 hover:bg-amber-600"
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
              {selectedMakes.map((make) => (
                <Badge key={make} variant="secondary" className="gap-1">
                  {make}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => {
                      setSelectedMakes(selectedMakes.filter((m) => m !== make));
                      setFilters((prev) => ({ ...prev, page: 1 }));
                    }}
                  />
                </Badge>
              ))}
              {selectedBodyTypes.map((type) => (
                <Badge key={type} variant="secondary" className="gap-1">
                  {type}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => {
                      setSelectedBodyTypes(selectedBodyTypes.filter((t) => t !== type));
                      setFilters((prev) => ({ ...prev, page: 1 }));
                    }}
                  />
                </Badge>
              ))}
              {selectedFuelTypes.map((fuel) => (
                <Badge key={fuel} variant="secondary" className="gap-1">
                  {fuel}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => {
                      setSelectedFuelTypes(selectedFuelTypes.filter((f) => f !== fuel));
                      setFilters((prev) => ({ ...prev, page: 1 }));
                    }}
                  />
                </Badge>
              ))}
              {selectedTransmissions.map((trans) => (
                <Badge key={trans} variant="secondary" className="gap-1">
                  {trans}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => {
                      setSelectedTransmissions(selectedTransmissions.filter((t) => t !== trans));
                      setFilters((prev) => ({ ...prev, page: 1 }));
                    }}
                  />
                </Badge>
              ))}
              {selectedSellerRole && (
                <Badge variant="secondary" className="gap-1">
                  {sellerRoleOptions.find(o => o.value === selectedSellerRole)?.label || selectedSellerRole}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setSelectedSellerRole('')}
                  />
                </Badge>
              )}
              {(priceRange[0] > 0 || priceRange[1] < 15000000) && (
                <Badge variant="secondary" className="gap-1">
                  {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])} ETB
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setPriceRange([0, 15000000])}
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
            <div className="sticky top-24 bg-background rounded-xl border p-6">
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
                <p className="text-destructive mb-4">Failed to load vehicles. Please try again.</p>
                <Button onClick={() => window.location.reload()}>Retry</Button>
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-12">
                <Car className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No vehicles found</h3>
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
                  {listings.map((vehicle) => (
                    <ListingCard
                      key={vehicle.id}
                      listing={vehicle}
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
                            filters.page === pageNum && 'bg-amber-500 text-white hover:bg-amber-600'
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
                {selectedMakes.map((m) => <Badge key={m} variant="outline">{m}</Badge>)}
                {selectedBodyTypes.map((t) => <Badge key={t} variant="outline">{t}</Badge>)}
                {selectedFuelTypes.map((f) => <Badge key={f} variant="outline">{f}</Badge>)}
                {selectedTransmissions.map((t) => <Badge key={t} variant="outline">{t}</Badge>)}
                {(priceRange[0] > 0 || priceRange[1] < 15000000) && (
                  <Badge variant="outline">
                    Price: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                  </Badge>
                )}
                {!searchQuery && selectedMakes.length === 0 && selectedBodyTypes.length === 0 && 
                 selectedFuelTypes.length === 0 && selectedTransmissions.length === 0 && 
                 priceRange[0] === 0 && priceRange[1] === 15000000 && (
                  <span>All vehicles</span>
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
              className="bg-amber-500 hover:bg-amber-600"
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

export default function VehiclesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    }>
      <VehiclesPageContent />
    </Suspense>
  );
}
