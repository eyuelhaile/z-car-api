// ============================================
// ZCAR Marketplace Types
// ============================================

// User Types
export type UserRole = 'admin' | 'buyer' | 'private' | 'broker' | 'dealership';
export type SellerRole = 'private' | 'broker' | 'dealership';
export type SubscriptionPlan = 'basic' | 'standard' | 'premium';
export type SocialLoginProvider = 'google' | 'facebook' | 'apple';

export interface User {
  id: string;
  email: string;
  phone?: string;
  name: string;
  avatar?: string;
  role: UserRole;
  isVerified: boolean;
  phoneVerified?: boolean;
  emailVerified?: boolean;
  verified?: boolean;
  subscriptionPlan: SubscriptionPlan;
  organizationId?: string;
  commissionVehicle?: number | null;
  commissionProperty?: number | null;
  createdAt: string;
  updatedAt?: string;
  isActive?: boolean;
  emailVerifiedAt?: string | null;
  phoneVerifiedAt?: string | null;
  lastLoginAt?: string | null;
  lastLoginIp?: string | null;
  metadata?: Record<string, any>;
}

// OTP Response Types
export interface OtpSendResponse {
  phone: string;
  expiresIn: number;
  nextStep: string;
}

export interface OtpVerifyResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresAt: string;
}

export interface UserSummary {
  id: string;
  name: string;
  avatar?: string;
  phone?: string;
  role?: UserRole;
  isVerified: boolean;
  isOnline?: boolean;
  memberSince?: string;
  rating?: number;
  listingsCount?: number;
  commissionVehicle?: number | null;
  commissionProperty?: number | null;
}

// Listing Types
export type ListingType = 'vehicle' | 'property';
export type ListingStatus = 'draft' | 'pending' | 'active' | 'sold' | 'expired' | 'rejected';

export interface ListingImage {
  url: string;
  thumbnail: string;
}

export interface ListingVideo {
  url: string;
}

export interface Listing {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: ListingType;
  status: ListingStatus;
  price: number;
  currency: string;
  isNegotiable: boolean;
  isFeatured: boolean;
  location: string;
  city: string;
  region?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  images: ListingImage[];
  videos?: ListingVideo[];
  viewsCount: number;
  favoritesCount: number;
  contactsCount?: number;
  // API returns singular, but keep plural for backwards compatibility
  vehicleAttribute?: VehicleAttributes;
  vehicleAttributes?: VehicleAttributes;
  propertyAttribute?: PropertyAttributes;
  propertyAttributes?: PropertyAttributes;
  user: UserSummary;
  organization?: Organization;
  similarListings?: ListingSummary[];
  priceHistory?: PriceHistoryItem[];
  // Category field from API (same as type, but explicitly provided)
  category?: 'vehicle' | 'property';
  isVehicle?: boolean;
  isProperty?: boolean;
  hasVehicleAttributes?: boolean;
  hasPropertyAttributes?: boolean;
  createdAt: string;
  publishedAt?: string;
}

export interface ListingSummary {
  id: string;
  title: string;
  slug?: string;
  type?: ListingType;
  price: number;
  thumbnail: string;
  status?: ListingStatus;
  city?: string;
  vehicleAttributes?: Partial<VehicleAttributes>;
  propertyAttributes?: Partial<PropertyAttributes>;
}

export interface PriceHistoryItem {
  price: number;
  date: string;
}

// Vehicle Types
export type FuelType = 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'lpg';
export type TransmissionType = 'automatic' | 'manual' | 'cvt' | 'semi_auto';
export type VehicleCondition = 'new' | 'used' | 'certified';

export interface VehicleAttributes {
  make: string;
  makeSlug?: string;
  model?: string;
  year: number;
  bodyType?: string;
  bodyTypeSlug?: string;
  fuelType: FuelType;
  fuelTypeSlug?: string;
  transmission: TransmissionType;
  transmissionSlug?: string;
  mileage: number;
  engineSize?: number;
  horsepower?: number;
  color?: string;
  interiorColor?: string;
  doors?: number;
  seats?: number;
  condition: VehicleCondition;
  vin?: string;
  features: string[];
}

// Property Types
export type PropertyType = 'apartment' | 'house' | 'villa' | 'condo' | 'townhouse' | 'land' | 'commercial' | 'office';
export type PropertyListingType = 'sale' | 'rent';
export type PropertyCondition = 'new' | 'excellent' | 'good' | 'fair' | 'needs_work';

export interface PropertyAttributes {
  propertyType: PropertyType;
  listingType: PropertyListingType;
  rooms?: number;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  lotSize?: number;
  floors?: number;
  floorNumber?: number;
  yearBuilt?: number;
  parkingSpaces?: number;
  furnished: boolean;
  condition: PropertyCondition;
  amenities: string[];
  features: string[];
}

// Organization Types
export interface Organization {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  isVerified: boolean;
}

// Reference Data Types (Legacy - for backwards compatibility)
export interface VehicleMake {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  country?: string;
  isPopular: boolean;
  sortOrder?: number;
}

export interface VehicleModel {
  id: string;
  makeId: string;
  name: string;
  slug: string;
  bodyTypeName?: string;
  yearStart?: number;
  isPopular: boolean;
}

export interface BodyType {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}

export interface FuelTypeRef {
  id: string;
  name: string;
  slug: string;
}

export interface TransmissionRef {
  id: string;
  name: string;
  slug: string;
}

export interface ColorRef {
  id: string;
  name: string;
  slug: string;
  hexCode?: string;
}

export interface ConditionRef {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface PropertyTypeRef {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  listingTypes?: string[];
  isResidential?: boolean;
  isCommercial?: boolean;
}

export interface AmenityRef {
  id: string;
  name: string;
  slug: string;
  category: string;
  isPopular?: boolean;
}

export interface FeatureRef {
  id: string;
  name: string;
  slug: string;
  category: string;
  subcategory?: string;
  isPopular?: boolean;
}

export interface Region {
  id: string;
  name: string;
  slug: string;
  code: string;
  country: string;
}

export interface City {
  id: string;
  regionId: string;
  name: string;
  slug: string;
  regionName: string;
  latitude?: number;
  longitude?: number;
  isPopular: boolean;
}

// New Form Data Types (matching API response)
export interface MultiLangName {
  en: string;
  am?: string;
  om?: string;
}

export interface FormSelectOption {
  value: string;  // slug - used for form submission
  label: string;  // display text (based on lang param)
  name?: MultiLangName;
  metadata?: {
    hexCode?: string;
    [key: string]: unknown;
  };
}

export interface VehicleFormData {
  makes: FormSelectOption[];
  bodyTypes: FormSelectOption[];
  fuelTypes: FormSelectOption[];
  transmissions: FormSelectOption[];
  colors: FormSelectOption[];
  conditions: FormSelectOption[];
  features: FormSelectOption[];
}

export interface PropertyFormData {
  propertyTypes: FormSelectOption[];
  conditions: FormSelectOption[];
  amenities: FormSelectOption[];
  features: FormSelectOption[];
}

export interface LocationOption {
  value: string;  // slug
  label: string;
  name?: MultiLangName;
  isPopular?: boolean;
}

// Create Listing Request Types
export interface CreateVehicleListingRequest {
  type: 'vehicle';
  title: string;
  description: string;
  price: number;
  currency?: string;
  negotiable: boolean;
  city: string;  // city slug
  address?: string;
  latitude?: number;
  longitude?: number;
  contactPhone?: string;
  images?: string[];
  vehicleAttributes: {
    make: string;  // slug
    model?: string;
    year: number;
    bodyType: string;  // slug
    fuelType: string;  // slug
    transmission: string;  // slug
    mileage?: number;
    condition: string;  // slug
    color?: string;  // slug
    interiorColor?: string;
    doors?: number;
    seatCapacity?: number;
    engineSize?: number;
    engineCapacity?: number;
    cylinders?: number;
    horsepower?: number;
    // Electric vehicle fields
    batteryCapacity?: number;
    chargingTime?: number;
    features: string[];  // array of slugs
  };
}

export interface CreatePropertyListingRequest {
  type: 'property';
  title: string;
  description: string;
  price: number;
  currency?: string;
  negotiable: boolean;
  city: string;  // city slug
  address?: string;
  latitude?: number;
  longitude?: number;
  contactPhone?: string;
  images?: string[];
  propertyAttributes: {
    propertyType: string;  // slug
    listingType: 'sale' | 'rent';
    bedrooms?: number;
    bathrooms?: number;
    area?: number;
    floorNumber?: number;
    yearBuilt?: number;
    parkingSpaces?: number;
    furnished: boolean;
    condition: string;  // slug
    amenities: string[];  // array of slugs
    features: string[];  // array of slugs
  };
}

export type CreateListingRequest = CreateVehicleListingRequest | CreatePropertyListingRequest;

export interface PriceRange {
  id: string;
  label: string;
  minPrice: number | null;
  maxPrice: number | null;
}

export interface YearRange {
  id: string;
  label: string;
  minYear: number | null;
  maxYear: number | null;
}

// Auth Types
export interface AuthResponse {
  user: User;
  token: string;
  expiresAt: string;
}

export interface LoginCredentials {
  phone: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: 'buyer' | 'private' | 'broker' | 'dealership';
  commissionVehicle?: number;
  commissionProperty?: number;
}

// Conversation & Message Types
export interface Conversation {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  lastMessageId?: string;
  lastMessageAt?: string;
  buyerUnreadCount: number;
  sellerUnreadCount: number;
  status: 'active' | 'archived' | 'deleted';
  listing: ListingSummary & { status?: string };
  buyer: UserSummary | null;
  seller: UserSummary | null;
  messages?: Message[];
  unreadCount: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  // Computed field for UI convenience (set by frontend)
  otherUser?: UserSummary | null;
  lastMessage?: Message | null;
}

export interface Message {
  id: string;
  content: string;
  type: 'text' | 'image';
  senderId: string;
  isRead: boolean;
  createdAt: string;
}

// Review Types
export interface Review {
  id: string;
  rating: number;
  title?: string;
  content: string;
  comment?: string; // Alias for content
  reviewer: UserSummary;
  listing?: ListingSummary;
  isVerified?: boolean;
  helpfulCount: number;
  response?: {
    content: string;
    createdAt: string;
  } | string;
  responseAt?: string;
  createdAt: string;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<string, number>;
}

export interface ReviewsApiResponse {
  summary: ReviewSummary;
  reviews: Review[];
  user?: UserSummary; // The user being reviewed (seller)
}

// Badge Counts Types
export interface BadgeCounts {
  notifications: number;
  messages: number;
  appointments: number;
  favorites: number;
  total: number;
}

export interface BadgeCountsResponse {
  event: string;
  data: {
    type: string;
    counts: BadgeCounts;
  };
}

// Favorite Types
export interface Favorite {
  id: string;
  listing: ListingSummary;
  createdAt: string;
}

// Saved Search Types
export interface SavedSearch {
  id: string;
  name: string;
  filters: Record<string, unknown>;
  notifyEnabled?: boolean;
  notifyEmail?: boolean;
  notifyPush?: boolean;
  notifyFrequency?: 'daily' | 'weekly' | 'instant';
  matchCount?: number;
  newListingsCount?: number;
  lastMatchedAt?: string;
  createdAt: string;
}

// Comparison Types
export interface Comparison {
  id: string;
  name: string;
  type: ListingType;
  listings: Listing[];
  createdAt: string;
}

// Appointment Types
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  listing: ListingSummary;
  buyer: UserSummary;
  seller: UserSummary;
  scheduledAt: string;
  durationMinutes: number;
  location: string;
  notes?: string;
  status: AppointmentStatus;
  createdAt: string;
}

// Notification Types
export type NotificationType =
  | 'new_message'
  | 'listing_approved'
  | 'listing_rejected'
  | 'listing_expired'
  | 'new_favorite'
  | 'appointment_request'
  | 'appointment_confirmed'
  | 'appointment_cancelled'
  | 'new_review'
  | 'payment_received'
  | 'subscription_expiring'
  | 'saved_search_match';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

// Subscription Types
export interface SubscriptionFeatures {
  maxListings: number;
  featuredListings: number;
  photoLimit: number;
  videoLimit: number;
  priorityLevel: number;
  analyticsAccess: boolean;
  premiumSupport: boolean;
}

export interface SubscriptionPlanDetails {
  id: string;
  plan: SubscriptionPlan;
  monthlyPrice: number;
  yearlyPrice: number;
  yearlyDiscount: number;
  limits: {
    maxListings: number;
    featuredListings: number;
    photoLimit: number;
    videoLimit: number;
    priorityLevel: number;
    analyticsAccess: boolean;
    premiumSupport: boolean;
  };
  // Legacy fields for backward compatibility (optional)
  name?: SubscriptionPlan;
  displayName?: string;
  price?: number;
  currency?: string;
  billingPeriod?: string;
  period?: string;
  features?: string[];
}

export interface UserSubscription {
  id?: string;
  plan: SubscriptionPlan;
  planName?: SubscriptionPlan;
  status: 'active' | 'expired' | 'cancelled';
  price?: number;
  currency?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  startsAt?: string;
  expiresAt?: string;
  autoRenew: boolean;
  usage?: {
    listingsUsed: number;
    listingsLimit: number;
    featuredUsed: number;
    featuredLimit: number;
  };
}

// Payment Types
export type PaymentProvider = 'telebirr' | 'mpesa' | 'wallet';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Payment {
  transactionId: string;
  status: PaymentStatus;
  amount: number;
  provider: PaymentProvider;
  providerRef?: string;
  completedAt?: string;
}

export interface PaymentInitiation {
  transactionId: string;
  paymentUrl: string;
  amount: number;
  currency: string;
  expiresAt?: string;
}

// Wallet Types
export interface Wallet {
  id?: string;
  balance: number;
  pendingBalance?: number;
  currency: string;
  isActive?: boolean;
}

export interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  balance: number;
  balanceAfter?: number;
  description: string;
  reference?: string;
  createdAt: string;
}

// Boost Types
export type BoostType = 'featured' | 'highlighted' | 'top';

export interface BoostOption {
  id: string;
  type?: BoostType;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration: number;
  durationUnit: 'hours' | 'days';
  benefits?: string[];
  prices?: {
    '7_days': number;
    '14_days': number;
    '30_days': number;
  };
}

export interface Boost {
  id: string;
  listingId: string;
  type: string;
  startsAt: string;
  expiresAt: string;
  endsAt?: string;
  status: 'active' | 'expired';
  listing?: {
    id: string;
    title: string;
    thumbnail?: string;
  };
}

// Analytics Types
export interface ListingAnalytics {
  summary: {
    totalViews: number;
    uniqueViews: number;
    favorites: number;
    contacts: number;
    shares: number;
  };
  chart: Array<{
    date: string;
    views: number;
    favorites: number;
    contacts: number;
  }>;
  topSources: Array<{
    source: string;
    percentage: number;
  }>;
}

export interface DashboardStat {
  name: string;
  value: number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
}

export interface DashboardRecentListing {
  id: string;
  title: string;
  status: string;
  price: number;
  views: number;
  favorites: number;
  image: string;
  slug?: string;
  type?: 'vehicle' | 'property';
}

export interface DashboardRecentMessage {
  id: string;
  user: string;
  avatar: string;
  message: string;
  time: string;
  unread: boolean;
}

export interface DashboardAppointment {
  id: string;
  listing: string;
  buyer: string;
  date: string;
  location: string;
  status: string;
}

export interface DashboardSubscription {
  plan: string;
  expiresIn: number;
  listingsUsed: number;
  listingsLimit: number;
  featuredUsed: number;
  featuredLimit: number;
}

export interface DashboardAnalytics {
  stats: {
    buyer: DashboardStat[];
    seller: DashboardStat[];
  };
  recentListings: DashboardRecentListing[];
  recentMessages: DashboardRecentMessage[];
  upcomingAppointments: DashboardAppointment[];
  subscription: DashboardSubscription | null;
}

// Analytics Page Types (for /dashboard/analytics)
export interface AnalyticsOverview {
  overview: {
    totalListings: number;
    activeListings: number;
    totalViews: number;
    totalFavorites: number;
    totalContacts: number;
    conversionRate?: number;
  };
  performance: {
    viewsTrend: number;
    favoritesTrend: number;
    contactsTrend: number;
  };
  topListings: Array<{
    id: string;
    title: string;
    thumbnail?: string;
    views: number;
    favorites: number;
  }>;
  recentActivity: Array<{
    type: string;
    listing: string;
    listingId: string;
    createdAt: string;
  }>;
}

// Report Types
export type ReportReason = 'spam' | 'misleading' | 'inappropriate' | 'fraud' | 'duplicate' | 'other';

export interface Report {
  entityType: 'listing' | 'user';
  entityId: string;
  reason: ReportReason;
  description?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  code?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message?: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// Search/Filter Types
export interface ListingFilters {
  page?: number;
  limit?: number;
  type?: ListingType;
  status?: ListingStatus;
  sellerRole?: SellerRole;
  userId?: string;
  minPrice?: number;
  maxPrice?: number;
  city?: string;
  region?: string;
  location?: string;
  isFeatured?: boolean;
  sortBy?: 'price' | 'createdAt' | 'viewsCount';
  sortOrder?: 'ASC' | 'DESC';
  // Vehicle filters
  make?: string;
  model?: string;
  bodyType?: string;
  minYear?: number;
  maxYear?: number;
  fuelType?: string;
  transmission?: string;
  minMileage?: number;
  maxMileage?: number;
  condition?: string;
  // Property filters
  propertyType?: string;
  listingType?: 'sale' | 'rent';
  minRooms?: number;
  maxRooms?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  minArea?: number;
  maxArea?: number;
  furnished?: boolean;
}

