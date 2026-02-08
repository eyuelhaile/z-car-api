import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import {
  ApiResponse,
  PaginatedResponse,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
  UserSummary,
  Listing,
  ListingSummary,
  ListingFilters,
  Conversation,
  Message,
  Review,
  ReviewSummary,
  Favorite,
  SavedSearch,
  Comparison,
  Appointment,
  Notification,
  SubscriptionPlanDetails,
  UserSubscription,
  PaymentInitiation,
  Payment,
  Wallet,
  WalletTransaction,
  BoostOption,
  Boost,
  ListingAnalytics,
  DashboardAnalytics,
  AnalyticsOverview,
  VehicleMake,
  VehicleModel,
  BodyType,
  FuelTypeRef,
  TransmissionRef,
  ColorRef,
  ConditionRef,
  PropertyTypeRef,
  AmenityRef,
  FeatureRef,
  Region,
  City,
  PriceRange,
  YearRange,
  BadgeCountsResponse,
  VehicleFormData,
  PropertyFormData,
  LocationOption,
  CreateListingRequest,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Don't auto-redirect on auth callback pages or if the failing request is an auth request
          const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
          const isAuthCallback = currentPath.includes('/auth/success') || currentPath.includes('/oauth/callback');

          const requestUrl = (error.config && (error.config.url as string)) || '';
          const isAuthRequest =
            requestUrl.includes('/auth/login') ||
            requestUrl.includes('/auth/verify-otp') ||
            requestUrl.includes('/auth/login-otp') ||
            requestUrl.includes('/auth/send-phone-otp') ||
            requestUrl.includes('/auth/register') ||
            requestUrl.includes('/auth/social');

          if (!isAuthCallback && !isAuthRequest) {
            this.clearToken();
            if (typeof window !== 'undefined') {
              window.location.href = '/auth/login';
            }
          }
          // For auth requests, just reject the error so the caller can handle it
        }
        return Promise.reject(error);
      }
    );

    // Initialize token from localStorage
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('zcar_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('zcar_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('zcar_token');
      localStorage.removeItem('zcar_user');
    }
  }

  getToken() {
    return this.token;
  }

  // ============================================
  // Auth Endpoints
  // ============================================
  async register(data: RegisterData): Promise<ApiResponse<{ phone: string; expiresIn: number; nextStep: string }>> {
    const response = await this.client.post('/auth/register', data);
    return response.data;
  }

  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    const response = await this.client.post('/auth/login', credentials);
    return response.data;
  }

  async logout(): Promise<void> {
    await this.client.post('/auth/logout');
    this.clearToken();
  }

  async getMe(): Promise<ApiResponse<User>> {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  async getBadgeCounts(): Promise<ApiResponse<BadgeCountsResponse>> {
    const response = await this.client.get('/users/me/badge-counts');
    return response.data;
  }

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    const response = await this.client.put('/auth/profile', data);
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    const response = await this.client.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  }

  // ============================================
  // OTP Verification Endpoints (Registration)
  // ============================================
  async verifyOtp(phone: string, otp: string): Promise<ApiResponse<{ user: User; token: string; refreshToken: string; expiresAt: string }>> {
    const response = await this.client.post('/auth/verify-otp', { phone, otp });
    return response.data;
  }

  async resendOtp(phone: string): Promise<ApiResponse<{ phone: string; expiresIn: number }>> {
    const response = await this.client.post('/auth/resend-otp', { phone });
    return response.data;
  }

  // ============================================
  // OTP Login Endpoints (Alternative to password login)
  // ============================================
  async sendLoginOtp(phone: string): Promise<ApiResponse<{ phone: string; expiresIn: number }>> {
    const response = await this.client.post('/auth/send-login-otp', { phone });
    return response.data;
  }

  async verifyLoginOtp(phone: string, otp: string): Promise<ApiResponse<{ user: User; token: string; refreshToken: string; expiresAt: string }>> {
    const response = await this.client.post('/auth/verify-login-otp', { phone, otp });
    return response.data;
  }

  // ============================================
  // Phone Verification Endpoints (For existing users)
  // ============================================
  async sendPhoneOtp(phone: string): Promise<ApiResponse<{ phone: string; expiresIn: number }>> {
    const response = await this.client.post('/auth/send-phone-otp', { phone });
    return response.data;
  }

  async verifyPhone(phone: string, otp: string): Promise<ApiResponse<User>> {
    const response = await this.client.post('/auth/verify-phone', { phone, otp });
    return response.data;
  }

  // ============================================
  // User Settings & Account
  // ============================================
  async getMySettings(): Promise<ApiResponse<any>> {
    const response = await this.client.get('/users/me/settings');
    return response.data;
  }

  async updateMySettings(settings: any): Promise<ApiResponse<any>> {
    const response = await this.client.put('/users/me/settings', settings);
    return response.data;
  }

  async deleteMe(): Promise<ApiResponse<void>> {
    const response = await this.client.delete('/users/me');
    return response.data;
  }

  // ============================================
  // Social Login Endpoints
  // ============================================
  async getSocialProviders(): Promise<ApiResponse<Array<{
    provider: string;
    authUrl: string;
  }>>> {
    const response = await this.client.get('/auth/social/providers');
    return response.data;
  }

  getSocialLoginUrl(provider: 'google' | 'facebook' | 'apple', state?: string): string {
    const baseUrl = API_BASE_URL.replace('/api/v1', '');
    const authUrl = `${baseUrl}/api/v1/auth/${provider}`;
    if (state) {
      return `${authUrl}?state=${encodeURIComponent(state)}`;
    }
    return authUrl;
  }

  async socialLoginWithToken(
    provider: 'google' | 'facebook' | 'apple',
    idToken?: string,
    accessToken?: string
  ): Promise<ApiResponse<AuthResponse & { isNewUser: boolean }>> {
    const response = await this.client.post('/auth/social/token', {
      provider,
      ...(idToken ? { idToken } : {}),
      ...(accessToken ? { token: accessToken } : {}),
    });
    return response.data;
  }

  // ============================================
  // Reference Data Endpoints
  // ============================================
  async getAllReferenceData(): Promise<ApiResponse<{
    vehicle: {
      makes: VehicleMake[];
      bodyTypes: BodyType[];
      fuelTypes: FuelTypeRef[];
      transmissions: TransmissionRef[];
      colors: ColorRef[];
      conditions: ConditionRef[];
      yearRanges: YearRange[];
      priceRanges: PriceRange[];
    };
    property: {
      propertyTypes: PropertyTypeRef[];
      conditions: ConditionRef[];
      amenities: AmenityRef[];
      features: FeatureRef[];
      priceRanges: PriceRange[];
    };
    locations: {
      regions: Region[];
      popularCities: City[];
    };
  }>> {
    const response = await this.client.get('/reference/all');
    return response.data;
  }

  async getVehicleFormData(lang: string = 'en'): Promise<ApiResponse<VehicleFormData>> {
    const response = await this.client.get('/reference/vehicle/form-data', {
      params: { lang },
    });
    return response.data;
  }

  async getVehicleMakes(popular?: boolean): Promise<ApiResponse<VehicleMake[]>> {
    const response = await this.client.get('/reference/vehicle/makes', {
      params: { popular },
    });
    return response.data;
  }

  async getVehicleModels(makeId: string): Promise<ApiResponse<VehicleModel[]>> {
    const response = await this.client.get(`/reference/vehicle/makes/${makeId}/models`);
    return response.data;
  }

  async searchVehicleModels(query: string, makeId?: string): Promise<ApiResponse<VehicleModel[]>> {
    const response = await this.client.get('/reference/vehicle/models/search', {
      params: { q: query, makeId },
    });
    return response.data;
  }

  async getBodyTypes(): Promise<ApiResponse<BodyType[]>> {
    const response = await this.client.get('/reference/vehicle/body-types');
    return response.data;
  }

  async getFuelTypes(): Promise<ApiResponse<FuelTypeRef[]>> {
    const response = await this.client.get('/reference/vehicle/fuel-types');
    return response.data;
  }

  async getTransmissions(): Promise<ApiResponse<TransmissionRef[]>> {
    const response = await this.client.get('/reference/vehicle/transmissions');
    return response.data;
  }

  async getColors(): Promise<ApiResponse<ColorRef[]>> {
    const response = await this.client.get('/reference/vehicle/colors');
    return response.data;
  }

  async getVehicleConditions(): Promise<ApiResponse<ConditionRef[]>> {
    const response = await this.client.get('/reference/vehicle/conditions');
    return response.data;
  }

  async getPropertyFormData(lang: string = 'en'): Promise<ApiResponse<PropertyFormData>> {
    const response = await this.client.get('/reference/property/form-data', {
      params: { lang },
    });
    return response.data;
  }

  async getPropertyTypes(residential?: boolean): Promise<ApiResponse<PropertyTypeRef[]>> {
    const response = await this.client.get('/reference/property/types', {
      params: { residential },
    });
    return response.data;
  }

  async getPropertyConditions(): Promise<ApiResponse<ConditionRef[]>> {
    const response = await this.client.get('/reference/property/conditions');
    return response.data;
  }

  async getAmenities(category?: string): Promise<ApiResponse<AmenityRef[]>> {
    const response = await this.client.get('/reference/property/amenities', {
      params: { category },
    });
    return response.data;
  }

  async getFeatures(category: string, subcategory?: string): Promise<ApiResponse<FeatureRef[]>> {
    const response = await this.client.get('/reference/features', {
      params: { category, subcategory },
    });
    return response.data;
  }

  async getRegions(lang: string = 'en'): Promise<ApiResponse<Region[]>> {
    const response = await this.client.get('/reference/locations/regions', {
      params: { lang },
    });
    return response.data;
  }

  async getCities(regionId?: string, lang: string = 'en'): Promise<ApiResponse<City[]>> {
    const response = await this.client.get('/reference/locations/cities', {
      params: { regionId, lang },
    });
    return response.data;
  }

  // Get cities as LocationOption format (for form dropdowns)
  async getCitiesForForm(lang: string = 'en'): Promise<ApiResponse<LocationOption[]>> {
    const response = await this.client.get('/reference/locations/cities', {
      params: { lang },
    });
    return response.data;
  }

  async getPopularCities(): Promise<ApiResponse<City[]>> {
    const response = await this.client.get('/reference/locations/cities/popular');
    return response.data;
  }

  async getPriceRanges(category: 'vehicle' | 'property'): Promise<ApiResponse<PriceRange[]>> {
    const response = await this.client.get(`/reference/filters/price-ranges/${category}`);
    return response.data;
  }

  async getYearRanges(): Promise<ApiResponse<YearRange[]>> {
    const response = await this.client.get('/reference/filters/year-ranges');
    return response.data;
  }

  // ============================================
  // Listing Endpoints
  // ============================================
  async getListings(filters?: ListingFilters): Promise<PaginatedResponse<Listing>> {
    const response = await this.client.get('/listings', { params: filters });
    return response.data;
  }

  async getFeaturedListings(type?: 'vehicle' | 'property', limit?: number): Promise<ApiResponse<Listing[]>> {
    const response = await this.client.get('/listings/featured', {
      params: { type, limit },
    });
    return response.data;
  }

  async getLatestListings(type?: 'vehicle' | 'property', limit?: number): Promise<ApiResponse<Listing[]>> {
    const response = await this.client.get('/listings/latest', {
      params: { type, limit },
    });
    return response.data;
  }

  async getListing(id: string): Promise<ApiResponse<Listing>> {
    const response = await this.client.get(`/listings/${id}`);
    return response.data;
  }

  async getListingBySlug(slug: string): Promise<ApiResponse<Listing>> {
    const response = await this.client.get(`/listings/slug/${slug}`);
    return response.data;
  }

  async createListing(data: CreateListingRequest | Partial<Listing>): Promise<ApiResponse<{ id: string; slug: string; status: string }>> {
    const response = await this.client.post('/listings', data);
    return response.data;
  }

  async updateListing(id: string, data: Partial<Listing>): Promise<ApiResponse<Listing>> {
    const response = await this.client.put(`/listings/${id}`, data);
    return response.data;
  }

  async deleteListing(id: string): Promise<ApiResponse<void>> {
    const response = await this.client.delete(`/listings/${id}`);
    return response.data;
  }

  // Mark listing as sold (seller)
  async markListingSold(id: string): Promise<ApiResponse<Listing>> {
    const response = await this.client.post(`/listings/${id}/sold`);
    return response.data;
  }

  // Remove listing from user's listings (seller)
  async removeListing(id: string): Promise<ApiResponse<void>> {
    const response = await this.client.post(`/listings/${id}/remove`);
    return response.data;
  }

  // Publish listing (seller can publish their own listing)
  async publishListing(id: string): Promise<ApiResponse<Listing>> {
    const response = await this.client.post(`/listings/${id}/publish`);
    return response.data;
  }

  // Approve listing (admin only)
  async approveListing(id: string): Promise<ApiResponse<Listing>> {
    const response = await this.client.post(`/listings/${id}/approve`);
    return response.data;
  }

  // Feature listing (admin only)
  async featureListing(id: string, durationDays: number): Promise<ApiResponse<Listing>> {
    const response = await this.client.post(`/listings/${id}/feature`, { durationDays });
    return response.data;
  }

  async getMyListings(status?: string, page?: number, limit?: number): Promise<PaginatedResponse<Listing>> {
    const response = await this.client.get('/listings/my', {
      params: { status, page, limit },
    });
    return response.data;
  }

  // ============================================
  // Favorites Endpoints
  // ============================================
  async getFavorites(): Promise<ApiResponse<Favorite[]>> {
    const response = await this.client.get('/listings/favorites');
    return response.data;
  }

  async addFavorite(listingId: string): Promise<ApiResponse<void>> {
    const response = await this.client.post(`/listings/${listingId}/favorite`);
    return response.data;
  }

  async removeFavorite(listingId: string): Promise<ApiResponse<void>> {
    const response = await this.client.delete(`/listings/${listingId}/favorite`);
    return response.data;
  }

  // ============================================
  // Messaging Endpoints
  // ============================================
  async getConversations(): Promise<ApiResponse<{ conversations: Conversation[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>> {
    const response = await this.client.get('/messages/conversations');
    return response.data;
  }

  async getMessages(conversationId: string, page?: number, limit?: number): Promise<ApiResponse<{
    conversation: Conversation;
    messages: Message[];
    pagination: { currentPage: number; totalPages: number };
  }>> {
    const response = await this.client.get(`/messages/conversations/${conversationId}`, {
      params: { page, limit },
    });
    return response.data;
  }

  async sendMessage(conversationId: string, content: string, type: 'text' | 'image' = 'text'): Promise<ApiResponse<Message>> {
    const response = await this.client.post(`/messages/conversations/${conversationId}`, {
      content,
      type,
    });
    return response.data;
  }

  async startConversation(
    listingId: string, 
    receiverId: string, 
    message: string
  ): Promise<ApiResponse<{ conversationId: string }>> {
    const response = await this.client.post('/messages/conversations', {
      listingId,
      receiverId,
      message,
    });
    return response.data;
  }

  async markConversationRead(conversationId: string): Promise<ApiResponse<void>> {
    const response = await this.client.post(`/messages/conversations/${conversationId}/read`);
    return response.data;
  }

  // ============================================
  // Review Endpoints
  // ============================================
  async getReviews(userId: string): Promise<ApiResponse<{ summary: ReviewSummary; reviews: Review[]; user?: UserSummary }>> {
    const response = await this.client.get(`/reviews/user/${userId}`);
    return response.data;
  }

  async createReview(data: {
    revieweeId: string;
    listingId: string;
    rating: number;
    title: string;
    comment: string;
  }): Promise<ApiResponse<Review>> {
    const response = await this.client.post('/reviews', data);
    return response.data;
  }

  async respondToReview(reviewId: string, response: string): Promise<ApiResponse<Review>> {
    const res = await this.client.post(`/reviews/${reviewId}/respond`, { response });
    return res.data;
  }

  async voteReview(reviewId: string, isHelpful: boolean): Promise<ApiResponse<void>> {
    const response = await this.client.post(`/reviews/${reviewId}/vote`, { isHelpful });
    return response.data;
  }

  // ============================================
  // Saved Search Endpoints
  // ============================================
  async getSavedSearches(): Promise<ApiResponse<SavedSearch[]>> {
    const response = await this.client.get('/saved-searches');
    return response.data;
  }

  async createSavedSearch(data: {
    name: string;
    filters: Record<string, unknown>;
    notifyEnabled: boolean;
    notifyFrequency: 'daily' | 'weekly' | 'instant';
  }): Promise<ApiResponse<SavedSearch>> {
    const response = await this.client.post('/saved-searches', data);
    return response.data;
  }

  async deleteSavedSearch(id: string): Promise<ApiResponse<void>> {
    const response = await this.client.delete(`/saved-searches/${id}`);
    return response.data;
  }

  // ============================================
  // Comparison Endpoints
  // ============================================
  async getComparisons(): Promise<ApiResponse<Comparison[]>> {
    const response = await this.client.get('/comparisons');
    return response.data;
  }

  async createComparison(name: string, listingIds: string[]): Promise<ApiResponse<Comparison>> {
    const response = await this.client.post('/comparisons', { name, listingIds });
    return response.data;
  }

  async addToComparison(comparisonId: string, listingId: string): Promise<ApiResponse<void>> {
    const response = await this.client.post(`/comparisons/${comparisonId}/listings`, { listingId });
    return response.data;
  }

  async removeFromComparison(comparisonId: string, listingId: string): Promise<ApiResponse<void>> {
    const response = await this.client.delete(`/comparisons/${comparisonId}/listings/${listingId}`);
    return response.data;
  }

  // Comparison Cart Endpoints
  async getComparisonCart(type: 'vehicle' | 'property'): Promise<ApiResponse<{
    id: string;
    listingIds: string[];
    listings: Listing[];
    type: 'vehicle' | 'property';
    canCompare: boolean;
  }>> {
    const response = await this.client.get('/comparisons/cart', { params: { type } });
    return response.data;
  }

  async addToComparisonCart(listingId: string): Promise<ApiResponse<{
    id: string;
    listingIds: string[];
    listings: Listing[];
    type: 'vehicle' | 'property';
    canCompare: boolean;
  }>> {
    const response = await this.client.post('/comparisons/cart', { listingId });
    return response.data;
  }

  async removeFromComparisonCart(listingId: string, type: 'vehicle' | 'property'): Promise<ApiResponse<void>> {
    const response = await this.client.delete(`/comparisons/cart/${listingId}`, { params: { type } });
    return response.data;
  }

  async clearComparisonCart(type: 'vehicle' | 'property'): Promise<ApiResponse<void>> {
    const response = await this.client.delete('/comparisons/cart', { params: { type } });
    return response.data;
  }

  // ============================================
  // Appointment Endpoints
  // ============================================
  async getAppointments(status?: string, role?: 'buyer' | 'seller'): Promise<ApiResponse<Appointment[]>> {
    const response = await this.client.get('/appointments', {
      params: { status, role },
    });
    return response.data;
  }

  async bookAppointment(data: {
    listingId: string;
    scheduledAt: string;
    durationMinutes: number;
    location: string;
    notes?: string;
  }): Promise<ApiResponse<Appointment>> {
    const response = await this.client.post('/appointments', data);
    return response.data;
  }

  async updateAppointmentStatus(id: string, status: string): Promise<ApiResponse<Appointment>> {
    const response = await this.client.put(`/appointments/${id}/status`, { status });
    return response.data;
  }

  async cancelAppointment(id: string): Promise<ApiResponse<void>> {
    const response = await this.client.post(`/appointments/${id}/cancel`);
    return response.data;
  }

  // ============================================
  // Notification Endpoints
  // ============================================
  async getNotifications(unreadOnly?: boolean, page?: number, limit?: number): Promise<ApiResponse<{
    unreadCount: number;
    notifications: Notification[];
  }>> {
    const response = await this.client.get('/notifications', {
      params: { unreadOnly, page, limit },
    });
    return response.data;
  }

  async markNotificationRead(id: string): Promise<ApiResponse<void>> {
    const response = await this.client.post(`/notifications/${id}/read`);
    return response.data;
  }

  async markAllNotificationsRead(): Promise<ApiResponse<void>> {
    const response = await this.client.post('/notifications/read-all');
    return response.data;
  }

  async registerDeviceToken(token: string, platform: 'android' | 'ios' | 'web'): Promise<ApiResponse<void>> {
    const response = await this.client.post('/notifications/device-token', { token, platform });
    return response.data;
  }

  // ============================================
  // Subscription Endpoints
  // ============================================
  async getSubscriptionPlans(): Promise<ApiResponse<SubscriptionPlanDetails[]>> {
    const response = await this.client.get('/subscriptions/plans');
    return response.data;
  }

  async getMySubscription(): Promise<ApiResponse<UserSubscription>> {
    const response = await this.client.get('/subscriptions/my');
    return response.data;
  }

  async subscribe(planName: string, billingPeriod: 'monthly' | 'yearly', paymentMethod: string, autoRenew: boolean): Promise<ApiResponse<PaymentInitiation>> {
    const response = await this.client.post('/subscriptions/subscribe', {
      planName,
      billingPeriod,
      paymentMethod,
      autoRenew,
    });
    return response.data;
  }

  // ============================================
  // Payment Endpoints
  // ============================================
  async initiatePayment(data: {
    provider: string;
    amount: number;
    type: string;
    referenceId: string;
    returnUrl: string;
  }): Promise<ApiResponse<PaymentInitiation>> {
    const response = await this.client.post('/payments/initiate', data);
    return response.data;
  }

  async verifyPayment(transactionId: string): Promise<ApiResponse<Payment>> {
    const response = await this.client.get(`/payments/${transactionId}/verify`);
    return response.data;
  }

  async getPaymentHistory(): Promise<ApiResponse<Payment[]>> {
    const response = await this.client.get('/payments/history');
    return response.data;
  }

  // ============================================
  // Wallet Endpoints
  // ============================================
  async getWallet(): Promise<ApiResponse<Wallet>> {
    const response = await this.client.get('/wallet');
    return response.data;
  }

  async getWalletTransactions(): Promise<ApiResponse<WalletTransaction[]>> {
    const response = await this.client.get('/wallet/transactions');
    return response.data;
  }

  async topUpWallet(amount: number, paymentMethod: string): Promise<ApiResponse<PaymentInitiation>> {
    const response = await this.client.post('/wallet/topup', { amount, paymentMethod });
    return response.data;
  }

  // ============================================
  // Boost Endpoints
  // ============================================
  async getBoostOptions(): Promise<ApiResponse<BoostOption[]>> {
    const response = await this.client.get('/boosts/options');
    return response.data;
  }

  // Get boost pricing information
  async getBoostPricing(): Promise<ApiResponse<Array<{
    type: string;
    name: string;
    description: string;
    pricePerDay: number;
    multiplier: number;
    minDays: number;
    maxDays: number;
  }>>> {
    const response = await this.client.get('/boosts/pricing');
    return response.data;
  }

  // Get subscription credits for boosts
  async getBoostSubscriptionCredits(): Promise<ApiResponse<{
    hasActiveSubscription: boolean;
    planName: string;
    canUseSubscriptionCredit: boolean;
    remainingCredits: number;
    totalCredits: number;
    usedCredits: number;
  }>> {
    const response = await this.client.get('/boosts/subscription-credits');
    return response.data;
  }

  // Calculate boost price
  async calculateBoostPrice(type: string, durationDays: number): Promise<ApiResponse<{ price: number }>> {
    const response = await this.client.get('/boosts/calculate', {
      params: { type, durationDays },
    });
    return response.data;
  }

  // Create boost (feature listing)
  async createBoost(data: {
    listingId: string;
    type: 'featured' | 'top_search' | 'homepage' | 'category_top' | 'urgent' | 'highlight';
    durationDays: number;
    paymentMethod: 'subscription' | 'wallet' | 'telebirr' | 'mpesa';
    autoRenew?: boolean;
  }): Promise<ApiResponse<Boost & { usedSubscriptionCredit?: boolean }>> {
    const response = await this.client.post('/boosts', data);
    return response.data;
  }

  async boostListing(data: {
    listingId: string;
    type: string;
    duration: number;
    paymentMethod: string;
  }): Promise<ApiResponse<Boost>> {
    const response = await this.client.post('/boosts', data);
    return response.data;
  }

  async getMyBoosts(): Promise<ApiResponse<Boost[]>> {
    const response = await this.client.get('/boosts/my');
    return response.data;
  }

  // ============================================
  // Analytics Endpoints
  // ============================================
  async getListingAnalytics(listingId: string, period?: string): Promise<ApiResponse<ListingAnalytics>> {
    const response = await this.client.get(`/analytics/listings/${listingId}`, {
      params: { period },
    });
    return response.data;
  }

  async getDashboardAnalytics(period?: string): Promise<ApiResponse<DashboardAnalytics>> {
    const response = await this.client.get('/analytics/dashboard', {
      params: period ? { period } : undefined,
    });
    return response.data;
  }

  async getAnalyticsOverview(period?: string): Promise<ApiResponse<AnalyticsOverview>> {
    const response = await this.client.get('/analytics/dashboard', {
      params: period ? { period } : undefined,
    });
    return response.data;
  }

  // ============================================
  // Report Endpoints
  // ============================================
  async reportEntity(data: {
    entityType: 'listing' | 'user';
    entityId: string;
    reason: string;
    description?: string;
  }): Promise<ApiResponse<void>> {
    const response = await this.client.post('/reports', data);
    return response.data;
  }

  // ============================================
  // Upload Endpoints
  // ============================================
  // Upload multiple images (for listings or other purposes)
  // Upload images FIRST, then use the returned URLs when creating/updating listings
  async uploadImages(files: File[], folder: string = 'listings'): Promise<ApiResponse<Array<{
    original: string;
    thumbnail: string;
    small: string;
    medium: string;
    large: string;
    webp: string;
    blurhash?: string;
    metadata?: Record<string, unknown>;
  }>>> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });
    formData.append('folder', folder);
    const response = await this.client.post('/uploads/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  // Upload single image
  async uploadImage(file: File, folder: string = 'listings', watermark?: string): Promise<ApiResponse<{
    original: string;
    thumbnail: string;
    small: string;
    medium: string;
    large: string;
    webp: string;
    blurhash?: string;
    metadata?: Record<string, unknown>;
  }>> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);
    if (watermark) {
      formData.append('watermark', watermark);
    }
    const response = await this.client.post('/uploads/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async uploadVideo(listingId: string, file: File): Promise<ApiResponse<{
    url: string;
    size: number;
    mimetype: string;
  }>> {
    const formData = new FormData();
    formData.append('video', file);
    const response = await this.client.post(`/uploads/videos/${listingId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async deleteFile(filePath: string): Promise<ApiResponse<void>> {
    const response = await this.client.delete('/uploads', {
      data: { filePath },
    });
    return response.data;
  }

  // ============================================
  // Admin Endpoints
  // ============================================
  async getAdminUsers(filters?: {
    role?: string;
    isVerified?: boolean;
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<ApiResponse<User[]> & { pagination: any }> {
    const response = await this.client.get('/admin/users', {
      params: filters,
    });
    return response.data;
  }

  async getAdminUsersByCategory(): Promise<ApiResponse<{
    categories: {
      buyer?: { count: number; users: User[] };
      private?: { count: number; users: User[] };
      broker?: { count: number; users: User[] };
      dealership?: { count: number; users: User[] };
      admin?: { count: number; users: User[] };
    };
    summary: {
      total: number;
      active: number;
      inactive: number;
      verified: number;
      unverified: number;
    };
  }>> {
    const response = await this.client.get('/admin/users/categories');
    return response.data;
  }

  async getAdminUserById(id: string): Promise<ApiResponse<User>> {
    const response = await this.client.get(`/admin/users/${id}`);
    return response.data;
  }

  async updateAdminUser(id: string, data: {
    role?: string;
    isVerified?: boolean;
    isActive?: boolean;
    subscriptionPlan?: string;
    emailVerifiedAt?: string;
    phoneVerifiedAt?: string;
  }): Promise<ApiResponse<User>> {
    const response = await this.client.put(`/admin/users/${id}`, data);
    return response.data;
  }

  async getAdminListings(filters?: {
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
  }): Promise<ApiResponse<Listing[]> & { pagination: any }> {
    const response = await this.client.get('/admin/listings', {
      params: filters,
    });
    return response.data;
  }


  async getAdminPendingListings(filters?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: 'vehicle' | 'property';
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<{
    data: Listing[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }>> {
    const response = await this.client.get('/admin/listings/pending', {
      params: filters,
    });
    return response.data;
  }

  // Approve/Reject: Primary is PUT /admin/listings/:id/approve (POST also supported for backward compatibility)
  async approveAdminListing(id: string): Promise<ApiResponse<Listing>> {
    const response = await this.client.put(`/admin/listings/${id}/approve`);
    return response.data;
  }

  async reapproveAdminListing(id: string): Promise<ApiResponse<Listing>> {
    const response = await this.client.put(`/admin/listings/${id}/reapprove`);
    return response.data;
  }

  async rejectAdminListing(id: string, reason: string): Promise<ApiResponse<Listing>> {
    const response = await this.client.put(`/admin/listings/${id}/reject`, { reason });
    return response.data;
  }

  // Feature is under /listings (not /admin)
  async featureAdminListing(id: string): Promise<ApiResponse<Listing>> {
    const response = await this.client.post(`/listings/${id}/feature`);
    return response.data;
  }

  // Block/Unblock are under /admin/listings
  async blockAdminListing(id: string, reason: string): Promise<ApiResponse<Listing>> {
    const response = await this.client.post(`/admin/listings/${id}/block`, { reason });
    return response.data;
  }

  async unblockAdminListing(id: string): Promise<ApiResponse<Listing>> {
    const response = await this.client.post(`/admin/listings/${id}/unblock`);
    return response.data;
  }

  // Reports: Primary is /admin/reports (also available at /reports for backward compatibility)
  async getAdminReports(filters?: {
    entityType?: 'listing' | 'user';
    status?: 'pending' | 'investigating' | 'resolved' | 'dismissed';
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<{
    data: any[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    summary: {
      total: number;
      pending: number;
      investigating: number;
      resolved: number;
      dismissed: number;
    };
  }>> {
    const response = await this.client.get('/admin/reports', {
      params: filters,
    });
    // API returns: { success, data: { data: Report[], pagination: {...}, summary: {...} } }
    return response.data;
  }

  async getAdminReportStats(): Promise<ApiResponse<any>> {
    const response = await this.client.get('/reports/stats');
    return response.data;
  }

  async getAdminReportById(reportId: string): Promise<ApiResponse<any>> {
    const response = await this.client.get(`/reports/${reportId}`);
    return response.data;
  }

  async assignAdminReport(reportId: string, assignedTo: string): Promise<ApiResponse<any>> {
    const response = await this.client.post(`/reports/${reportId}/assign`, { assignedTo });
    return response.data;
  }

  // Resolve: Primary is PUT /admin/reports/:id/resolve (POST also supported for backward compatibility)
  async resolveAdminReport(id: string, data: {
    action: string;
    notes?: string;
  }): Promise<ApiResponse<void>> {
    const response = await this.client.put(`/admin/reports/${id}/resolve`, data);
    return response.data;
  }

  async dismissAdminReport(reportId: string): Promise<ApiResponse<void>> {
    const response = await this.client.post(`/reports/${reportId}/dismiss`);
    return response.data;
  }

  async getAdminAnalytics(): Promise<ApiResponse<{
    totalUsers: number;
    usersChange: string;
    activeListings: number;
    listingsChange: string;
    pendingListings: number;
    pendingChange: string;
    totalRevenue: number;
    revenueChange: string;
    totalReports: number;
    reportsChange: string;
    totalAgencies: number;
    agenciesChange: string;
    period: {
      start: string;
      end: string;
      comparisonStart: string;
      comparisonEnd: string;
    };
    breakdown: {
      usersByRole: Record<string, number>;
      listingsByType: Record<string, number>;
      listingsByStatus: Record<string, number>;
      revenueBySource: Record<string, number>;
    };
    trends: {
      users: Array<{ date: string; count: number }>;
      listings: Array<{ date: string; count: number }>;
      revenue: Array<{ date: string; amount: number }>;
    };
  }>> {
    const response = await this.client.get('/admin/analytics');
    return response.data;
  }

  // ============================================
  // Combo Field Management Endpoints (Admin Only)
  // ============================================
  async getComboFieldTables(): Promise<ApiResponse<{
    tableTypes: string[];
    tableInfo: Array<{
      tableType: string;
      modelName: string;
      requiredFields: string[];
      supportsMultilingual: boolean;
    }>;
  }>> {
    const response = await this.client.get('/admin/combo-fields/tables');
    return response.data;
  }

  async getComboFieldTableInfo(type: string): Promise<ApiResponse<{
    tableType: string;
    modelName: string;
    requiredFields: string[];
    supportsMultilingual: boolean;
  }>> {
    const response = await this.client.get(`/admin/combo-fields/tables/${type}/info`);
    return response.data;
  }

  async getComboFields(
    type: string,
    filters?: {
      page?: number;
      limit?: number;
      search?: string;
      isActive?: boolean;
      lang?: string;
      makeId?: string;
      regionId?: string;
      category?: string;
      isResidential?: boolean;
      isCommercial?: boolean;
    }
  ): Promise<ApiResponse<any[]> & { pagination?: any }> {
    const response = await this.client.get(`/admin/combo-fields/${type}`, {
      params: filters,
    });
    return response.data;
  }

  async getComboField(type: string, id: string, lang?: string): Promise<ApiResponse<any>> {
    const response = await this.client.get(`/admin/combo-fields/${type}/${id}`, {
      params: { lang },
    });
    return response.data;
  }

  async createComboField(type: string, data: any): Promise<ApiResponse<any>> {
    const response = await this.client.post(`/admin/combo-fields/${type}`, data);
    return response.data;
  }

  async updateComboField(type: string, id: string, data: any): Promise<ApiResponse<any>> {
    const response = await this.client.put(`/admin/combo-fields/${type}/${id}`, data);
    return response.data;
  }

  async deleteComboField(type: string, id: string): Promise<ApiResponse<void>> {
    const response = await this.client.delete(`/admin/combo-fields/${type}/${id}`);
    return response.data;
  }

  async restoreComboField(type: string, id: string): Promise<ApiResponse<void>> {
    const response = await this.client.post(`/admin/combo-fields/${type}/${id}/restore`);
    return response.data;
  }
}

export const api = new ApiClient();
export default api;

