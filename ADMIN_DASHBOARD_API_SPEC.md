# Admin Dashboard API Specification

This document outlines all API endpoints and response formats required for the Admin Dashboard page.

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication
All endpoints require Admin authentication:
```
Authorization: Bearer <admin_token>
```

---

## 1. Admin Analytics Endpoint

**Endpoint:** `GET /admin/analytics`

**Description:** Returns comprehensive analytics data for the admin dashboard overview.

**Response Format:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 12500,
    "usersChange": "12.5%",
    "activeListings": 8500,
    "listingsChange": "8.3%",
    "pendingListings": 45,
    "pendingChange": "-5.2%",
    "totalRevenue": 2500000,
    "revenueChange": "15.8%",
    "totalReports": 23,
    "reportsChange": "3.4%",
    "totalAgencies": 150,
    "agenciesChange": "10.0%",
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
- `usersChange` (string): Percentage change from previous period (e.g., "12.5%", "-5.2%")
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
- Change percentages should be calculated comparing current period to previous period (e.g., last 30 days vs previous 30 days)
- All numeric values should be integers
- Percentages should be formatted as strings with "%" symbol
- Revenue should be in ETB (Ethiopian Birr)

---

## 2. Pending Listings Endpoint

**Endpoint:** `GET /admin/listings/pending`

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
- Each listing should include full details (same as regular listing endpoint)
- `status` should be `"pending"` for all items
- `user` object should include seller information
- `submittedAt` is when the listing was submitted for approval

---

## 3. Admin Reports Endpoint

**Endpoint:** `GET /admin/reports`

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
- `reason`: One of: `spam`, `misleading`, `inappropriate`, `fraud`, `duplicate`, `other`
- `status`: `pending`, `investigating`, `resolved`, `dismissed`
- `priority`: `low`, `medium`, `high`
- `assignedTo`: Admin user assigned to handle the report (null if unassigned)
- `notes`: Admin notes about the report
- `resolvedAt`: Timestamp when report was resolved (null if not resolved)
- `resolvedBy`: Admin who resolved the report (null if not resolved)
- `summary`: Counts by status

---

## 4. Approve Listing Endpoint

**Endpoint:** `PUT /admin/listings/:id/approve`

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

**Endpoint:** `PUT /admin/listings/:id/reject`

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

**Endpoint:** `PUT /admin/reports/:id/resolve`

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

## Dashboard Display Requirements

### Stats Cards (4 cards)
1. **Total Users**
   - Value: `analytics.totalUsers`
   - Change: `analytics.usersChange`
   - Icon: Users
   - Trend indicator (up/down arrow)

2. **Active Listings**
   - Value: `analytics.activeListings`
   - Change: `analytics.listingsChange`
   - Icon: Car
   - Trend indicator

3. **Pending Reviews**
   - Value: `analytics.pendingListings`
   - Change: `analytics.pendingChange`
   - Icon: Clock
   - Trend indicator

4. **Total Revenue**
   - Value: `analytics.totalRevenue` (formatted as ETB)
   - Change: `analytics.revenueChange`
   - Icon: DollarSign
   - Trend indicator

### Pending Listings Section
- Display first 3 pending listings
- Each listing shows:
  - Thumbnail image
  - Title
  - Type badge (vehicle/property)
  - Seller name
  - Time since submission
  - Price
  - Approve button (green)
  - Reject button (red)
- "View All Pending" button linking to full list

### Recent Reports Section
- Display first 3 reports
- Each report shows:
  - Entity type badge (listing/user)
  - Status badge (pending/investigating/resolved)
  - Target entity name/ID
  - Reason
  - Time since report
- "View All Reports" button linking to full list

### Quick Actions Section
- Three action buttons:
  - Manage Users
  - Review Listings
  - Handle Reports

---

## Error Responses

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

## Implementation Notes

1. **Caching**: Analytics data should be cached for 5 minutes to reduce server load
2. **Pagination**: Default limit is 20 items per page, max 100
3. **Sorting**: Default sort is by `createdAt` descending (newest first)
4. **Change Calculations**: 
   - Compare current period (last 30 days) to previous period (30 days before that)
   - Formula: `((current - previous) / previous) * 100`
   - Format as string with "%" symbol
   - Include "+" for positive changes (optional)
5. **Revenue Formatting**: 
   - Display in ETB (Ethiopian Birr)
   - Format large numbers: 2,500,000 → "₿ 2.5M"
   - Use `toLocaleString()` for formatting
6. **Date Formatting**: 
   - Use relative time for recent items: "2 hours ago", "3 days ago"
   - Use absolute dates for older items: "Jan 15, 2024"
7. **Image URLs**: All image URLs should be absolute URLs, not relative paths

---

## Example API Calls

### Get Admin Analytics
```bash
curl -X GET "http://localhost:3000/api/v1/admin/analytics" \
  -H "Authorization: Bearer <admin_token>"
```

### Get Pending Listings
```bash
curl -X GET "http://localhost:3000/api/v1/admin/listings/pending?page=1&limit=20" \
  -H "Authorization: Bearer <admin_token>"
```

### Get Reports
```bash
curl -X GET "http://localhost:3000/api/v1/admin/reports?page=1&limit=20&status=pending" \
  -H "Authorization: Bearer <admin_token>"
```

### Approve Listing
```bash
curl -X PUT "http://localhost:3000/api/v1/admin/listings/{listing_id}/approve" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json"
```

### Reject Listing
```bash
curl -X PUT "http://localhost:3000/api/v1/admin/listings/{listing_id}/reject" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Images are misleading"}'
```

### Resolve Report
```bash
curl -X PUT "http://localhost:3000/api/v1/admin/reports/{report_id}/resolve" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"action": "removed_listing", "notes": "Listing removed"}'
```

---

## Additional Recommended Endpoints

### Get Admin Dashboard Summary (Alternative)
If you want a single endpoint that returns all dashboard data:

**Endpoint:** `GET /admin/dashboard`

**Response Format:**
```json
{
  "success": true,
  "data": {
    "analytics": {
      "totalUsers": 12500,
      "usersChange": "12.5%",
      "activeListings": 8500,
      "listingsChange": "8.3%",
      "pendingListings": 45,
      "pendingChange": "-5.2%",
      "totalRevenue": 2500000,
      "revenueChange": "15.8%"
    },
    "pendingListings": {
      "data": [...],
      "pagination": {...}
    },
    "recentReports": {
      "data": [...],
      "pagination": {...}
    }
  }
}
```

This would reduce the number of API calls from 3 to 1, improving performance.

---

## TypeScript Interfaces

```typescript
interface AdminAnalytics {
  totalUsers: number;
  usersChange: string;
  activeListings: number;
  listingsChange: string;
  pendingListings: number;
  pendingChange: string;
  totalRevenue: number;
  revenueChange: string;
  totalReports?: number;
  reportsChange?: string;
  totalAgencies?: number;
  agenciesChange?: string;
  period?: {
    start: string;
    end: string;
    comparisonStart: string;
    comparisonEnd: string;
  };
  breakdown?: {
    usersByRole: Record<string, number>;
    listingsByType: Record<string, number>;
    listingsByStatus: Record<string, number>;
    revenueBySource: Record<string, number>;
  };
  trends?: {
    users: Array<{ date: string; count: number }>;
    listings: Array<{ date: string; count: number }>;
    revenue: Array<{ date: string; amount: number }>;
  };
}

interface PendingListing extends Listing {
  submittedAt: string;
}

interface AdminReport {
  id: string;
  entityType: 'listing' | 'user';
  entityId: string;
  target: Listing | User;
  reporter: User;
  reason: string;
  description: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high';
  assignedTo: User | null;
  notes: string | null;
  resolvedAt: string | null;
  resolvedBy: User | null;
  createdAt: string;
  updatedAt: string;
}
```

---

This specification provides everything needed to implement the admin dashboard API endpoints. All response formats match what the frontend expects.

