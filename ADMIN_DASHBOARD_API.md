# Admin Dashboard API Documentation

## Overview

This API provides endpoints for admin dashboard functionality. All endpoints require **Admin authentication** and **Admin role**.

**Base URL:** `/api/v1/admin`

**Authentication:** Bearer token (Admin role required)

---

## Table of Contents

1. [Admin Analytics](#1-admin-analytics-endpoint)
2. [Pending Listings](#2-pending-listings-endpoint)
3. [Admin Reports](#3-admin-reports-endpoint)
4. [Approve Listing](#4-approve-listing-endpoint)
5. [Reject Listing](#5-reject-listing-endpoint)
6. [Resolve Report](#6-resolve-report-endpoint)
7. [User Management](#user-management)
8. [Listing Management](#listing-management)
9. [Combo Field Management](#combo-field-management)

---

## 1. Admin Analytics Endpoint

**Endpoint:** `GET /api/v1/admin/analytics`

**Description:** Returns comprehensive analytics data for the admin dashboard overview.

**Response Format:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 12500,
    "usersChange": "+12.5%",
    "activeListings": 8500,
    "listingsChange": "+8.3%",
    "pendingListings": 45,
    "pendingChange": "-5.2%",
    "totalRevenue": 2500000,
    "revenueChange": "+15.8%",
    "totalReports": 23,
    "reportsChange": "+3.4%",
    "totalAgencies": 150,
    "agenciesChange": "+10.0%",
    "period": {
      "start": "2024-01-01T00:00:00.000Z",
      "end": "2024-01-31T23:59:59.999Z",
      "comparisonStart": "2023-12-01T00:00:00.000Z",
      "comparisonEnd": "2023-12-31T23:59:59.999Z"
    },
    "breakdown": {
      "usersByRole": {
        "buyer": 8000,
        "private": 3000,
        "broker": 1000,
        "dealership": 500
      },
      "listingsByType": {
        "vehicle": 6000,
        "property": 2500
      },
      "listingsByStatus": {
        "active": 8500,
        "pending": 45,
        "draft": 200,
        "rejected": 50,
        "expired": 100
      },
      "revenueBySource": {
        "subscriptions": 1500000,
        "boosts": 800000,
        "featured": 200000
      }
    },
    "trends": {
      "users": [
        { "date": "2024-01-01", "count": 12000 },
        { "date": "2024-01-02", "count": 12100 },
        { "date": "2024-01-31", "count": 12500 }
      ],
      "listings": [
        { "date": "2024-01-01", "count": 8200 },
        { "date": "2024-01-02", "count": 8250 },
        { "date": "2024-01-31", "count": 8500 }
      ],
      "revenue": [
        { "date": "2024-01-01", "amount": 50000 },
        { "date": "2024-01-02", "amount": 55000 },
        { "date": "2024-01-31", "amount": 80000 }
      ]
    }
  }
}
```

**Field Descriptions:**
- `totalUsers` (number): Total number of registered users
- `usersChange` (string): Percentage change from previous period (e.g., "+12.5%", "-5.2%")
- `activeListings` (number): Total number of active/published listings
- `listingsChange` (string): Percentage change in active listings
- `pendingListings` (number): Total number of listings awaiting approval
- `pendingChange` (string): Percentage change in pending listings
- `totalRevenue` (number): Total revenue in ETB (Ethiopian Birr)
- `revenueChange` (string): Percentage change in revenue
- `totalReports` (number): Total number of reports
- `reportsChange` (string): Percentage change in reports
- `totalAgencies` (number): Total number of agencies/brokers/dealerships
- `agenciesChange` (string): Percentage change in agencies
- `period` (object): Date range for the analytics
- `breakdown` (object): Detailed breakdowns by category
- `trends` (object): Time series data for charts

**Notes:**
- Change percentages are calculated comparing current period (last 30 days) to previous period (30 days before that)
- All numeric values are integers
- Percentages are formatted as strings with "%" symbol and "+" for positive changes
- Revenue is in ETB (Ethiopian Birr)
- Data is cached for 5 minutes

---

## 2. Pending Listings Endpoint

**Endpoint:** `GET /api/v1/admin/listings/pending`

**Description:** Returns a paginated list of listings awaiting admin approval.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page |
| search | string | - | Search in title, description |
| type | string | - | Filter by type: `vehicle` or `property` |
| sortBy | string | `createdAt` | Sort field: `createdAt`, `price`, `title` |
| sortOrder | string | `desc` | Sort order: `asc` or `desc` |

**Response Format:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid-here",
        "slug": "toyota-camry-2020",
        "title": "2020 Toyota Camry - Excellent Condition",
        "description": "Well maintained Toyota Camry...",
        "type": "vehicle",
        "price": 850000,
        "status": "pending",
        "city": "Addis Ababa",
        "location": "Bole",
        "isNegotiable": true,
        "images": [
          {
            "url": "https://...",
            "thumbnail": "https://...",
            "small": "https://...",
            "medium": "https://...",
            "large": "https://..."
          }
        ],
        "vehicleAttributes": {
          "make": "Toyota",
          "model": "Camry",
          "year": 2020,
          "mileage": 45000,
          "fuelType": "petrol",
          "transmission": "automatic",
          "bodyType": "sedan",
          "color": "white",
          "condition": "excellent"
        },
        "propertyAttributes": null,
        "user": {
          "id": "user-uuid",
          "name": "John Doe",
          "email": "john@example.com",
          "phone": "+251912345678",
          "role": "private",
          "isVerified": true,
          "avatar": "https://..."
        },
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z",
        "submittedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 45,
      "itemsPerPage": 20,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

**Field Descriptions:**
- Each listing includes full details (same as regular listing endpoint)
- `status` is always `"pending"` for all items
- `user` object includes seller information
- `submittedAt` is when the listing was submitted for approval (same as `createdAt`)
- `vehicleAttributes` or `propertyAttributes` contain the relevant attribute data

---

## 3. Admin Reports Endpoint

**Endpoint:** `GET /api/v1/admin/reports`

**Note:** This endpoint is also available at `/api/v1/reports` for backward compatibility.

**Description:** Returns a paginated list of user-submitted reports.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page |
| status | string | - | Filter by status: `pending`, `investigating`, `resolved`, `dismissed` |
| entityType | string | - | Filter by entity type: `listing` or `user` |
| sortBy | string | `createdAt` | Sort field: `createdAt`, `status` |
| sortOrder | string | `desc` | Sort order: `asc` or `desc` |

**Response Format:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "report-uuid",
        "entityType": "listing",
        "entityId": "listing-uuid",
        "target": {
          "id": "listing-uuid",
          "title": "2020 Toyota Camry",
          "type": "vehicle",
          "slug": "toyota-camry-2020"
        },
        "reporter": {
          "id": "user-uuid",
          "name": "Jane Smith",
          "email": "jane@example.com",
          "phone": "+251987654321"
        },
        "reason": "misleading",
        "description": "The images don't match the actual vehicle condition",
        "status": "pending",
        "priority": "medium",
        "assignedTo": null,
        "notes": null,
        "resolvedAt": null,
        "resolvedBy": null,
        "createdAt": "2024-01-16T14:20:00.000Z",
        "updatedAt": "2024-01-16T14:20:00.000Z"
      },
      {
        "id": "report-uuid-2",
        "entityType": "user",
        "entityId": "user-uuid",
        "target": {
          "id": "user-uuid",
          "name": "Suspicious Seller",
          "email": "suspicious@example.com",
          "role": "private"
        },
        "reporter": {
          "id": "user-uuid-2",
          "name": "Report User",
          "email": "reporter@example.com"
        },
        "reason": "fraud",
        "description": "Suspected fraudulent activity",
        "status": "investigating",
        "priority": "high",
        "assignedTo": {
          "id": "admin-uuid",
          "name": "Admin User"
        },
        "notes": "Under investigation",
        "resolvedAt": null,
        "resolvedBy": null,
        "createdAt": "2024-01-15T09:15:00.000Z",
        "updatedAt": "2024-01-16T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 23,
      "itemsPerPage": 20,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "summary": {
      "total": 23,
      "pending": 12,
      "investigating": 5,
      "resolved": 4,
      "dismissed": 2
    }
  }
}
```

**Field Descriptions:**
- `entityType`: Either `"listing"` or `"user"`
- `entityId`: UUID of the reported entity
- `target`: The actual entity being reported (listing or user object)
- `reporter`: User who submitted the report
- `reason`: One of: `spam`, `scam`, `fake_listing`, `wrong_category`, `duplicate`, `inappropriate_content`, `harassment`, `misleading_info`, `illegal_content`, `copyright`, `other`
- `status`: `pending`, `investigating`, `resolved`, `dismissed`
- `priority`: `low`, `medium`, `high`, `critical`
- `assignedTo`: Admin user assigned to handle the report (null if unassigned)
- `notes`: Admin notes about the report (from resolution field)
- `resolvedAt`: Timestamp when report was resolved (null if not resolved)
- `resolvedBy`: Admin who resolved the report (null if not resolved)
- `summary`: Counts by status

---

## 4. Approve Listing Endpoint

**Endpoint:** `PUT /api/v1/admin/listings/:id/approve`

**Note:** Also available as `POST /api/v1/listings/:id/approve` for backward compatibility.

**Description:** Approves a pending listing, making it active.

**Path Parameters:**
- `id` (string): Listing UUID

**Response Format:**
```json
{
  "success": true,
  "message": "Listing approved successfully",
  "data": {
    "id": "listing-uuid",
    "status": "active",
    "approvedAt": "2024-01-16T15:30:00.000Z",
    "approvedBy": {
      "id": "admin-uuid",
      "name": "Admin User"
    }
  }
}
```

---

## 5. Reject Listing Endpoint

**Endpoint:** `PUT /api/v1/admin/listings/:id/reject`

**Note:** Also available as `POST /api/v1/listings/:id/reject` for backward compatibility.

**Description:** Rejects a pending listing.

**Path Parameters:**
- `id` (string): Listing UUID

**Request Body:**
```json
{
  "reason": "Images are misleading or low quality"
}
```

**Response Format:**
```json
{
  "success": true,
  "message": "Listing rejected",
  "data": {
    "id": "listing-uuid",
    "status": "rejected",
    "rejectedAt": "2024-01-16T15:35:00.000Z",
    "rejectedBy": {
      "id": "admin-uuid",
      "name": "Admin User"
    },
    "rejectionReason": "Images are misleading or low quality"
  }
}
```

---

## 6. Resolve Report Endpoint

**Endpoint:** `PUT /api/v1/admin/reports/:id/resolve`

**Note:** Also available as `POST /api/v1/reports/:id/resolve` for backward compatibility.

**Description:** Resolves a report with an action.

**Path Parameters:**
- `id` (string): Report UUID

**Request Body:**
```json
{
  "action": "removed_listing",
  "notes": "Listing removed due to policy violation"
}
```

**Valid Actions:**
- `removed_listing`: Listing was removed
- `removed_user`: User account was removed
- `warned_user`: User was warned
- `no_action`: No action taken
- `dismissed`: Report was dismissed as invalid

**Response Format:**
```json
{
  "success": true,
  "message": "Report resolved",
  "data": {
    "id": "report-uuid",
    "status": "resolved",
    "action": "removed_listing",
    "notes": "Listing removed due to policy violation",
    "resolvedAt": "2024-01-16T16:00:00.000Z",
    "resolvedBy": {
      "id": "admin-uuid",
      "name": "Admin User"
    }
  }
}
```

---

## User Management

### Get All Users

**Endpoint:** `GET /api/v1/admin/users`

**Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `page` | number | Page number (default: 1) | `1` |
| `limit` | number | Items per page (default: 20, max: 100) | `20` |
| `role` | string | Filter by role: `buyer`, `private`, `broker`, `dealership`, `admin` | `buyer` |
| `isVerified` | boolean | Filter by verification status | `true` |
| `isActive` | boolean | Filter by active status | `true` |
| `search` | string | Search by name, email, or phone | `john` |
| `sortBy` | string | Sort field (default: `createdAt`) | `name` |
| `sortOrder` | string | Sort order: `ASC` or `DESC` (default: `DESC`) | `ASC` |

**Response:**
```json
{
  "success": true,
  "message": "Users retrieved",
  "data": [
    {
      "id": "uuid-here",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+251911234567",
      "role": "buyer",
      "isVerified": true,
      "isActive": true,
      "subscriptionPlan": "basic",
      "avatar": "https://...",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 100,
    "itemsPerPage": 20,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

### Get Users by Category

**Endpoint:** `GET /api/v1/admin/users/categories`

**Response:**
```json
{
  "success": true,
  "message": "Users categorized",
  "data": {
    "categories": {
      "buyer": {
        "count": 150,
        "users": [
          {
            "id": "uuid",
            "name": "John Doe",
            "email": "john@example.com",
            "isActive": true,
            "isVerified": true,
            "listingsCount": 0
          }
        ]
      },
      "private": {
        "count": 80,
        "users": [
          {
            "id": "uuid",
            "name": "Jane Smith",
            "email": "jane@example.com",
            "isActive": true,
            "isVerified": true,
            "listingsCount": 5
          }
        ]
      },
      "broker": {
        "count": 30,
        "users": [
          {
            "id": "uuid",
            "name": "Bob Broker",
            "email": "bob@example.com",
            "isActive": true,
            "isVerified": true,
            "listingsCount": 25
          }
        ]
      },
      "dealership": {
        "count": 15,
        "users": [
          {
            "id": "uuid",
            "name": "ABC Motors",
            "email": "info@abcmotors.com",
            "isActive": true,
            "isVerified": true,
            "listingsCount": 100
          }
        ]
      },
      "admin": {
        "count": 5,
        "users": [
          {
            "id": "uuid",
            "name": "Admin User",
            "email": "admin@example.com",
            "isActive": true,
            "isVerified": true
          }
        ]
      }
    },
    "summary": {
      "total": 280,
      "active": 250,
      "inactive": 30,
      "verified": 200,
      "unverified": 80
    }
  }
}
```

---

### Get User by ID

**Endpoint:** `GET /api/v1/admin/users/:id`

**Response:**
```json
{
  "success": true,
  "message": "User retrieved",
  "data": {
    "id": "uuid-here",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+251911234567",
    "role": "buyer",
    "isVerified": true,
    "isActive": true,
    "subscriptionPlan": "basic",
    "avatar": "https://...",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Update User

**Endpoint:** `PUT /api/v1/admin/users/:id`

**Request Body:**
```json
{
  "role": "broker",
  "isVerified": true,
  "isActive": true,
  "subscriptionPlan": "premium",
  "emailVerifiedAt": "2024-01-01T00:00:00.000Z",
  "phoneVerifiedAt": "2024-01-01T00:00:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User updated",
  "data": {
    "id": "uuid-here",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "broker",
    "isVerified": true,
    "isActive": true,
    "subscriptionPlan": "premium",
    ...
  }
}
```

---

## Listing Management

### Get All Listings (Admin)

**Endpoint:** `GET /api/v1/admin/listings`

**Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `page` | number | Page number (default: 1) | `1` |
| `limit` | number | Items per page (default: 20, max: 100) | `20` |
| `type` | string | Filter by type: `vehicle` or `property` | `vehicle` |
| `status` | string | Filter by status: `draft`, `pending`, `active`, `sold`, `expired`, `rejected` | `active` |
| `isFeatured` | boolean | Filter featured listings | `true` |
| `search` | string | Search in title and description | `toyota` |
| `minPrice` | number | Minimum price filter | `100000` |
| `maxPrice` | number | Maximum price filter | `5000000` |
| `city` | string | Filter by city | `addis-ababa` |
| `region` | string | Filter by region | `addis-ababa` |
| `userId` | string | Filter by user ID | `uuid-here` |
| `sortBy` | string | Sort field (default: `createdAt`) | `price` |
| `sortOrder` | string | Sort order: `ASC` or `DESC` (default: `DESC`) | `ASC` |

**Response:**
```json
{
  "success": true,
  "message": "Listings retrieved",
  "data": [
    {
      "id": "uuid-here",
      "title": "Toyota Camry 2022",
      "slug": "toyota-camry-2022",
      "description": "Excellent condition...",
      "type": "vehicle",
      "category": "vehicle",
      "isVehicle": true,
      "isProperty": false,
      "status": "active",
      "price": 2500000,
      "currency": "ETB",
      "isFeatured": true,
      "isNegotiable": true,
      "location": "Addis Ababa",
      "city": "addis-ababa",
      "region": "addis-ababa",
      "images": [
        {
          "url": "/uploads/images/listing1.jpg",
          "thumbnail": "/uploads/thumbnails/listing1.jpg"
        }
      ],
      "user": {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+251911234567",
        "role": "private",
        "avatar": "https://..."
      },
      "vehicleAttribute": {
        "make": "toyota",
        "model": "camry",
        "year": 2022,
        "fuelType": "petrol",
        "transmission": "automatic",
        "mileage": 15000,
        "bodyType": "sedan",
        "color": "white"
      },
      "stats": {
        "viewsCount": 150,
        "totalViews": 200,
        "totalUniqueViews": 180,
        "favoritesCount": 25,
        "totalFavoritesAdded": 30,
        "appointmentsCount": 5,
        "contactsCount": 12
      },
      "publishedAt": "2024-01-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 200,
    "itemsPerPage": 20,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

**Stats Explanation:**
- `viewsCount`: Current view count from listing model
- `totalViews`: Sum of all views from analytics
- `totalUniqueViews`: Sum of unique views from analytics
- `favoritesCount`: Current favorite count
- `totalFavoritesAdded`: Total times favorited (from analytics)
- `appointmentsCount`: Number of appointment requests
- `contactsCount`: Number of contact attempts

---

### Block Listing

**Endpoint:** `POST /api/v1/admin/listings/:id/block`

**Description:** Block a listing (removes it from public view). Sets status to `rejected`.

**Request Body:**
```json
{
  "reason": "Violates community guidelines"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Listing blocked successfully",
  "data": {
    "id": "uuid-here",
    "status": "rejected",
    "rejectionReason": "Violates community guidelines"
  }
}
```

**Note:** Blocked listings are removed from public listing pages and search results.

---

### Unblock Listing

**Endpoint:** `POST /api/v1/admin/listings/:id/unblock`

**Description:** Unblock a previously blocked listing and restore it to active status.

**Response:**
```json
{
  "success": true,
  "message": "Listing unblocked successfully",
  "data": {
    "id": "uuid-here",
    "status": "active"
  }
}
```

---

### Feature Listing

**Endpoint:** `POST /api/v1/listings/:id/feature`

**Note:** This endpoint is on the main listings route, not under `/admin`, but requires admin authentication.

**Description:** Feature a listing (makes it appear in featured section).

**Response:**
```json
{
  "success": true,
  "message": "Listing featured",
  "data": {
    "id": "uuid-here",
    "isFeatured": true,
    "featuredUntil": "2024-02-01T00:00:00.000Z",
    ...
  }
}
```

---

## Combo Field Management

See [COMBO_FIELD_MANAGEMENT_API.md](./COMBO_FIELD_MANAGEMENT_API.md) for complete documentation.

**Base URL:** `/api/v1/admin/combo-fields`

**Key Endpoints:**
- `GET /api/v1/admin/combo-fields/tables` - Get available table types
- `GET /api/v1/admin/combo-fields/:type` - List items
- `POST /api/v1/admin/combo-fields/:type` - Create item
- `PUT /api/v1/admin/combo-fields/:type/:id` - Update item
- `DELETE /api/v1/admin/combo-fields/:type/:id` - Delete item (soft delete)

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid request parameters"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required",
  "code": "AUTH_REQUIRED"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Admin access required",
  "code": "ADMIN_REQUIRED"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Frontend Integration Examples

### JavaScript/TypeScript Example

```typescript
const API_BASE = 'https://api.example.com/api/v1/admin';
const token = 'your-admin-token';

// Get admin analytics
const analyticsResponse = await fetch(`${API_BASE}/analytics`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const analyticsData = await analyticsResponse.json();

// Get pending listings
const pendingResponse = await fetch(`${API_BASE}/listings/pending?page=1&limit=20`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const pendingData = await pendingResponse.json();

// Get reports (note: not under /admin)
const reportsResponse = await fetch(`https://api.example.com/api/v1/reports?page=1&limit=20`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const reportsData = await reportsResponse.json();

// Approve a listing (PUT method)
const approveResponse = await fetch(`${API_BASE}/listings/${listingId}/approve`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Reject a listing (PUT method)
const rejectResponse = await fetch(`${API_BASE}/listings/${listingId}/reject`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    reason: 'Images are misleading'
  })
});

// Resolve a report (PUT method)
const resolveResponse = await fetch(`https://api.example.com/api/v1/reports/${reportId}/resolve`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    action: 'removed_listing',
    notes: 'Listing removed due to policy violation'
  })
});

// Get all users
const usersResponse = await fetch(`${API_BASE}/users?page=1&limit=20&role=buyer`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

// Get users by category
const categoriesResponse = await fetch(`${API_BASE}/users/categories`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Update user
const updateUserResponse = await fetch(`${API_BASE}/users/${userId}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    role: 'broker',
    isVerified: true
  })
});
```

---

## Quick Reference - All Admin Endpoints

### Under `/api/v1/admin`:

**Analytics:**
- `GET /api/v1/admin/analytics` - Get admin dashboard analytics

**Users:**
- `GET /api/v1/admin/users` - List all users
- `GET /api/v1/admin/users/categories` - Get users by category
- `GET /api/v1/admin/users/:id` - Get user by ID
- `PUT /api/v1/admin/users/:id` - Update user

**Listings:**
- `GET /api/v1/admin/listings/pending` - Get pending listings
- `GET /api/v1/admin/listings` - List all listings with stats
- `POST /api/v1/admin/listings/:id/block` - Block listing
- `POST /api/v1/admin/listings/:id/unblock` - Unblock listing

**Combo Fields:**
- `GET /api/v1/admin/combo-fields/tables` - Get table types
- `GET /api/v1/admin/combo-fields/tables/:type/info` - Get table info
- `GET /api/v1/admin/combo-fields/:type` - List items
- `GET /api/v1/admin/combo-fields/:type/:id` - Get item by ID
- `POST /api/v1/admin/combo-fields/:type` - Create item
- `PUT /api/v1/admin/combo-fields/:type/:id` - Update item
- `DELETE /api/v1/admin/combo-fields/:type/:id` - Delete item
- `POST /api/v1/admin/combo-fields/:type/:id/restore` - Restore item

### Under `/api/v1/listings` (Admin auth required):

- `PUT /api/v1/listings/:id/approve` - Approve listing (also POST for backward compatibility)
- `PUT /api/v1/listings/:id/reject` - Reject listing (also POST for backward compatibility)
- `POST /api/v1/listings/:id/feature` - Feature listing

### Under `/api/v1/reports` (Admin auth required):

- `GET /api/v1/reports` - Get all reports
- `GET /api/v1/reports/stats` - Get report stats
- `GET /api/v1/reports/:reportId` - Get report by ID
- `POST /api/v1/reports/:reportId/assign` - Assign report
- `PUT /api/v1/reports/:reportId/resolve` - Resolve report (also POST for backward compatibility)
- `POST /api/v1/reports/:reportId/dismiss` - Dismiss report

---

## Dashboard Features Checklist

### Analytics
- [x] Total users with change percentage
- [x] Active listings with change percentage
- [x] Pending listings with change percentage
- [x] Total revenue with change percentage
- [x] Total reports with change percentage
- [x] Total agencies with change percentage
- [x] Users breakdown by role
- [x] Listings breakdown by type
- [x] Listings breakdown by status
- [x] Revenue breakdown by source
- [x] Trends data for charts (users, listings, revenue)

### User Management
- [x] List all users with pagination
- [x] Filter users by role (buyer, private, broker, dealership, admin)
- [x] Filter by verification status
- [x] Filter by active status
- [x] Search users by name, email, or phone
- [x] Get users categorized by role
- [x] View user details
- [x] Update user information
- [x] User statistics summary

### Listing Management
- [x] Get pending listings with full details
- [x] List all listings (including featured and normal)
- [x] Filter by type (vehicle/property)
- [x] Filter by status (draft, pending, active, sold, expired, rejected)
- [x] Filter by featured status
- [x] Search listings
- [x] Filter by price range
- [x] Filter by location (city, region)
- [x] Filter by user
- [x] View listing stats (views, favorites, appointments, contacts)
- [x] Approve listings (PUT method)
- [x] Reject listings (PUT method)
- [x] Block listings (removes from public view)
- [x] Unblock listings
- [x] Feature listings

### Reports Management
- [x] View all reports with target entity details
- [x] Filter reports by status, entity type
- [x] Get report summary counts
- [x] Resolve reports with actions (PUT method)
- [x] Assign reports to admins
- [x] Dismiss reports

### Combo Field Management
- [x] Manage all reference data tables
- [x] Create, update, delete combo field items
- [x] Multilingual support

---

## Notes

1. **Endpoint Locations:**
   - Most admin endpoints are under `/api/v1/admin`
   - Reports are at `/api/v1/reports` (not under `/admin`)
   - Listing approve/reject/feature are at `/api/v1/listings/:id/...` (not under `/admin`)
   - All require admin authentication

2. **HTTP Methods:**
   - Approve/Reject listings: Both `PUT` (frontend) and `POST` (backward compatibility) supported
   - Resolve reports: Both `PUT` (frontend) and `POST` (backward compatibility) supported

3. **Blocking vs Rejecting**: 
   - Blocking sets status to `rejected` and removes listing from public view
   - Rejecting also sets status to `rejected` but is typically used during initial moderation
   - Both prevent listings from appearing on public pages

4. **Stats Calculation**:
   - View counts are aggregated from `ListingAnalytics` table
   - Favorite counts come from both `Listing.favoritesCount` and `Favorite` table
   - Appointment counts come from `Appointment` table
   - All stats are calculated in real-time

5. **Pagination**: 
   - Default page size is 20 items
   - Maximum page size is 100 items
   - Pagination info is always included in responses

6. **Filtering**:
   - Multiple filters can be combined
   - Search works across multiple fields
   - All filters are optional

7. **Authentication**:
   - All endpoints require Bearer token authentication
   - All endpoints require Admin role
   - Invalid or missing tokens return 401
   - Non-admin users return 403

8. **Caching**:
   - Analytics data is cached for 5 minutes
   - Cache can be cleared via refresh endpoint

9. **Change Calculations**: 
   - Compare current period (last 30 days) to previous period (30 days before that)
   - Formula: `((current - previous) / previous) * 100`
   - Format as string with "%" symbol
   - Include "+" for positive changes

10. **Revenue Formatting**: 
    - Display in ETB (Ethiopian Birr)
    - Revenue comes from completed transactions (subscriptions, boosts, featured listings)

---

## Additional Admin Settings

### Cache Management

**Clear Analytics Cache:**
```
POST /api/v1/analytics/refresh
```

### Audit Logs

All admin actions are automatically logged in the audit system for compliance and tracking.

---

## Support

For issues or questions, please contact the development team or refer to the main API documentation.
