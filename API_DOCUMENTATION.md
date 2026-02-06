# ZCAR Marketplace API Documentation

**Version:** 1.0.0  
**Base URL:** `http://localhost:3001/api/v1`  
**Content-Type:** `application/json`

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Authentication](#authentication)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Endpoints](#endpoints)
   - [Health Check](#health-check)
   - [Reference Data](#reference-data-endpoints) ⭐ Important for Forms
   - [Auth](#auth-endpoints)
   - [Listings](#listing-endpoints)
   - [Users](#user-endpoints)
   - [Messages](#messaging-endpoints)
   - [Reviews](#review-endpoints)
   - [Favorites](#favorite-endpoints)
   - [Saved Searches](#saved-search-endpoints)
   - [Comparisons](#comparison-endpoints)
   - [Appointments](#appointment-endpoints)
   - [Notifications](#notification-endpoints)
   - [Subscriptions](#subscription-endpoints)
   - [Payments](#payment-endpoints)
   - [Wallet](#wallet-endpoints)
   - [Boosts](#boost-endpoints)
   - [Analytics](#analytics-endpoints)
   - [Reports](#report-endpoints)
   - [Uploads](#upload-endpoints)
   - [Admin](#admin-endpoints)
7. [Data Models](#data-models)
8. [TypeScript Interfaces](#typescript-interfaces)
9. [Enums & Constants](#enums--constants)
10. [Frontend Integration Guide](#frontend-integration-guide)

---

## Overview

ZCAR Marketplace is a dual-category platform for **Vehicles** and **Properties** in Ethiopia. The API supports:

- ✅ User registration and authentication (email/phone)
- ✅ Listing creation and management (vehicles & properties)
- ✅ Advanced search with filters
- ✅ In-app messaging between buyers and sellers
- ✅ Reviews and ratings
- ✅ Subscription plans (Basic, Standard, Premium)
- ✅ Payment integration (Telebirr, M-Pesa)
- ✅ Push notifications
- ✅ Appointment scheduling
- ✅ Listing boosting/promotion
- ✅ Digital wallet

---

## Quick Start

### 1. Check API Health
```bash
curl http://localhost:3001/health
```

### 2. Load Reference Data (For Forms)
```bash
curl http://localhost:3001/api/v1/reference/all
```

### 3. Register a User
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123","role":"buyer"}'
```

### 4. Browse Listings
```bash
curl "http://localhost:3001/api/v1/listings?type=vehicle&limit=10"
```

---

## Authentication

### Auth Header
All protected endpoints require a Bearer token:
```
Authorization: Bearer <token>
```

### User Roles
| Role | Description | Permissions |
|------|-------------|-------------|
| `buyer` | Regular user | Browse, favorite, message, book appointments |
| `seller` | Individual seller | Create/manage listings, respond to messages |
| `agency` | Business account | Multiple listings, organization features |
| `admin` | Administrator | Full system access, moderation |

### Token Lifecycle
- Access token expires in: **1 hour**
- Refresh token expires in: **7 days**
- Store tokens securely (httpOnly cookies recommended)

---

## Error Handling

### Response Format
```json
{
  "success": false,
  "message": "Human-readable error message",
  "errors": [
    {
      "code": "ERROR_CODE",
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Error Codes
| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTH_REQUIRED` | 401 | Authentication required |
| `INVALID_SESSION` | 401 | Session expired or invalid |
| `INVALID_CREDENTIALS` | 401 | Wrong email/password |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `DUPLICATE_ENTRY` | 409 | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Rate Limiting

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| General API | 100 requests | 15 minutes |
| Auth endpoints | 5 requests | 15 minutes |
| Search | 30 requests | 1 minute |
| Create listing | 10 requests | 1 hour |

**Response Headers:**
- `X-RateLimit-Limit`: Maximum requests
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Reset timestamp

---

## Endpoints

---

### Health Check

#### Check API Status
```
GET /health
```

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2026-01-16T12:00:00.000Z",
  "uptime": 3600.123
}
```

---

### Reference Data Endpoints

> ⚠️ **Important:** These endpoints are **public** (no auth required) and cached for performance. Load this data on app initialization for forms and filters.

---

#### Get All Reference Data
```
GET /reference/all
```

Returns all reference data in a single request - ideal for app initialization.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "vehicle": {
      "makes": [
        { "id": "uuid", "name": "Toyota", "slug": "toyota", "country": "Japan", "isPopular": true }
      ],
      "bodyTypes": [
        { "id": "uuid", "name": "Sedan", "slug": "sedan", "icon": "🚗" }
      ],
      "fuelTypes": [
        { "id": "uuid", "name": "Petrol", "slug": "petrol" }
      ],
      "transmissions": [
        { "id": "uuid", "name": "Automatic", "slug": "automatic" }
      ],
      "colors": [
        { "id": "uuid", "name": "White", "slug": "white", "hexCode": "#FFFFFF" }
      ],
      "conditions": [
        { "id": "uuid", "name": "New", "slug": "new" }
      ]
    },
    "property": {
      "propertyTypes": [
        { "id": "uuid", "name": "Apartment", "slug": "apartment", "icon": "🏢" }
      ],
      "conditions": [
        { "id": "uuid", "name": "Excellent", "slug": "excellent" }
      ],
      "amenities": [
        { "id": "uuid", "name": "Swimming Pool", "slug": "swimming-pool", "icon": "🏊", "category": "outdoor" }
      ]
    },
    "locations": {
      "regions": [
        { "id": "uuid", "name": "Addis Ababa", "slug": "addis-ababa", "code": "AA" }
      ],
      "cities": [
        { "id": "uuid", "name": "Bole", "slug": "bole", "regionId": "uuid", "isPopular": true }
      ]
    },
    "filters": {
      "priceRanges": [
        { "id": "uuid", "minPrice": 0, "maxPrice": 500000, "label": "Under 500K", "category": "vehicle" }
      ],
      "yearRanges": [
        { "id": "uuid", "minYear": 2020, "maxYear": 2024, "label": "2020-2024" }
      ]
    }
  }
}
```

---

#### Get Vehicle Form Data
```
GET /reference/vehicle/form-data
```

Get all data needed for vehicle listing creation forms.

---

#### Get Vehicle Makes
```
GET /reference/vehicle/makes
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "cf4dd01f-8a33-4c84-b2e0-e94c45dcdf42",
      "name": "Toyota",
      "slug": "toyota",
      "logo": null,
      "country": "Japan",
      "isPopular": true,
      "sortOrder": 1
    },
    {
      "id": "2efd92f4-7e74-4668-aa68-89062206880c",
      "name": "Honda",
      "slug": "honda",
      "logo": null,
      "country": "Japan",
      "isPopular": true,
      "sortOrder": 2
    }
  ]
}
```

---

#### Get Vehicle Models by Make
```
GET /reference/vehicle/models/:makeId
```

**Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| makeId | UUID | Vehicle make ID |

**Response (200):**
```json
{
  "success": true,
  "data": [
    { "id": "uuid", "name": "Corolla", "slug": "corolla", "makeId": "uuid" },
    { "id": "uuid", "name": "Camry", "slug": "camry", "makeId": "uuid" },
    { "id": "uuid", "name": "Land Cruiser", "slug": "land-cruiser", "makeId": "uuid" }
  ]
}
```

---

#### Search Vehicle Models
```
GET /reference/vehicle/models/search?q=corolla
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| q | string | Search query (min 2 chars) |

---

#### Get Vehicle Body Types
```
GET /reference/vehicle/body-types
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    { "id": "uuid", "name": "Sedan", "slug": "sedan", "icon": "🚗", "sortOrder": 1 },
    { "id": "uuid", "name": "SUV", "slug": "suv", "icon": "🚙", "sortOrder": 2 },
    { "id": "uuid", "name": "Pickup", "slug": "pickup", "icon": "🛻", "sortOrder": 3 },
    { "id": "uuid", "name": "Hatchback", "slug": "hatchback", "icon": "🚗", "sortOrder": 4 }
  ]
}
```

---

#### Get Vehicle Fuel Types
```
GET /reference/vehicle/fuel-types
```

---

#### Get Vehicle Transmissions
```
GET /reference/vehicle/transmissions
```

---

#### Get Vehicle Colors
```
GET /reference/vehicle/colors
```

---

#### Get Vehicle Conditions
```
GET /reference/vehicle/conditions
```

---

#### Get Property Form Data
```
GET /reference/property/form-data
```

---

#### Get Property Types
```
GET /reference/property/types
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    { "id": "uuid", "name": "Apartment", "slug": "apartment", "icon": "🏢", "sortOrder": 1 },
    { "id": "uuid", "name": "House", "slug": "house", "icon": "🏠", "sortOrder": 2 },
    { "id": "uuid", "name": "Villa", "slug": "villa", "icon": "🏡", "sortOrder": 3 },
    { "id": "uuid", "name": "Commercial", "slug": "commercial", "icon": "🏪", "sortOrder": 4 },
    { "id": "uuid", "name": "Land", "slug": "land", "icon": "🏞️", "sortOrder": 5 }
  ]
}
```

---

#### Get Property Conditions
```
GET /reference/property/conditions
```

---

#### Get Amenities
```
GET /reference/property/amenities
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    { "id": "uuid", "name": "Swimming Pool", "slug": "swimming-pool", "icon": "🏊", "category": "outdoor" },
    { "id": "uuid", "name": "Gym", "slug": "gym", "icon": "💪", "category": "fitness" },
    { "id": "uuid", "name": "Parking", "slug": "parking", "icon": "🅿️", "category": "basic" },
    { "id": "uuid", "name": "Security", "slug": "security", "icon": "🔒", "category": "basic" }
  ]
}
```

---

#### Get Features
```
GET /reference/features
```

---

#### Get Regions
```
GET /reference/locations/regions
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    { "id": "uuid", "name": "Addis Ababa", "slug": "addis-ababa", "code": "AA", "sortOrder": 1 },
    { "id": "uuid", "name": "Oromia", "slug": "oromia", "code": "OR", "sortOrder": 2 },
    { "id": "uuid", "name": "Amhara", "slug": "amhara", "code": "AM", "sortOrder": 3 }
  ]
}
```

---

#### Get Cities by Region
```
GET /reference/locations/cities/:regionId
```

---

#### Get Popular Cities
```
GET /reference/locations/cities/popular
```

---

#### Get All Locations
```
GET /reference/locations
```

Returns regions with their cities nested.

---

#### Get Price Ranges
```
GET /reference/filters/price-ranges?category=vehicle
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| category | string | `vehicle` or `property` |

**Response (200):**
```json
{
  "success": true,
  "data": [
    { "id": "uuid", "minPrice": 0, "maxPrice": 500000, "label": "Under 500K ETB" },
    { "id": "uuid", "minPrice": 500000, "maxPrice": 1000000, "label": "500K - 1M ETB" },
    { "id": "uuid", "minPrice": 1000000, "maxPrice": 2000000, "label": "1M - 2M ETB" }
  ]
}
```

---

#### Get Year Ranges
```
GET /reference/filters/year-ranges
```

---

### Auth Endpoints

---

### Social Login (OAuth) 🆕

Social login allows users to authenticate using their Google, Facebook, or Apple accounts. This is especially useful for mobile apps and provides a seamless login experience.

---

#### Get Enabled Providers
```
GET /auth/social/providers
```

Returns a list of configured social login providers.

**Response (200):**
```json
{
  "success": true,
  "data": [
    { "provider": "google", "authUrl": "/api/v1/auth/google" },
    { "provider": "facebook", "authUrl": "/api/v1/auth/facebook" },
    { "provider": "apple", "authUrl": "/api/v1/auth/apple" }
  ]
}
```

---

#### Google Sign In (Web)
```
GET /auth/google
```

Redirects to Google's OAuth consent page. After authorization, redirects back to the app with tokens.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| state | string | Optional state to maintain between request/callback |

**Flow:**
1. Frontend opens `/api/v1/auth/google` (can be in popup or redirect)
2. User authorizes on Google
3. Google redirects to `/api/v1/auth/google/callback`
4. Backend creates/logs in user and redirects to `OAUTH_SUCCESS_REDIRECT` with tokens

**Success Redirect URL:**
```
http://localhost:3000/auth/success?token=xxx&refreshToken=xxx&isNewUser=true
```

---

#### Facebook Sign In (Web)
```
GET /auth/facebook
```

Same flow as Google Sign In.

---

#### Apple Sign In (Web)
```
GET /auth/apple
```

Same flow as Google Sign In. Note: Apple callback uses POST instead of GET.

---

#### Social Login with Token (Mobile Apps) ⭐ Recommended for Mobile
```
POST /auth/social/token
```

Use this endpoint when you have obtained a token directly from the social provider's SDK (Google Sign-In SDK, Facebook Login SDK, Sign in with Apple).

**Request Body:**
```json
{
  "provider": "google",
  "idToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| provider | string | Yes | `google`, `facebook`, or `apple` |
| idToken | string | Yes* | ID token from social SDK |
| token | string | Yes* | Access token (alternative to idToken) |

*Either `idToken` or `token` is required.

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@gmail.com",
      "name": "John Doe",
      "role": "buyer",
      "isVerified": true,
      "subscriptionPlan": "basic"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "uuid",
    "expiresAt": "2026-01-23T20:16:31.232Z",
    "isNewUser": false
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid social token"
}
```

---

#### Mobile App Integration Examples

**React Native (Google Sign-In):**
```javascript
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Configure
GoogleSignin.configure({
  webClientId: 'YOUR_GOOGLE_CLIENT_ID',
});

// Sign in
const userInfo = await GoogleSignin.signIn();
const { idToken } = await GoogleSignin.getTokens();

// Authenticate with your API
const response = await fetch('http://api.example.com/api/v1/auth/social/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ provider: 'google', idToken }),
});
const { data } = await response.json();
// Store data.token for authenticated requests
```

**React Native (Facebook Login):**
```javascript
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';

// Sign in
const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
const tokenData = await AccessToken.getCurrentAccessToken();

// Authenticate with your API
const response = await fetch('http://api.example.com/api/v1/auth/social/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ provider: 'facebook', token: tokenData.accessToken }),
});
```

**Flutter (Google Sign-In):**
```dart
final GoogleSignIn googleSignIn = GoogleSignIn();
final GoogleSignInAccount? account = await googleSignIn.signIn();
final GoogleSignInAuthentication auth = await account!.authentication;

final response = await http.post(
  Uri.parse('http://api.example.com/api/v1/auth/social/token'),
  headers: {'Content-Type': 'application/json'},
  body: jsonEncode({'provider': 'google', 'idToken': auth.idToken}),
);
```

---

### Email/Password Auth

---

#### Register User
```
POST /auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+251911234567",
  "password": "securePassword123",
  "role": "buyer"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Full name (2-100 chars) |
| email | string | Yes | Valid email address |
| phone | string | No | Phone number with country code |
| password | string | Yes | Min 8 characters |
| role | string | No | `buyer` (default), `seller`, or `agency` |

**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "c4947b4b-3199-4817-b5be-d48eac5d4c9f",
      "email": "john@example.com",
      "phone": "+251911234567",
      "name": "John Doe",
      "role": "buyer",
      "organizationId": null,
      "isVerified": false,
      "subscriptionPlan": "basic"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "bb62d04e-9cfc-4efe-bd0d-afce8e71c385",
    "expiresAt": "2026-01-23T20:16:31.232Z"
  }
}
```

---

#### Login
```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "john@example.com",
      "name": "John Doe",
      "role": "buyer",
      "isVerified": true,
      "subscriptionPlan": "basic"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "uuid",
    "expiresAt": "2026-01-23T20:16:31.232Z"
  }
}
```

---

#### Refresh Token
```
POST /auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "bb62d04e-9cfc-4efe-bd0d-afce8e71c385"
}
```

---

#### Get Current User
```
GET /auth/me
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "john@example.com",
    "phone": "+251911234567",
    "name": "John Doe",
    "avatar": "/uploads/avatars/john.jpg",
    "role": "seller",
    "isVerified": true,
    "subscriptionPlan": "standard",
    "organization": null,
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
}
```

---

#### Update Profile
```
PUT /auth/profile
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "John Updated",
  "phone": "+251911234568",
  "avatar": "/uploads/avatars/new.jpg"
}
```

---

#### Change Password
```
PUT /auth/password
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword456"
}
```

---

#### Logout
```
POST /auth/logout
Authorization: Bearer <token>
```

---

#### Logout All Devices
```
POST /auth/logout-all
Authorization: Bearer <token>
```

---

### Listing Endpoints

---

#### Search Listings
```
GET /listings
```

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| type | string | - | `vehicle` or `property` |
| status | string | `active` | Listing status |
| minPrice | number | - | Minimum price |
| maxPrice | number | - | Maximum price |
| city | string | - | City name or slug |
| region | string | - | Region name or slug |
| isFeatured | boolean | - | Featured listings only |
| sortBy | string | `createdAt` | Sort field |
| sortOrder | string | `DESC` | `ASC` or `DESC` |
| page | number | 1 | Page number |
| limit | number | 20 | Items per page (max 100) |

**Vehicle-specific filters:**
| Param | Type | Description |
|-------|------|-------------|
| make | string | Vehicle make |
| model | string | Vehicle model |
| minYear | number | Minimum year |
| maxYear | number | Maximum year |
| fuelType | string | Fuel type |
| transmission | string | Transmission type |
| bodyType | string | Body type |
| minMileage | number | Minimum mileage |
| maxMileage | number | Maximum mileage |
| condition | string | Vehicle condition |

**Property-specific filters:**
| Param | Type | Description |
|-------|------|-------------|
| propertyType | string | Property type |
| listingType | string | `sale` or `rent` |
| minBedrooms | number | Minimum bedrooms |
| maxBedrooms | number | Maximum bedrooms |
| minBathrooms | number | Minimum bathrooms |
| minArea | number | Minimum area (m²) |
| maxArea | number | Maximum area (m²) |
| furnished | boolean | Furnished only |

**Example Request:**
```
GET /listings?type=vehicle&make=Toyota&minPrice=1000000&maxPrice=5000000&city=Addis+Ababa&sortBy=price&sortOrder=ASC&limit=10
```

**Response (200):**
```json
{
  "success": true,
  "message": "Listings retrieved",
  "data": [
    {
      "id": "a06a7b73-330f-4fbc-a44c-372adf667d55",
      "title": "2023 Toyota Land Cruiser Prado - Excellent Condition",
      "slug": "2023-toyota-land-cruiser-prado-a06a7b73",
      "description": "Well maintained luxury SUV...",
      "type": "vehicle",
      "status": "active",
      "price": "4500000.00",
      "currency": "ETB",
      "isNegotiable": true,
      "isFeatured": true,
      "location": "Bole",
      "city": "Addis Ababa",
      "region": "Addis Ababa",
      "country": "Ethiopia",
      "images": [
        {
          "url": "https://images.unsplash.com/photo-xxx?w=800",
          "thumbnail": "https://images.unsplash.com/photo-xxx?w=300"
        }
      ],
      "viewsCount": 1250,
      "favoritesCount": 89,
      "vehicleAttribute": {
        "make": "Toyota",
        "model": "Land Cruiser Prado",
        "year": 2023,
        "bodyType": "SUV",
        "fuelType": "diesel",
        "transmission": "automatic",
        "mileage": 15000,
        "condition": "used",
        "color": "White",
        "features": ["Leather Seats", "Sunroof", "360 Camera"]
      },
      "propertyAttribute": null,
      "user": {
        "id": "uuid",
        "name": "Abebe Motors",
        "isVerified": true
      },
      "createdAt": "2026-01-10T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15,
    "hasMore": true
  }
}
```

---

#### Get Featured Listings
```
GET /listings/featured
```

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| type | string | - | `vehicle` or `property` |
| limit | number | 10 | Number of listings |

---

#### Get Single Listing
```
GET /listings/:id
```

Returns full listing details including related listings.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "listing": {
      "id": "uuid",
      "title": "2023 Toyota Land Cruiser Prado",
      "slug": "2023-toyota-land-cruiser-prado-uuid",
      "description": "Full description...",
      "type": "vehicle",
      "status": "active",
      "price": "4500000.00",
      "currency": "ETB",
      "isNegotiable": true,
      "isFeatured": true,
      "location": "Bole",
      "city": "Addis Ababa",
      "region": "Addis Ababa",
      "country": "Ethiopia",
      "latitude": 9.0054,
      "longitude": 38.7636,
      "images": [...],
      "videos": [],
      "viewsCount": 1251,
      "favoritesCount": 89,
      "contactsCount": 15,
      "vehicleAttribute": {
        "make": "Toyota",
        "model": "Land Cruiser Prado",
        "year": 2023,
        "bodyType": "SUV",
        "fuelType": "diesel",
        "transmission": "automatic",
        "mileage": 15000,
        "engineSize": "2.8",
        "horsepower": 204,
        "color": "White",
        "interiorColor": "Beige",
        "doors": 5,
        "seats": 7,
        "condition": "used",
        "vin": null,
        "features": ["Leather Seats", "Sunroof", "360 Camera", "Navigation"]
      },
      "user": {
        "id": "uuid",
        "name": "Abebe Motors",
        "avatar": "/uploads/avatars/abebe.jpg",
        "isVerified": true,
        "memberSince": "2024-01-01T00:00:00.000Z",
        "listingsCount": 25,
        "rating": 4.8,
        "reviewsCount": 120
      },
      "createdAt": "2026-01-10T00:00:00.000Z",
      "publishedAt": "2026-01-10T00:00:00.000Z"
    },
    "relatedListings": [...],
    "priceAnalysis": {
      "averagePrice": 4200000,
      "minPrice": 3500000,
      "maxPrice": 5500000,
      "pricePosition": "above_average",
      "similarCount": 12
    }
  }
}
```

---

#### Get Listing by Slug
```
GET /listings/slug/:slug
```

---

#### Create Listing
```
POST /listings
Authorization: Bearer <token>
```

**Request Body (Vehicle):**
```json
{
  "type": "vehicle",
  "title": "2023 Toyota Corolla - Like New",
  "description": "Well-maintained vehicle with full service history...",
  "price": 2500000,
  "currency": "ETB",
  "isNegotiable": true,
  "location": "Bole",
  "city": "Addis Ababa",
  "region": "Addis Ababa",
  "images": [
    { "url": "/uploads/listings/img1.jpg", "thumbnail": "/uploads/thumbnails/img1.jpg" }
  ],
  "vehicleAttributes": {
    "make": "Toyota",
    "model": "Corolla",
    "year": 2023,
    "bodyType": "Sedan",
    "fuelType": "petrol",
    "transmission": "automatic",
    "mileage": 25000,
    "color": "Silver",
    "condition": "used",
    "features": ["Bluetooth", "Backup Camera", "Cruise Control"]
  }
}
```

**Request Body (Property):**
```json
{
  "type": "property",
  "title": "Modern 3BR Apartment in Bole",
  "description": "Spacious apartment with city views...",
  "price": 8500000,
  "currency": "ETB",
  "isNegotiable": true,
  "location": "Bole Atlas",
  "city": "Addis Ababa",
  "region": "Addis Ababa",
  "images": [...],
  "propertyAttributes": {
    "propertyType": "apartment",
    "listingType": "sale",
    "bedrooms": 3,
    "bathrooms": 2,
    "area": 180,
    "floorNumber": 5,
    "furnished": false,
    "condition": "excellent",
    "amenities": ["Elevator", "Security", "Parking"],
    "features": ["City View", "Open Plan", "Modern Kitchen"]
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Listing created successfully",
  "data": {
    "id": "uuid",
    "slug": "2023-toyota-corolla-like-new-uuid",
    "status": "pending"
  }
}
```

---

#### Update Listing
```
PUT /listings/:id
Authorization: Bearer <token>
```

Only the listing owner or admin can update.

---

#### Delete Listing
```
DELETE /listings/:id
Authorization: Bearer <token>
```

---

#### Get My Listings (Seller)
```
GET /listings/my
Authorization: Bearer <token>
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| status | string | Filter by status |
| type | string | Filter by type |

---

#### Mark as Sold
```
PUT /listings/:id/sold
Authorization: Bearer <token>
```

---

### Messaging Endpoints

All messaging endpoints require authentication and email verification.

**Base URL:** `/api/v1/messages`

---

#### Get All Conversations
```
GET /messages/conversations
Authorization: Bearer <token>
```

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Conversations per page |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "listingId": "660e8400-e29b-41d4-a716-446655440001",
        "buyerId": "770e8400-e29b-41d4-a716-446655440002",
        "sellerId": "880e8400-e29b-41d4-a716-446655440003",
        "lastMessageId": "990e8400-e29b-41d4-a716-446655440004",
        "lastMessageAt": "2026-01-20T10:30:00.000Z",
        "buyerUnreadCount": 2,
        "sellerUnreadCount": 0,
        "status": "active",
        "listing": {
          "id": "660e8400-e29b-41d4-a716-446655440001",
          "title": "2023 Toyota Land Cruiser Prado",
          "images": [{"url": "/uploads/car.jpg", "thumbnail": "/uploads/thumbs/car.jpg"}],
          "price": 4500000,
          "currency": "ETB"
        },
        "buyer": {
          "id": "770e8400-e29b-41d4-a716-446655440002",
          "name": "John Buyer",
          "avatar": "/uploads/avatars/john.jpg"
        },
        "seller": {
          "id": "880e8400-e29b-41d4-a716-446655440003",
          "name": "Abebe Motors",
          "avatar": "/uploads/avatars/abebe.jpg",
          "isVerified": true
        },
        "lastMessage": {
          "id": "990e8400-e29b-41d4-a716-446655440004",
          "content": "Is this still available?",
          "type": "text",
          "createdAt": "2026-01-20T10:30:00.000Z"
        },
        "createdAt": "2026-01-19T15:00:00.000Z",
        "updatedAt": "2026-01-20T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

---

#### Get Unread Count
```
GET /messages/conversations/unread
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalUnread": 7,
    "conversations": 3
  }
}
```

---

#### Get Single Conversation
```
GET /messages/conversations/:conversationId
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "listingId": "660e8400-e29b-41d4-a716-446655440001",
    "listing": {...},
    "buyer": {...},
    "seller": {...},
    "buyerUnreadCount": 0,
    "sellerUnreadCount": 0,
    "status": "active",
    "createdAt": "2026-01-19T15:00:00.000Z"
  }
}
```

---

#### Start New Conversation (Contact Seller)
```
POST /messages/conversations
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "listingId": "660e8400-e29b-41d4-a716-446655440001",
  "receiverId": "880e8400-e29b-41d4-a716-446655440003",
  "message": "Hi, I'm interested in this vehicle. Is it still available?"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "aa0e8400-e29b-41d4-a716-446655440005",
    "conversationId": "550e8400-e29b-41d4-a716-446655440000",
    "senderId": "770e8400-e29b-41d4-a716-446655440002",
    "content": "Hi, I'm interested in this vehicle. Is it still available?",
    "type": "text",
    "isRead": false,
    "createdAt": "2026-01-20T11:00:00.000Z"
  }
}
```

**Notes:**
- If a conversation already exists between buyer and seller for this listing, the message will be added to the existing conversation
- `receiverId` is the seller's user ID (found in listing's `user.id` field)

---

#### Get Messages in Conversation
```
GET /messages/conversations/:conversationId/messages
Authorization: Bearer <token>
```

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 50 | Messages per page |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "aa0e8400-e29b-41d4-a716-446655440005",
        "conversationId": "550e8400-e29b-41d4-a716-446655440000",
        "senderId": "770e8400-e29b-41d4-a716-446655440002",
        "content": "Hi, is this still available?",
        "type": "text",
        "attachments": [],
        "isRead": true,
        "readAt": "2026-01-20T10:35:00.000Z",
        "isEdited": false,
        "isDeleted": false,
        "createdAt": "2026-01-20T10:30:00.000Z",
        "sender": {
          "id": "770e8400-e29b-41d4-a716-446655440002",
          "name": "John Buyer",
          "avatar": "/uploads/avatars/john.jpg"
        }
      },
      {
        "id": "bb0e8400-e29b-41d4-a716-446655440006",
        "conversationId": "550e8400-e29b-41d4-a716-446655440000",
        "senderId": "880e8400-e29b-41d4-a716-446655440003",
        "content": "Yes! Would you like to schedule a viewing?",
        "type": "text",
        "attachments": [],
        "isRead": false,
        "isEdited": false,
        "isDeleted": false,
        "createdAt": "2026-01-20T10:45:00.000Z",
        "sender": {
          "id": "880e8400-e29b-41d4-a716-446655440003",
          "name": "Abebe Motors",
          "avatar": "/uploads/avatars/abebe.jpg"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 2,
      "totalPages": 1
    }
  }
}
```

---

#### Send Message in Conversation
```
POST /messages/conversations/:conversationId/messages
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body (Text Message):**
```json
{
  "content": "What is your best price?",
  "type": "text"
}
```

**Request Body (With Attachments):**
```json
{
  "content": "Here are some photos I took",
  "type": "image",
  "attachments": [
    {
      "url": "/uploads/images/photo1.jpg",
      "type": "image/jpeg",
      "name": "photo1.jpg",
      "size": 245000
    }
  ]
}
```

**Request Body (Make an Offer):**
```json
{
  "content": "I would like to make an offer",
  "type": "offer",
  "offerAmount": 4000000
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "cc0e8400-e29b-41d4-a716-446655440007",
    "conversationId": "550e8400-e29b-41d4-a716-446655440000",
    "senderId": "770e8400-e29b-41d4-a716-446655440002",
    "content": "I would like to make an offer",
    "type": "offer",
    "offerAmount": 4000000,
    "offerStatus": "pending",
    "isRead": false,
    "createdAt": "2026-01-20T12:00:00.000Z"
  }
}
```

**Message Types:**
| Type | Description |
|------|-------------|
| `text` | Regular text message |
| `image` | Image attachment |
| `file` | File attachment |
| `offer` | Price offer (requires `offerAmount`) |
| `system` | System-generated message |

---

#### Respond to Offer
```
POST /messages/:messageId/offer-response
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "action": "accepted",
  "counterOffer": null
}
```

Or counter-offer:
```json
{
  "action": "rejected",
  "counterOffer": 4200000
}
```

**Actions:** `accepted`, `rejected`, `expired`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "cc0e8400-e29b-41d4-a716-446655440007",
    "offerStatus": "accepted",
    "updatedAt": "2026-01-20T12:30:00.000Z"
  }
}
```

---

#### Mark Conversation as Read
```
PATCH /messages/conversations/:conversationId/read
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Marked as read"
}
```

---

#### Archive Conversation
```
PATCH /messages/conversations/:conversationId/archive
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Conversation archived"
}
```

---

#### Delete Conversation
```
DELETE /messages/conversations/:conversationId
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Conversation deleted"
}
```

**Note:** This performs a soft delete. The conversation is marked as deleted for the user but remains accessible to the other participant.

---

### Messaging Flow Example

**Step 1: Buyer views a listing and gets seller info**
```bash
curl "http://localhost:3001/api/v1/listings/660e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer <buyer_token>"

# Response includes: user.id (seller's ID)
```

**Step 2: Buyer starts conversation**
```bash
curl -X POST "http://localhost:3001/api/v1/messages/conversations" \
  -H "Authorization: Bearer <buyer_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "listingId": "660e8400-e29b-41d4-a716-446655440001",
    "receiverId": "880e8400-e29b-41d4-a716-446655440003",
    "message": "Hi, is this vehicle still available?"
  }'
```

**Step 3: Seller checks conversations**
```bash
curl "http://localhost:3001/api/v1/messages/conversations" \
  -H "Authorization: Bearer <seller_token>"
```

**Step 4: Seller replies**
```bash
curl -X POST "http://localhost:3001/api/v1/messages/conversations/550e8400-e29b-41d4-a716-446655440000/messages" \
  -H "Authorization: Bearer <seller_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Yes, it is! Would you like to schedule a viewing?",
    "type": "text"
  }'
```

**Step 5: Buyer makes an offer**
```bash
curl -X POST "http://localhost:3001/api/v1/messages/conversations/550e8400-e29b-41d4-a716-446655440000/messages" \
  -H "Authorization: Bearer <buyer_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "I would like to make an offer",
    "type": "offer",
    "offerAmount": 4000000
  }'
```

**Step 6: Seller accepts offer**
```bash
curl -X POST "http://localhost:3001/api/v1/messages/cc0e8400-e29b-41d4-a716-446655440007/offer-response" \
  -H "Authorization: Bearer <seller_token>" \
  -H "Content-Type: application/json" \
  -d '{"action": "accepted"}'
```

---

### Review Endpoints

---

#### Get Reviews for User
```
GET /reviews/user/:userId
```

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 10 | Reviews per page |
| sort | string | `recent` | `recent`, `highest`, `lowest` |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "averageRating": 4.7,
      "totalReviews": 45,
      "ratingDistribution": {
        "5": 30,
        "4": 10,
        "3": 3,
        "2": 1,
        "1": 1
      }
    },
    "reviews": [
      {
        "id": "uuid",
        "rating": 5,
        "title": "Excellent seller!",
        "content": "Very professional and honest. The car was exactly as described.",
        "reviewer": {
          "id": "uuid",
          "name": "Happy Buyer",
          "avatar": "/uploads/avatars/buyer.jpg"
        },
        "listing": {
          "id": "uuid",
          "title": "2023 Toyota Corolla",
          "thumbnail": "/uploads/thumbnails/car.jpg"
        },
        "response": {
          "content": "Thank you for your kind words!",
          "createdAt": "2026-01-15T12:00:00.000Z"
        },
        "helpfulCount": 12,
        "createdAt": "2026-01-14T10:00:00.000Z"
      }
    ],
    "pagination": {...}
  }
}
```

---

#### Create Review
```
POST /reviews
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "listingId": "uuid",
  "sellerId": "uuid",
  "rating": 5,
  "title": "Great experience!",
  "content": "The vehicle was exactly as described. Very professional seller."
}
```

---

#### Respond to Review (Seller)
```
POST /reviews/:reviewId/response
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "content": "Thank you for your kind words! It was a pleasure doing business with you."
}
```

---

#### Vote Review Helpful
```
POST /reviews/:reviewId/vote
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "helpful": true
}
```

---

### Favorite Endpoints

---

#### Get My Favorites
```
GET /listings/favorites
Authorization: Bearer <token>
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| type | string | Filter by `vehicle` or `property` |

---

#### Add to Favorites
```
POST /listings/:listingId/favorite
Authorization: Bearer <token>
```

---

#### Remove from Favorites
```
DELETE /listings/:listingId/favorite
Authorization: Bearer <token>
```

---

#### Toggle Favorite
```
POST /listings/:listingId/favorite/toggle
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "isFavorited": true
  }
}
```

---

### Saved Search Endpoints

---

#### Get Saved Searches
```
GET /saved-searches
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Toyota SUVs under 5M",
      "filters": {
        "type": "vehicle",
        "make": "Toyota",
        "bodyType": "SUV",
        "maxPrice": 5000000,
        "city": "Addis Ababa"
      },
      "notifyEmail": true,
      "notifyPush": true,
      "matchCount": 12,
      "lastMatchedAt": "2026-01-16T08:00:00.000Z",
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

---

#### Create Saved Search
```
POST /saved-searches
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Apartments in Bole",
  "filters": {
    "type": "property",
    "propertyType": "apartment",
    "city": "Bole",
    "minBedrooms": 2,
    "maxPrice": 10000000
  },
  "notifyEmail": true,
  "notifyPush": true
}
```

---

#### Update Saved Search
```
PUT /saved-searches/:id
Authorization: Bearer <token>
```

---

#### Delete Saved Search
```
DELETE /saved-searches/:id
Authorization: Bearer <token>
```

---

### Comparison Endpoints

---

#### Get My Comparisons
```
GET /comparisons
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "SUV Comparison",
      "type": "vehicle",
      "listings": [
        {
          "id": "uuid",
          "title": "Toyota Land Cruiser Prado",
          "price": 4500000,
          "thumbnail": "/uploads/thumbnails/car1.jpg",
          "vehicleAttribute": {
            "make": "Toyota",
            "model": "Land Cruiser Prado",
            "year": 2023,
            "mileage": 15000,
            "fuelType": "diesel"
          }
        },
        {
          "id": "uuid",
          "title": "BMW X5",
          "price": 5200000,
          "thumbnail": "/uploads/thumbnails/car2.jpg",
          "vehicleAttribute": {
            "make": "BMW",
            "model": "X5",
            "year": 2020,
            "mileage": 45000,
            "fuelType": "petrol"
          }
        }
      ],
      "createdAt": "2026-01-15T00:00:00.000Z"
    }
  ]
}
```

---

#### Create Comparison
```
POST /comparisons
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "SUV Comparison",
  "type": "vehicle",
  "listingIds": ["uuid1", "uuid2"]
}
```

---

#### Add Listing to Comparison
```
POST /comparisons/:comparisonId/listings
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "listingId": "uuid"
}
```

---

#### Remove Listing from Comparison
```
DELETE /comparisons/:comparisonId/listings/:listingId
Authorization: Bearer <token>
```

---

#### Delete Comparison
```
DELETE /comparisons/:id
Authorization: Bearer <token>
```

---

### Appointment Endpoints

---

#### Get My Appointments
```
GET /appointments
Authorization: Bearer <token>
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| status | string | `pending`, `confirmed`, `completed`, `cancelled` |
| role | string | `buyer` or `seller` (filter by role) |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "listing": {
        "id": "uuid",
        "title": "2023 Toyota Corolla",
        "thumbnail": "/uploads/thumbnails/car.jpg",
        "price": 2500000
      },
      "buyer": {
        "id": "uuid",
        "name": "John Buyer",
        "phone": "+251911234567"
      },
      "seller": {
        "id": "uuid",
        "name": "Auto Dealer",
        "phone": "+251912345678"
      },
      "scheduledAt": "2026-01-20T14:00:00.000Z",
      "location": "Bole, near Edna Mall",
      "notes": "Please bring valid ID",
      "status": "confirmed",
      "createdAt": "2026-01-16T10:00:00.000Z"
    }
  ]
}
```

---

#### Book Appointment
```
POST /appointments
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "listingId": "uuid",
  "scheduledAt": "2026-01-20T14:00:00.000Z",
  "location": "Bole, near Edna Mall",
  "notes": "I'm interested in test driving the vehicle"
}
```

---

#### Update Appointment Status (Seller)
```
PUT /appointments/:id/status
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "confirmed",
  "notes": "Confirmed. Please bring valid ID."
}
```

---

#### Cancel Appointment
```
DELETE /appointments/:id
Authorization: Bearer <token>
```

---

### Notification Endpoints

---

#### Get Notifications
```
GET /notifications
Authorization: Bearer <token>
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| isRead | boolean | Filter by read status |
| type | string | Filter by notification type |
| page | number | Page number |
| limit | number | Items per page |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "type": "new_message",
        "title": "New Message",
        "body": "John Buyer sent you a message about Toyota Corolla",
        "data": {
          "conversationId": "uuid",
          "listingId": "uuid"
        },
        "isRead": false,
        "createdAt": "2026-01-16T10:30:00.000Z"
      },
      {
        "id": "uuid",
        "type": "listing_approved",
        "title": "Listing Approved",
        "body": "Your listing 'Toyota Corolla' has been approved and is now live",
        "data": {
          "listingId": "uuid"
        },
        "isRead": true,
        "createdAt": "2026-01-15T14:00:00.000Z"
      }
    ],
    "unreadCount": 5,
    "pagination": {...}
  }
}
```

---

#### Mark Notification as Read
```
PUT /notifications/:id/read
Authorization: Bearer <token>
```

---

#### Mark All as Read
```
PUT /notifications/read-all
Authorization: Bearer <token>
```

---

#### Get Unread Count
```
GET /notifications/unread-count
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "count": 5
  }
}
```

---

#### Register Device Token (Push Notifications)
```
POST /notifications/device-token
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "token": "firebase-device-token-xxx",
  "platform": "android",
  "deviceId": "unique-device-id"
}
```

---

### Subscription Endpoints

---

#### Get Available Plans
```
GET /subscriptions/plans
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "name": "basic",
      "displayName": "Basic",
      "price": 0,
      "currency": "ETB",
      "billingPeriod": "monthly",
      "features": [
        "Up to 3 listings",
        "Standard visibility",
        "Basic support"
      ],
      "limits": {
        "maxListings": 3,
        "maxImages": 5,
        "featuredListings": 0
      }
    },
    {
      "name": "standard",
      "displayName": "Standard",
      "price": 500,
      "currency": "ETB",
      "billingPeriod": "monthly",
      "features": [
        "Up to 15 listings",
        "Priority visibility",
        "1 Featured listing per month",
        "Email support"
      ],
      "limits": {
        "maxListings": 15,
        "maxImages": 15,
        "featuredListings": 1
      }
    },
    {
      "name": "premium",
      "displayName": "Premium",
      "price": 1500,
      "currency": "ETB",
      "billingPeriod": "monthly",
      "features": [
        "Unlimited listings",
        "Top visibility",
        "5 Featured listings per month",
        "Priority support",
        "Analytics dashboard"
      ],
      "limits": {
        "maxListings": -1,
        "maxImages": 30,
        "featuredListings": 5
      }
    }
  ]
}
```

---

#### Get My Subscription
```
GET /subscriptions/my
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "plan": "standard",
    "status": "active",
    "currentPeriodStart": "2026-01-01T00:00:00.000Z",
    "currentPeriodEnd": "2026-02-01T00:00:00.000Z",
    "usage": {
      "listingsUsed": 8,
      "listingsLimit": 15,
      "featuredUsed": 1,
      "featuredLimit": 1
    },
    "autoRenew": true
  }
}
```

---

#### Subscribe to Plan
```
POST /subscriptions
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "plan": "premium",
  "paymentMethod": "telebirr",
  "autoRenew": true
}
```

---

#### Cancel Subscription
```
DELETE /subscriptions/my
Authorization: Bearer <token>
```

---

### Payment Endpoints

---

#### Initiate Payment
```
POST /payments/initiate
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "amount": 1500,
  "currency": "ETB",
  "provider": "telebirr",
  "purpose": "subscription",
  "metadata": {
    "plan": "premium"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "transactionId": "uuid",
    "paymentUrl": "https://telebirr.com/pay/xxx",
    "expiresAt": "2026-01-16T11:30:00.000Z"
  }
}
```

---

#### Verify Payment
```
POST /payments/verify
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "transactionId": "uuid",
  "providerReference": "telebirr-ref-xxx"
}
```

---

#### Payment Webhook (Internal)
```
POST /payments/webhook/:provider
```

---

#### Get Payment History
```
GET /payments/history
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "amount": 1500,
      "currency": "ETB",
      "provider": "telebirr",
      "providerReference": "tel-xxx",
      "purpose": "subscription",
      "status": "completed",
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### Wallet Endpoints

---

#### Get Wallet
```
GET /wallet
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "balance": 5000,
    "currency": "ETB",
    "pendingBalance": 0
  }
}
```

---

#### Get Wallet Transactions
```
GET /wallet/transactions
Authorization: Bearer <token>
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| type | string | `credit` or `debit` |
| page | number | Page number |
| limit | number | Items per page |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "credit",
      "amount": 5000,
      "balance": 5000,
      "description": "Wallet top-up via Telebirr",
      "reference": "topup-xxx",
      "createdAt": "2026-01-15T10:00:00.000Z"
    },
    {
      "id": "uuid",
      "type": "debit",
      "amount": 200,
      "balance": 4800,
      "description": "Listing boost payment",
      "reference": "boost-xxx",
      "createdAt": "2026-01-16T09:00:00.000Z"
    }
  ],
  "pagination": {...}
}
```

---

#### Top Up Wallet
```
POST /wallet/topup
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "amount": 5000,
  "provider": "telebirr"
}
```

---

### Boost Endpoints

---

#### Get Boost Options
```
GET /boosts/options
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "featured_24h",
      "name": "Featured 24 Hours",
      "description": "Your listing appears at the top for 24 hours",
      "price": 100,
      "currency": "ETB",
      "duration": 24,
      "durationUnit": "hours",
      "benefits": [
        "Top placement in search results",
        "Featured badge",
        "5x more visibility"
      ]
    },
    {
      "id": "featured_7d",
      "name": "Featured 7 Days",
      "description": "Your listing appears at the top for 7 days",
      "price": 500,
      "currency": "ETB",
      "duration": 7,
      "durationUnit": "days",
      "benefits": [
        "Top placement in search results",
        "Featured badge",
        "5x more visibility",
        "Priority in homepage"
      ]
    }
  ]
}
```

---

#### Boost Listing
```
POST /boosts
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "listingId": "uuid",
  "boostType": "featured_7d",
  "paymentMethod": "wallet"
}
```

---

#### Get My Boosts
```
GET /boosts/my
Authorization: Bearer <token>
```

---

### Analytics Endpoints (Seller)

---

#### Get Listing Analytics
```
GET /analytics/listings/:listingId
Authorization: Bearer <token>
```

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| period | string | `30d` | `7d`, `30d`, `90d`, `all` |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "views": {
      "total": 1250,
      "trend": 15,
      "history": [
        { "date": "2026-01-15", "count": 45 },
        { "date": "2026-01-16", "count": 52 }
      ]
    },
    "favorites": {
      "total": 89,
      "trend": 8
    },
    "contacts": {
      "total": 15,
      "trend": 3
    },
    "topSources": [
      { "source": "search", "percentage": 60 },
      { "source": "featured", "percentage": 25 },
      { "source": "direct", "percentage": 15 }
    ]
  }
}
```

---

#### Get Dashboard Analytics (Seller)
```
GET /analytics/dashboard
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalListings": 12,
      "activeListings": 8,
      "totalViews": 5420,
      "totalFavorites": 234,
      "totalContacts": 56
    },
    "performance": {
      "viewsTrend": 12,
      "favoritesTrend": 8,
      "contactsTrend": -3
    },
    "topListings": [
      {
        "id": "uuid",
        "title": "Toyota Corolla",
        "views": 450,
        "favorites": 32
      }
    ],
    "recentActivity": [
      {
        "type": "new_favorite",
        "listing": "Toyota Corolla",
        "createdAt": "2026-01-16T10:30:00.000Z"
      }
    ]
  }
}
```

---

### Report Endpoints

---

#### Report Listing/User
```
POST /reports
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "entityType": "listing",
  "entityId": "uuid",
  "reason": "misleading",
  "description": "The images don't match the actual vehicle"
}
```

**Valid reasons:** `spam`, `misleading`, `inappropriate`, `fraud`, `duplicate`, `other`

---

### Upload Endpoints

---

#### Upload Images
```
POST /uploads/images
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `images`: Image files (max 10, JPEG/PNG/WebP)

**Response (201):**
```json
{
  "success": true,
  "message": "Images uploaded successfully",
  "data": [
    {
      "url": "/uploads/listings/abc123.jpg",
      "thumbnailUrl": "/uploads/thumbnails/abc123.jpg",
      "size": 245000,
      "mimetype": "image/jpeg",
      "width": 1920,
      "height": 1080
    }
  ]
}
```

---

#### Upload Video
```
POST /uploads/videos
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `video`: Video file (max 50MB, MP4/WebM)

---

#### Upload Avatar
```
POST /uploads/avatar
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `avatar`: Image file (JPEG/PNG, max 5MB)

---

#### Delete File
```
DELETE /uploads
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "filePath": "/uploads/listings/abc123.jpg"
}
```

---

### Admin Endpoints

> ⚠️ All admin endpoints require `admin` role.

---

#### Get All Users (Admin)
```
GET /admin/users
Authorization: Bearer <token>
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| role | string | Filter by role |
| isVerified | boolean | Filter by verification |
| search | string | Search by name/email |
| page | number | Page number |
| limit | number | Items per page |

---

#### Update User (Admin)
```
PUT /admin/users/:id
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "role": "seller",
  "isVerified": true,
  "isActive": true
}
```

---

#### Get Pending Listings (Admin)
```
GET /admin/listings/pending
Authorization: Bearer <token>
```

---

#### Approve Listing (Admin)
```
PUT /admin/listings/:id/approve
Authorization: Bearer <token>
```

---

#### Reject Listing (Admin)
```
PUT /admin/listings/:id/reject
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "reason": "Images don't match description"
}
```

---

#### Get Reports (Admin)
```
GET /admin/reports
Authorization: Bearer <token>
```

---

#### Resolve Report (Admin)
```
PUT /admin/reports/:id/resolve
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "action": "remove_listing",
  "notes": "Listing removed due to misleading content"
}
```

---

#### Get System Analytics (Admin)
```
GET /admin/analytics
Authorization: Bearer <token>
```

---

## Data Models

### User
```typescript
interface User {
  id: string;
  email: string;
  phone?: string;
  name: string;
  avatar?: string;
  role: 'buyer' | 'seller' | 'agency' | 'admin';
  isVerified: boolean;
  isActive: boolean;
  subscriptionPlan: 'basic' | 'standard' | 'premium';
  organizationId?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Listing
```typescript
interface Listing {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: 'vehicle' | 'property';
  status: 'draft' | 'pending' | 'active' | 'sold' | 'expired' | 'rejected';
  price: number;
  currency: string;
  isNegotiable: boolean;
  isFeatured: boolean;
  featuredUntil?: string;
  location: string;
  city: string;
  region: string;
  country: string;
  latitude?: number;
  longitude?: number;
  images: ListingImage[];
  videos: ListingVideo[];
  viewsCount: number;
  favoritesCount: number;
  contactsCount: number;
  vehicleAttribute?: VehicleAttributes;
  propertyAttribute?: PropertyAttributes;
  user: UserSummary;
  createdAt: string;
  publishedAt?: string;
}

interface ListingImage {
  url: string;
  thumbnail: string;
}

interface ListingVideo {
  url: string;
  thumbnail?: string;
}
```

### VehicleAttributes
```typescript
interface VehicleAttributes {
  make: string;
  model: string;
  year: number;
  bodyType?: string;
  fuelType?: 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'lpg' | 'cng';
  transmission?: 'automatic' | 'manual' | 'cvt' | 'semi_auto';
  mileage?: number;
  engineSize?: number;
  horsepower?: number;
  color?: string;
  interiorColor?: string;
  doors?: number;
  seats?: number;
  condition?: 'new' | 'used' | 'certified';
  vin?: string;
  licensePlate?: string;
  features: string[];
  specifications?: Record<string, any>;
}
```

### PropertyAttributes
```typescript
interface PropertyAttributes {
  propertyType: 'apartment' | 'house' | 'villa' | 'condo' | 'townhouse' | 'land' | 'commercial' | 'office';
  listingType: 'sale' | 'rent';
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
  condition?: 'new' | 'excellent' | 'good' | 'fair' | 'needs_work';
  amenities: string[];
  features: string[];
}
```

---

## TypeScript Interfaces

### API Response
```typescript
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: ApiError[];
}

interface ApiError {
  code: string;
  field?: string;
  message: string;
}
```

### Pagination
```typescript
interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}
```

### Auth
```typescript
interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresAt: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role?: 'buyer' | 'seller' | 'agency';
}
```

### Listing Filters
```typescript
interface ListingFilters {
  type?: 'vehicle' | 'property';
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  city?: string;
  region?: string;
  isFeatured?: boolean;
  
  // Vehicle specific
  make?: string;
  model?: string;
  minYear?: number;
  maxYear?: number;
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
  minMileage?: number;
  maxMileage?: number;
  condition?: string;
  
  // Property specific
  propertyType?: string;
  listingType?: 'sale' | 'rent';
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  minArea?: number;
  maxArea?: number;
  furnished?: boolean;
  
  // Pagination
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}
```

---

## Enums & Constants

### User Roles
| Value | Description |
|-------|-------------|
| `buyer` | Can browse, favorite, message, book appointments |
| `seller` | Can create listings, respond to messages |
| `agency` | Organization account with multiple listings |
| `admin` | Full system access |

### Listing Types
| Value | Description |
|-------|-------------|
| `vehicle` | Cars, motorcycles, trucks |
| `property` | Houses, apartments, land |

### Listing Status
| Value | Description |
|-------|-------------|
| `draft` | Not submitted |
| `pending` | Awaiting admin approval |
| `active` | Live and visible |
| `sold` | Marked as sold |
| `expired` | Past expiration date |
| `rejected` | Rejected by admin |

### Fuel Types
`petrol`, `diesel`, `electric`, `hybrid`, `lpg`, `cng`

### Transmission Types
`automatic`, `manual`, `cvt`, `semi_auto`

### Property Types
`apartment`, `house`, `villa`, `condo`, `townhouse`, `land`, `commercial`, `office`

### Property Conditions
`new`, `excellent`, `good`, `fair`, `needs_work`

### Vehicle Conditions
`new`, `used`, `certified`

### Subscription Plans
| Plan | Price | Max Listings | Featured |
|------|-------|--------------|----------|
| `basic` | Free | 3 | 0 |
| `standard` | 500 ETB/mo | 15 | 1 |
| `premium` | 1500 ETB/mo | Unlimited | 5 |

### Payment Providers
| Value | Description |
|-------|-------------|
| `telebirr` | Ethiopian mobile payment |
| `mpesa` | M-Pesa mobile payment |
| `wallet` | Internal wallet balance |

### Notification Types
| Value | Description |
|-------|-------------|
| `new_message` | New chat message |
| `listing_approved` | Listing approved by admin |
| `listing_rejected` | Listing rejected by admin |
| `listing_expired` | Listing has expired |
| `new_favorite` | Someone favorited your listing |
| `appointment_request` | New appointment request |
| `appointment_confirmed` | Appointment confirmed |
| `appointment_cancelled` | Appointment cancelled |
| `new_review` | New review received |
| `payment_received` | Payment confirmed |
| `subscription_expiring` | Subscription expiring soon |
| `saved_search_match` | New listing matches saved search |

---

## Frontend Integration Guide

### Authentication Flow
```typescript
// 1. Register or Login
const { token, refreshToken } = await api.auth.login({ email, password });

// 2. Store tokens securely
localStorage.setItem('token', token);
localStorage.setItem('refreshToken', refreshToken);

// 3. Set up axios interceptor
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 4. Handle 401 responses
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      const newToken = await api.auth.refresh(refreshToken);
      // Retry original request
    }
    return Promise.reject(error);
  }
);
```

### Loading Reference Data
```typescript
// On app initialization
const referenceData = await api.reference.getAll();

// Store in global state (Redux, Zustand, etc.)
store.dispatch(setReferenceData(referenceData));

// Use in forms
<Select options={referenceData.vehicle.makes.map(m => ({
  value: m.id,
  label: m.name
}))} />
```

### Search Implementation
```typescript
// Debounced search
const debouncedSearch = useMemo(
  () => debounce((filters) => {
    api.listings.search(filters);
  }, 300),
  []
);

// URL sync for shareable filters
const searchParams = new URLSearchParams(filters);
history.push(`/listings?${searchParams.toString()}`);
```

### Image Handling
```typescript
// Upload images
const formData = new FormData();
files.forEach(file => formData.append('images', file));

const response = await api.uploads.images(formData);

// Use thumbnails for list views
<img src={listing.images[0].thumbnail} alt={listing.title} />

// Full images for detail/gallery
<img src={listing.images[0].url} alt={listing.title} />
```

### Real-time Updates
```typescript
// Poll for notifications
useEffect(() => {
  const interval = setInterval(async () => {
    const { count } = await api.notifications.getUnreadCount();
    setUnreadCount(count);
  }, 30000);
  
  return () => clearInterval(interval);
}, []);

// Poll for messages in chat
useEffect(() => {
  if (!activeConversation) return;
  
  const interval = setInterval(async () => {
    const messages = await api.messages.get(activeConversation.id);
    setMessages(messages);
  }, 10000);
  
  return () => clearInterval(interval);
}, [activeConversation]);
```

### Offline Support
```typescript
// Cache listings for offline
const listings = await api.listings.search(filters);
await localForage.setItem('cached_listings', listings);

// Queue actions when offline
if (!navigator.onLine) {
  await localForage.setItem('pending_actions', [
    ...pendingActions,
    { type: 'favorite', listingId }
  ]);
}

// Sync when back online
window.addEventListener('online', async () => {
  const pending = await localForage.getItem('pending_actions');
  for (const action of pending) {
    await processAction(action);
  }
});
```

### Error Handling
```typescript
try {
  await api.listings.create(data);
} catch (error) {
  if (error.response?.data?.errors) {
    // Validation errors - show on form fields
    error.response.data.errors.forEach(err => {
      setFieldError(err.field, err.message);
    });
  } else {
    // General error - show toast
    toast.error(error.response?.data?.message || 'An error occurred');
  }
}
```

---

## Sample cURL Commands

### Quick Testing
```bash
# Health check
curl http://localhost:3001/health

# Get all reference data
curl http://localhost:3001/api/v1/reference/all

# Register user
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"password123"}'

# Login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'

# Get listings
curl "http://localhost:3001/api/v1/listings?type=vehicle&limit=5"

# Get featured vehicles
curl "http://localhost:3001/api/v1/listings?type=vehicle&isFeatured=true"

# Search properties in Bole
curl "http://localhost:3001/api/v1/listings?type=property&city=Addis+Ababa&location=Bole"
```

---

**API Version:** 1.0.0  
**Last Updated:** January 16, 2026  
**Contact:** API Support
