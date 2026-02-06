'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Car,
  Home,
  Shield,
  TrendingUp,
  Users,
  Star,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  MapPin,
  Zap,
  Loader2,
  Smartphone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { SearchBar } from '@/components/search/search-bar';
import { ListingCard } from '@/components/listings/listing-card';
import { useFeaturedListings, useLatestListings } from '@/hooks/use-listings';
import { useBodyTypes, usePropertyTypes } from '@/hooks/use-reference-data';

const stats = [
  { label: 'Active Listings', value: '15,000+', icon: TrendingUp },
  { label: 'Verified Sellers', value: '2,500+', icon: Shield },
  { label: 'Happy Customers', value: '50,000+', icon: Users },
  { label: 'Cities Covered', value: '25+', icon: MapPin },
];

const features = [
  {
    icon: Shield,
    title: 'Verified Sellers',
    description: 'All sellers are verified for your safety and peace of mind',
  },
  {
    icon: Zap,
    title: 'Quick Listings',
    description: 'Post your ad in minutes and reach thousands of buyers',
  },
  {
    icon: Star,
    title: 'Premium Support',
    description: '24/7 customer support to help you every step of the way',
  },
];

// Fallback images for categories
const categoryImages: Record<string, string> = {
  suv: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=400',
  sedan: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400',
  pickup: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
  hatchback: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=400',
  apartment: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400',
  house: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
  villa: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400',
  commercial: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400',
  land: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400',
};

function FeaturedListingsSection() {
  // Fetch featured listings from API
  const { data: featuredListings, isLoading, error } = useFeaturedListings(undefined, 8);

  if (isLoading) {
    return (
      <section className="py-20 bg-muted/50">
        <div className="container">
          <div className="flex items-center justify-between mb-10">
            <div>
              <Badge className="mb-2 bg-amber-100 text-amber-700 hover:bg-amber-100">
                <Sparkles className="h-3 w-3 mr-1" />
                Featured
              </Badge>
              <h2 className="text-3xl font-bold">Top Listings</h2>
              <p className="text-muted-foreground mt-2">Hand-picked listings from verified sellers</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
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
        </div>
      </section>
    );
  }

  if (error || !featuredListings || featuredListings.length === 0) {
    return null; // Don't show section if no featured listings
  }

  return (
    <section className="py-20 bg-muted/50">
      <div className="container">
        <div className="flex items-center justify-between mb-10">
          <div>
            <Badge className="mb-2 bg-amber-100 text-amber-700 hover:bg-amber-100">
              <Sparkles className="h-3 w-3 mr-1" />
              Featured
            </Badge>
            <h2 className="text-3xl font-bold">Top Listings</h2>
            <p className="text-muted-foreground mt-2">Hand-picked listings from verified sellers</p>
          </div>
          <Link href="/vehicles?featured=true">
            <Button variant="outline" className="gap-2">
              See All <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredListings.slice(0, 8).map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </div>
    </section>
  );
}

function LatestVehiclesSection() {
  const { data: listings, isLoading } = useLatestListings('vehicle', 4);

  if (isLoading) {
    return (
      <section className="py-16 bg-background">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">Latest Vehicles</h2>
              <p className="text-muted-foreground mt-1">Recently added vehicles</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-[4/3]" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!listings || listings.length === 0) return null;

  return (
    <section className="py-16 bg-background">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">Latest Vehicles</h2>
            <p className="text-muted-foreground mt-1">Recently added vehicles</p>
          </div>
          <Link href="/vehicles">
            <Button variant="outline" className="gap-2">
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </div>
    </section>
  );
}

function LatestPropertiesSection() {
  const { data: listings, isLoading } = useLatestListings('property', 4);

  if (isLoading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">Latest Properties</h2>
              <p className="text-muted-foreground mt-1">Recently added properties</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-[4/3]" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!listings || listings.length === 0) return null;

  return (
    <section className="py-16 bg-muted/30">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">Latest Properties</h2>
            <p className="text-muted-foreground mt-1">Recently added properties</p>
          </div>
          <Link href="/properties">
            <Button variant="outline" className="gap-2">
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PopularCategoriesSection() {
  const { data: bodyTypes, isLoading: loadingBodyTypes } = useBodyTypes();
  const { data: propertyTypes, isLoading: loadingPropertyTypes } = usePropertyTypes();

  const isLoading = loadingBodyTypes || loadingPropertyTypes;

  // Build categories from API data
  // Handle both old format (slug) and new format (value)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const vehicleCategories = (bodyTypes || []).slice(0, 2).map((bt: any) => {
    const slug = bt.slug || bt.value || '';
    return {
      name: bt.name || bt.label || slug,
      slug: slug,
      icon: bt.icon,
      image: categoryImages[slug.toLowerCase()] || categoryImages.suv,
      href: `/vehicles?bodyType=${slug}`,
      type: 'vehicle',
    };
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const propertyCategories = (propertyTypes || []).slice(0, 2).map((pt: any) => {
    const slug = pt.slug || pt.value || '';
    return {
      name: pt.name || pt.label || slug,
      slug: slug,
      icon: pt.icon,
      image: categoryImages[slug.toLowerCase()] || categoryImages.apartment,
      href: `/properties?propertyType=${slug}`,
      type: 'property',
    };
  });

  const categories = [...vehicleCategories, ...propertyCategories];

  // Fallback categories if API data is not available
  const fallbackCategories = [
    { name: 'SUVs', slug: 'suv', image: categoryImages.suv, href: '/vehicles?bodyType=suv', type: 'vehicle' },
    { name: 'Sedans', slug: 'sedan', image: categoryImages.sedan, href: '/vehicles?bodyType=sedan', type: 'vehicle' },
    { name: 'Apartments', slug: 'apartment', image: categoryImages.apartment, href: '/properties?propertyType=apartment', type: 'property' },
    { name: 'Houses', slug: 'house', image: categoryImages.house, href: '/properties?propertyType=house', type: 'property' },
  ];

  const displayCategories = categories.length > 0 ? categories : fallbackCategories;

  if (isLoading) {
    return (
      <section className="py-20 bg-background">
        <div className="container">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold">Popular Categories</h2>
              <p className="text-muted-foreground mt-2">Explore our most searched categories</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-[4/3]" />
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-background">
      <div className="container">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold">Popular Categories</h2>
            <p className="text-muted-foreground mt-2">Explore our most searched categories</p>
          </div>
          <Link href="/vehicles">
            <Button variant="outline" className="gap-2">
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {displayCategories.map((category) => (
            <Link key={category.slug} href={category.href}>
              <Card className="overflow-hidden group cursor-pointer card-hover">
                <div className="relative aspect-[4/3]">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-semibold text-white">{category.name}</h3>
                    <p className="text-white/70 text-sm">Browse listings</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center hero-gradient overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl" />

        <div className="container relative z-10 py-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8 animate-fade-in">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span className="text-white/90 text-sm">Ethiopia&apos;s #1 Marketplace</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 animate-slide-up">
              Find Your Perfect
              <span className="block mt-2 bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                Vehicle or Property
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto animate-slide-up stagger-1">
              Browse thousands of verified listings for cars, SUVs, apartments, houses, and more. Your dream purchase is just a click away.
            </p>

            {/* Search Bar */}
            <div className="animate-slide-up stagger-2">
              <SearchBar variant="hero" />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mt-16 animate-slide-up stagger-3">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm mb-3">
                    <stat.icon className="h-6 w-6 text-amber-400" />
                  </div>
                  <p className="text-2xl md:text-3xl font-bold text-white">{stat.value}</p>
                  <p className="text-white/60 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="oklch(0.995 0 0)"/>
          </svg>
        </div>
      </section>

      {/* Popular Categories - Now from API */}
      <PopularCategoriesSection />

      {/* Featured Listings - Now from API */}
      <FeaturedListingsSection />

      {/* Latest Vehicles - Now from API */}
      <LatestVehiclesSection />

      {/* Latest Properties - Now from API */}
      <LatestPropertiesSection />

      {/* Browse by Type */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">What are you looking for?</h2>
            <p className="text-muted-foreground mt-2">Choose a category to start browsing</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Vehicles Card */}
            <Link href="/vehicles">
              <Card className="overflow-hidden group cursor-pointer card-hover border-2 hover:border-amber-500/50">
                <CardContent className="p-0">
                  <div className="relative h-48 bg-gradient-to-br from-slate-800 to-slate-900">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Car className="h-24 w-24 text-amber-500/80" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold group-hover:text-amber-600 transition-colors">
                          Vehicles
                        </h3>
                        <p className="text-muted-foreground mt-1">
                          Cars, SUVs, Trucks & More
                        </p>
                      </div>
                      <div className="bg-amber-100 text-amber-700 rounded-full p-3 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                        <ArrowRight className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Badge variant="secondary">Browse All</Badge>
                      <Badge variant="secondary">All Brands</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Properties Card */}
            <Link href="/properties">
              <Card className="overflow-hidden group cursor-pointer card-hover border-2 hover:border-amber-500/50">
                <CardContent className="p-0">
                  <div className="relative h-48 bg-gradient-to-br from-emerald-800 to-emerald-900">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Home className="h-24 w-24 text-amber-500/80" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold group-hover:text-amber-600 transition-colors">
                          Properties
                        </h3>
                        <p className="text-muted-foreground mt-1">
                          Apartments, Houses, Villas & More
                        </p>
                      </div>
                      <div className="bg-amber-100 text-amber-700 rounded-full p-3 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                        <ArrowRight className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Badge variant="secondary">Browse All</Badge>
                      <Badge variant="secondary">Buy & Rent</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Why Choose ZCAR?</h2>
            <p className="text-muted-foreground mt-2">The trusted marketplace for Ethiopians</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <Card key={feature.title} className="text-center p-8 card-hover border-0 shadow-lg">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 mb-6">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>

          {/* Download App Section */}
          <div className="mt-16 pt-12 border-t">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 mb-4 mx-auto">
                <Smartphone className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Download Our Mobile App</h3>
              <p className="text-muted-foreground">Get the ZCAR app for a better experience on the go</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://play.google.com/store/apps/details?id=com.zcar.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-900 transition-colors shadow-lg hover:shadow-xl"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                </svg>
                <div className="text-left">
                  <div className="text-xs text-gray-300">Get it on</div>
                  <div className="text-lg font-semibold">Google Play</div>
                </div>
              </a>
              <a
                href="https://apps.apple.com/app/zcar/id123456789"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-900 transition-colors shadow-lg hover:shadow-xl"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05,20.28C16.17,21.23 15,22.05 13.78,22.05C12.89,22.05 12.33,21.5 11.22,21.5C10.11,21.5 9.5,22.05 8.61,22.05C7.39,22.05 6.17,21.17 5.28,20.17C3.89,18.39 2.89,15.67 3.06,13C3.22,10.5 4.28,8.22 5.78,6.89C6.78,6 7.89,5.5 9,5.5C10,5.5 10.89,6 11.89,6C12.78,6 13.61,5.5 14.78,5.5C15.89,5.5 16.89,5.89 17.83,6.67C15.11,8.22 13.89,11.39 14.39,14.61C14.78,16.89 15.78,18.89 17.05,20.28M12,2C13.11,2 14.11,2.5 14.83,3.17C15.56,3.83 16,4.78 16,5.89C16,5.94 16,6 15.94,6.06C14.89,6 13.89,5.5 13.17,4.83C12.44,4.17 12,3.22 12,2.11C12,2.06 12,2 12,2Z" />
                </svg>
                <div className="text-left">
                  <div className="text-xs text-gray-300">Download on the</div>
                  <div className="text-lg font-semibold">App Store</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-amber-500 to-orange-600">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Sell Your Vehicle or Property?
            </h2>
            <p className="text-white/90 text-lg mb-8">
              Join thousands of sellers and reach millions of buyers. Post your first ad for free!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/register">
                <Button size="lg" className="bg-white text-amber-600 hover:bg-white/90 px-8">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8">
                  View Pricing
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-center gap-6 mt-8 text-white/80 text-sm">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Free basic listings
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                No hidden fees
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                24/7 support
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
