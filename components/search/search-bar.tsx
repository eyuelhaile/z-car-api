'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Car, Home, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useVehicleMakes, usePopularCities, useBodyTypes, usePropertyTypes } from '@/hooks/use-reference-data';

interface SearchBarProps {
  variant?: 'hero' | 'compact' | 'inline';
  defaultType?: 'vehicle' | 'property';
  className?: string;
}

export function SearchBar({ variant = 'hero', defaultType = 'vehicle', className }: SearchBarProps) {
  const router = useRouter();
  const [searchType, setSearchType] = useState<'vehicle' | 'property'>(defaultType);
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [locationOpen, setLocationOpen] = useState(false);

  // Fetch reference data from API
  const { data: vehicleMakes, isLoading: loadingMakes } = useVehicleMakes(true); // Popular makes only
  const { data: popularCities, isLoading: loadingCities } = usePopularCities();
  const { data: bodyTypes, isLoading: loadingBodyTypes } = useBodyTypes();
  const { data: propertyTypes, isLoading: loadingPropertyTypes } = usePropertyTypes();

  const handleSearch = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (location) params.set('city', location);
    
    const path = searchType === 'vehicle' ? '/vehicles' : '/properties';
    router.push(`${path}?${params.toString()}`);
  }, [query, location, searchType, router]);

  const handleQuickFilter = (filterType: string, value: string) => {
    const params = new URLSearchParams();
    params.set(filterType, value);
    const path = searchType === 'vehicle' ? '/vehicles' : '/properties';
    router.push(`${path}?${params.toString()}`);
  };

  if (variant === 'compact') {
    return (
      <form onSubmit={handleSearch} className={cn('relative', className)}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search vehicles, properties..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-20"
        />
        <Button
          type="submit"
          size="sm"
          className="absolute right-1 top-1/2 -translate-y-1/2 bg-amber-500 hover:bg-amber-600"
        >
          Search
        </Button>
      </form>
    );
  }

  if (variant === 'inline') {
    return (
      <form onSubmit={handleSearch} className={cn('flex gap-2', className)}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="What are you looking for?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={searchType} onValueChange={(v) => setSearchType(v as 'vehicle' | 'property')}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="vehicle">
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4" />
                Vehicles
              </div>
            </SelectItem>
            <SelectItem value="property">
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Properties
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" className="bg-amber-500 hover:bg-amber-600">
          Search
        </Button>
      </form>
    );
  }

  // Hero variant
  return (
    <div className={cn('w-full max-w-4xl mx-auto', className)}>
      {/* Type Toggle */}
      <div className="flex justify-center mb-4">
        <div className="inline-flex bg-white/10 backdrop-blur-sm rounded-full p-1">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setSearchType('vehicle')}
            className={cn(
              'rounded-full px-6 transition-all',
              searchType === 'vehicle'
                ? 'bg-white text-amber-600 shadow-lg hover:bg-white'
                : 'text-white hover:bg-white/10'
            )}
          >
            <Car className="h-4 w-4 mr-2" />
            Vehicles
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setSearchType('property')}
            className={cn(
              'rounded-full px-6 transition-all',
              searchType === 'property'
                ? 'bg-white text-amber-600 shadow-lg hover:bg-white'
                : 'text-white hover:bg-white/10'
            )}
          >
            <Home className="h-4 w-4 mr-2" />
            Properties
          </Button>
        </div>
      </div>

      {/* Search Form */}
      <form
        onSubmit={handleSearch}
        className="bg-white rounded-2xl shadow-2xl p-2 md:p-3"
      >
        <div className="flex flex-col md:flex-row gap-2">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder={
                searchType === 'vehicle'
                  ? 'Search by make, model, or keyword...'
                  : 'Search by property type, features...'
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 h-12 md:h-14 border-0 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px bg-gray-200" />

          {/* Location Dropdown - Now from API */}
          <Popover open={locationOpen} onOpenChange={setLocationOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                role="combobox"
                aria-expanded={locationOpen}
                className="relative flex-1 md:max-w-[200px] h-12 md:h-14 justify-start border-0 text-base font-normal hover:bg-transparent overflow-hidden"
              >
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground shrink-0 z-10" />
                <span className={cn("truncate block ml-10 mr-4", !location && 'text-muted-foreground')}>
                  {location || 'Location'}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search city..." />
                <CommandList>
                  <CommandEmpty>No city found.</CommandEmpty>
                  {loadingCities ? (
                    <div className="p-4 flex items-center justify-center">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : (
                    <CommandGroup heading="Popular Cities">
                      {(popularCities || []).map((city) => (
                        <CommandItem
                          key={city.id}
                          value={city.name}
                          onSelect={() => {
                            setLocation(city.name);
                            setLocationOpen(false);
                          }}
                        >
                          <MapPin className="mr-2 h-4 w-4" />
                          {city.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Search Button */}
          <Button
            type="submit"
            size="lg"
            className="h-12 md:h-14 px-8 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-base font-semibold rounded-xl"
          >
            <Search className="h-5 w-5 mr-2" />
            Search
          </Button>
        </div>

        {/* Quick Filters - Now from API */}
        <div className="flex flex-wrap items-center gap-2 mt-3 px-2">
          <span className="text-sm text-muted-foreground">Popular:</span>
          {searchType === 'vehicle' ? (
            <>
              {loadingMakes || loadingBodyTypes ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : (
                <>
                  {/* Popular Makes */}
                  {(vehicleMakes || []).slice(0, 2).map((make) => (
                    <Button
                      key={make.id}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-full text-xs h-7"
                      onClick={() => handleQuickFilter('make', make.slug)}
                    >
                      {make.name}
                    </Button>
                  ))}
                  {/* Popular Body Types */}
                  {(bodyTypes || []).slice(0, 2).map((type) => (
                    <Button
                      key={type.id}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-full text-xs h-7"
                      onClick={() => handleQuickFilter('bodyType', type.slug)}
                    >
                      {type.icon} {type.name}
                    </Button>
                  ))}
                </>
              )}
            </>
          ) : (
            <>
              {loadingPropertyTypes ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : (
                <>
                  {/* Property Types */}
                  {(propertyTypes || []).slice(0, 3).map((type) => (
                    <Button
                      key={type.id}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-full text-xs h-7"
                      onClick={() => handleQuickFilter('propertyType', type.slug)}
                    >
                      {type.icon} {type.name}
                    </Button>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-full text-xs h-7"
                    onClick={() => handleQuickFilter('listingType', 'rent')}
                  >
                    For Rent
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-full text-xs h-7"
                    onClick={() => handleQuickFilter('listingType', 'sale')}
                  >
                    For Sale
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </form>
    </div>
  );
}
