# v0 AI Prompt: ZCAR Marketplace React Native Mobile Application

## ⚠️⚠️⚠️ CRITICAL: THIS IS A NATIVE MOBILE APPLICATION - NOT A WEB APP ⚠️⚠️⚠️

**🚨 READ THIS FIRST:**
- **This is a React Native mobile application** - NOT a web application
- **This is NOT a mobile-first web design** - mobile-first means responsive web design
- **This is a native mobile app** that will run on iOS and Android devices
- **You MUST use React Native components ONLY** (View, Text, ScrollView, FlatList, Image, TouchableOpacity, Pressable, TextInput, etc.)
- **Do NOT use HTML elements** (div, span, button, input, etc.)
- **Do NOT use web-specific libraries** or web frameworks
- **Do NOT use Next.js, React DOM, or any web framework**
- **Use ONLY Expo SDK 54 and React Native packages**
- **This app will be published to iOS App Store and Google Play Store** - it's a native mobile app

**If you create a web application, you have failed the task. This MUST be a React Native mobile application.**

## Project Overview
Create a complete, professional **React Native mobile application** (NOT a web app) for **ZCAR Marketplace** - a dual-category platform for Vehicles and Properties in Ethiopia. This is a **native mobile app** that will be built with React Native and Expo, designed to run on iOS and Android devices. The app should mirror all web functionality with a beautiful, modern native mobile design using React Native components.

## Technical Requirements

### ⚠️ CRITICAL: Native Mobile Development Only
- **This is a React Native mobile app, NOT a web application**
- **Use ONLY React Native components** (View, Text, ScrollView, Image, TouchableOpacity, etc.)
- **Do NOT use HTML elements** (div, span, button, etc.)
- **Do NOT use web-specific libraries** or web components
- **All UI must be built with React Native components** that render natively on iOS and Android

### Stack (React Native Mobile App)
- **Expo SDK 54** (latest stable) - for React Native mobile app development
- **React Native 0.76+** (latest) - native mobile framework
- **Expo Router** for file-based navigation in React Native
- **React Native Paper** for Material Design components (React Native components)
- **NativeWind (Tailwind CSS)** for styling React Native components
- **React Query (TanStack Query)** for data fetching in React Native
- **Zustand** for state management in React Native
- **TypeScript** for type safety
- **React Native Reanimated** for native animations
- **React Native Gesture Handler** for native gestures
- **Expo Image** for optimized native images
- **Expo Linear Gradient** for native gradients
- **React Native Toast Message** for native notifications
- **Socket.io Client** for real-time features

### Design System (React Native Mobile App)
- **Primary Color**: Amber/Orange (#F59E0B to #EA580C gradient)
- **Font**: Native system fonts (SF Pro on iOS, Roboto on Android) - use React Native Text component
- **Spacing**: 4px base unit (use React Native StyleSheet)
- **Border Radius**: 8px, 12px, 16px, 24px (use borderRadius in StyleSheet)
- **Shadows**: Native elevation for cards (use shadowColor, shadowOffset, shadowOpacity for iOS, elevation for Android)
- **Icons**: Expo Vector Icons (Ionicons) - native icon components
- **Components**: Use React Native components ONLY (View, Text, ScrollView, FlatList, Image, TouchableOpacity, Pressable, etc.)

## Complete Feature List

### 1. Authentication Flow
- **Login Screen**
  - Phone/Password login
  - OTP login option (toggle)
  - "Forgot Password" link
  - Social login buttons (Google, Facebook, Apple)
  - Beautiful gradient background
  - Smooth animations

- **Register Screen**
  - Full name, phone, email (optional), password fields
  - Password strength indicator
  - Terms & conditions checkbox
  - Seller type selection (private, broker, dealership) for sellers
  - Multi-step form with progress indicator

- **OTP Verification Screen**
  - 6-digit OTP input with auto-focus
  - Resend OTP button with countdown
  - Phone number display
  - Success animation

### 2. Homepage
- **Hero Section**
  - Gradient background (amber to orange)
  - Vehicle/Property toggle at top (defaults to Vehicles)
  - Large search bar with filters
  - Stats cards (Active Listings, Verified Sellers, etc.)

- **Featured Listings Section**
  - Horizontal scrollable cards
  - Large images with overlay
  - Price, location, views displayed
  - "Featured" badge

- **Latest Listings Section**
  - Grid layout (2 columns)
  - Image, title, price, location
  - Quick view on tap
  - Pull to refresh

- **Popular Categories**
  - Category cards with images
  - Vehicle types (SUV, Sedan, etc.)
  - Property types (Apartment, House, etc.)

- **Quick Actions Grid**
  - Post Listing
  - Compare
  - Appointments
  - Dashboard

### 3. Browse Listings
- **Search & Filters**
  - Search bar at top
  - Filter button with modal
  - Type selector (Vehicle/Property)
  - Price range slider
  - Location picker
  - Advanced filters (make, model, year, etc.)

- **Listing Grid/List View**
  - Toggle between grid and list
  - Listing cards with:
    - Image gallery (swipeable)
    - Title
    - Price (large, bold)
    - Location
    - Views count
    - Favorite button
    - Featured badge
  - Infinite scroll pagination
  - Loading skeletons

### 4. Listing Detail Page (COMPLETE - All Features)
- **Image Gallery**
  - Full-screen image viewer
  - Swipeable carousel
  - Thumbnail strip below
  - Image counter
  - Pinch to zoom
  - Featured badge overlay

- **Header Section**
  - Title (large, bold)
  - Location with map icon
  - Price (extra large, amber color)
  - Negotiable badge
  - Views and favorites count

- **Action Buttons Row**
  - Favorite (heart icon, filled when active)
  - Compare (scale icon)
  - Share (share icon)
  - Report (flag icon)

- **Primary CTAs**
  - "Contact Seller" button (gradient, prominent)
  - "Request Appointment" button (outlined)
  - "Show Phone Number" button

- **Tabs Section**
  - Overview Tab:
    - All vehicle/property details in organized grid
    - Year, Make, Model, Mileage, Fuel Type, Transmission, Body Type, Color, Condition
    - Property: Bedrooms, Bathrooms, Area, Property Type, Condition
    - Icons for each attribute
  - Features Tab:
    - Checkmark list of features
    - Amenities for properties
  - Description Tab:
    - Full description text
    - Formatted with proper spacing

- **Seller Information Card**
  - Avatar
  - Name with verified badge
  - Rating with stars
  - Member since date
  - Listings count
  - "View Profile" button

- **Similar Listings**
  - Horizontal scrollable cards
  - Same design as listing cards

- **Safety Tips Card**
  - Amber background
  - Bullet points with icons

- **Posted Date**
  - Relative time (e.g., "Posted 2 days ago")

- **Modals**
  - Contact Seller Modal:
    - Seller avatar and info
    - Pre-filled message textarea
    - Send button
  - Request Appointment Modal:
    - Date picker
    - Time picker
    - Duration selector
    - Location input
    - Notes textarea
    - Contact phone input
    - Submit button

### 5. Dashboard (Role-Based)

#### Buyer Dashboard
- **Overview Stats**
  - Saved listings count
  - Active comparisons
  - Upcoming appointments
  - Unread messages

- **Quick Actions**
  - View Favorites
  - Compare Listings
  - Saved Searches
  - View Appointments

- **Recent Activity**
  - Recently viewed listings
  - Recent messages

#### Seller Dashboard
- **Overview Stats**
  - Active listings count
  - Total views
  - Messages count
  - Appointments count
  - Revenue (if applicable)

- **Quick Actions**
  - Create Listing
  - Boost Listing
  - View Analytics
  - Manage Subscription

- **Recent Listings**
  - List with thumbnails
  - Status badges
  - Quick edit/delete

- **Upcoming Appointments**
  - List with dates
  - Status indicators
  - Quick actions

#### Admin Dashboard
- **Overview Stats**
  - Total users
  - Total listings
  - Pending approvals
  - Reports count

- **Quick Actions**
  - Manage Users
  - Approve Listings
  - View Reports
  - Analytics

### 6. My Listings (Sellers)
- **Status Tabs**
  - All, Active, Pending, Draft
  - Count badges

- **Listing Cards**
  - Thumbnail image
  - Title and price
  - Status badge
  - Views count
  - Action buttons:
    - View
    - Edit
    - Publish (if draft)
    - Delete

- **FAB (Floating Action Button)**
  - Create new listing
  - Amber gradient

- **Empty State**
  - Illustration
  - "Create Your First Listing" button

### 7. Create/Edit Listing
- **Multi-Step Form**
  - Step 1: Type Selection
    - Vehicle/Property cards
    - Large icons
    - Descriptions
  - Step 2: Basic Information
    - Title (required)
    - Description (multiline)
    - Price (required)
    - City (required)
    - Location
    - Negotiable toggle
  - Step 3: Details
    - Vehicle: Make, Model, Year, Mileage, Fuel Type, Transmission, Body Type, Color, Condition, Features
    - Property: Type, Bedrooms, Bathrooms, Area, Condition, Amenities, Features
    - Dynamic form based on type
  - Step 4: Images
    - Image picker
    - Multiple images
    - Reorder images
    - Delete images
    - Upload progress

- **Progress Indicator**
  - Top progress bar
  - Step numbers

- **Navigation**
  - Back button
  - Next/Submit button

### 8. Favorites
- **List View**
  - Grid layout
  - Listing cards
  - Empty state with illustration
  - Pull to refresh

### 9. Messages
- **Conversations List**
  - Avatar
  - Name
  - Last message preview
  - Timestamp
  - Unread badge
  - Online indicator

- **Conversation Screen**
  - Header with seller info
  - Message bubbles
  - Input bar at bottom
  - Image attachment
  - Typing indicator
  - Read receipts
  - Date separators

### 10. Appointments
- **Filter Tabs**
  - All, Upcoming, Past, Cancelled

- **Appointment Cards**
  - Listing thumbnail
  - Date and time
  - Location
  - Status badge
  - Actions (Confirm/Cancel for sellers)

- **Empty State**
  - Illustration
  - Helpful message

### 11. Notifications
- **Notification List**
  - Icon based on type
  - Title and message
  - Timestamp
  - Unread indicator
  - Tap to navigate
  - Swipe to mark as read

- **Filter**
  - All, Unread

- **Actions**
  - Mark all as read
  - Clear all

### 12. Compare Listings
- **Comparison View**
  - Side-by-side cards
  - Key attributes compared
  - Highlight differences
  - Remove from comparison
  - "View Details" buttons

- **Empty State**
  - Illustration
  - "Browse Listings" button

### 13. Saved Searches
- **Search Cards**
  - Search name
  - Filters summary
  - Notification toggle
  - "Run Search" button
  - Delete button

### 14. Subscription
- **Current Plan Card**
  - Plan name (large)
  - Status
  - Expiry date
  - Gradient background

- **Available Plans**
  - Plan cards with:
    - Plan name
    - Price
    - Features list with checkmarks
    - "Subscribe" button
  - Highlight current plan

### 15. Wallet
- **Balance Card**
  - Large balance display
  - Currency
  - Gradient background

- **Top Up Section**
  - Amount input
  - Payment method selector
  - "Top Up" button

- **Transaction History**
  - List of transactions
  - Date, description, amount
  - Credit/Debit indicators
  - Color coding

### 16. Boosts
- **Boost Options**
  - Cards for each boost type
  - Name, description
  - Price per day
  - Select button

- **Boost Form**
  - Select listing dropdown
  - Select boost type
  - Duration input
  - Price calculator
  - Payment method
  - "Boost Listing" button

### 17. Analytics (Sellers)
- **Stats Grid**
  - Total listings
  - Active listings
  - Total views
  - Total favorites
  - Total messages

- **Charts**
  - Views over time (line chart)
  - Listing performance (bar chart)
  - Traffic sources (pie chart)

- **Performance Metrics**
  - Average views per listing
  - Conversion rate
  - Response rate

### 18. Settings
- **Profile Section**
  - Avatar
  - Name, email, phone
  - Edit button

- **Settings Tabs**
  - Profile
  - Security (Change Password)
  - Notifications
  - Parameters (Admin Only)

- **Profile Tab**
  - Edit profile form
  - Avatar upload
  - Save button

- **Security Tab**
  - Change password form
  - Current password
  - New password
  - Confirm password
  - Show/hide toggles

- **Notifications Tab**
  - Email notifications toggles
  - Push notifications toggles
  - Categories:
    - New messages
    - Listing approved
    - New favorites
    - Price changes
    - Newsletter
    - Appointments

- **Parameters Tab (Admin Only)**
  - Table type selector
  - List view with pagination
  - Search and filters
  - Create/Edit/Delete actions
  - Multilingual name inputs

### 19. Admin Features

#### Admin Dashboard
- **Stats Cards**
  - Total users
  - Total listings
  - Pending approvals
  - Reports

#### User Management
- **User List**
  - Search bar
  - Role filter
  - Verification filter
  - User cards with:
    - Avatar
    - Name, email, phone
    - Role badge
    - Verification status
    - Actions (Edit, Deactivate)

#### Listing Management
- **Pending Listings**
  - List with thumbnails
  - Approve/Reject buttons
  - View details

#### Reports Management
- **Reports List**
  - Report type
  - Entity details
  - Status
  - Actions (Resolve, Dismiss)

### 20. Seller Profile
- **Profile Header**
  - Large avatar
  - Name with verified badge
  - Rating
  - Member since
  - Listings count

- **Listings Grid**
  - Seller's listings
  - Same card design

- **Reviews Section**
  - Review cards
  - Rating stars
  - Review text
  - Date

## Design Requirements

### Visual Design
- **Modern & Clean**: Minimal, uncluttered interface
- **Professional**: Suitable for commercial use
- **Consistent**: Same design language throughout
- **Accessible**: Good contrast, readable fonts
- **Responsive**: Works on all screen sizes

### Color Palette
- **Primary**: Amber (#F59E0B) to Orange (#EA580C) gradients
- **Success**: Green (#10B981)
- **Error**: Red (#EF4444)
- **Warning**: Amber (#F59E0B)
- **Info**: Blue (#3B82F6)
- **Background**: White (#FFFFFF) and Gray (#F9FAFB)
- **Text**: Dark Gray (#111827) and Medium Gray (#6B7280)

### Typography
- **Headings**: Bold, 24px-32px
- **Body**: Regular, 16px
- **Small Text**: 14px
- **Labels**: Medium weight, 14px

### Components Style (React Native Components)
- **Cards**: Use React Native View component with white background, native shadow, borderRadius 12px
- **Buttons**: 
  - Primary: Use Pressable or TouchableOpacity with LinearGradient, white Text, borderRadius 12px
  - Secondary: Use Pressable with white background, amber border, borderRadius 12px
  - Ghost: Use Pressable with transparent background, Text only
- **Inputs**: Use React Native TextInput component with white background, gray border, borderRadius 12px, padding 16px
- **Badges**: Use React Native View with borderRadius (full), colored background, white Text component

### Animations
- **Page Transitions**: Smooth slide animations
- **Loading States**: Skeleton loaders
- **Button Press**: Subtle scale animation
- **List Items**: Fade in on scroll
- **Modals**: Slide up from bottom

### Navigation (React Native Navigation)
- **Bottom Tab Bar**: Use Expo Router's Tabs or React Navigation's Bottom Tabs - 5 main tabs (Home, Browse, Favorites, Messages, Profile)
- **Stack Navigation**: Use Expo Router Stack or React Navigation Stack for detail screens
- **Drawer Navigation**: Use React Navigation Drawer for dashboard (optional)
- **Tab Bar Design**: 
  - Amber active color
  - Native icons with labels
  - Badge indicators for notifications/messages (use React Native View/Text for badges)

## Screen Structure (React Native Expo Router)

**All screens must use React Native components (View, Text, ScrollView, FlatList, etc.) - NOT web components**

```
app/
  (auth)/
    login.tsx          # React Native screen with TextInput, Pressable, etc.
    register.tsx       # React Native screen with form components
    verify-otp.tsx     # React Native screen with OTP input
  (tabs)/
    index.tsx (Home)   # React Native screen
    listings.tsx       # React Native screen with FlatList
    favorites.tsx      # React Native screen
    messages.tsx       # React Native screen
    profile.tsx        # React Native screen
  listing/
    [slug].tsx        # React Native detail screen
  dashboard/
    index.tsx          # React Native dashboard screen
    listings/
      index.tsx        # React Native listings list
      create.tsx       # React Native form screen
      [id]/
        edit.tsx       # React Native edit screen
    appointments.tsx   # React Native appointments screen
    notifications.tsx  # React Native notifications screen
    subscription.tsx  # React Native subscription screen
    wallet.tsx         # React Native wallet screen
    boosts.tsx         # React Native boosts screen
    analytics.tsx      # React Native analytics screen
    settings/
      index.tsx        # React Native settings screen
      parameters.tsx   # React Native admin parameters screen
  compare.tsx          # React Native compare screen
  admin/
    index.tsx          # React Native admin dashboard
    users.tsx          # React Native user management
    listings.tsx       # React Native listing management
    reports.tsx        # React Native reports management
```

## Key Interactions

1. **Pull to Refresh**: All list screens
2. **Infinite Scroll**: Browse listings, messages
3. **Swipe Actions**: Delete, mark as read
4. **Long Press**: Quick actions menu
5. **Swipe Navigation**: Image galleries
6. **Bottom Sheet**: Filters, actions
7. **Toast Notifications**: Success, error, info messages

## Special Features

1. **Real-time Updates**: Socket.io for messages, notifications
2. **Offline Support**: Cache listings, queue actions
3. **Image Optimization**: Lazy loading, caching
4. **Search**: Debounced, with suggestions
5. **Filters**: Persistent, shareable
6. **Deep Linking**: Share listings, open from notifications

## UI Components Needed (React Native Components Only)

**All components must be built with React Native components (View, Text, ScrollView, etc.) - NOT web components**

1. **ListingCard**: Reusable React Native card component using View, Image, Text, Pressable
2. **ImageGallery**: Swipeable React Native image viewer using ScrollView or FlatList with horizontal paging
3. **FilterModal**: React Native bottom sheet using Modal or BottomSheet component
4. **SearchBar**: React Native TextInput with autocomplete using FlatList
5. **Badge**: React Native View/Text component for status, count indicators
6. **LoadingSkeleton**: React Native View components for loading states
7. **EmptyState**: React Native View/Text/Image for empty lists
8. **Toast**: React Native Toast Message or custom Toast using Modal
9. **BottomSheet**: React Native Modal or react-native-bottom-sheet package
10. **TabBar**: Expo Router Tabs or React Navigation Bottom Tabs

## Design Inspiration

- **Airbnb**: For listing cards and detail pages
- **Carousell**: For marketplace feel
- **Uber**: For clean, modern design
- **Instagram**: For image galleries
- **WhatsApp**: For messaging interface

## Deliverables

**Create a complete React Native mobile application (NOT a web app) with:**
- All screens designed and implemented using React Native components ONLY
- Beautiful, professional native mobile UI
- Smooth native animations using React Native Reanimated
- Proper React Native navigation structure (Expo Router)
- Loading and error states using React Native components
- Empty states using React Native View/Text/Image
- Responsive design for different screen sizes (use React Native Dimensions)
- TypeScript types for all components
- Component reusability with React Native components
- React Native best practices

## ⚠️ CRITICAL REQUIREMENTS

### DO NOT:
- ❌ Do NOT create a web application
- ❌ Do NOT use HTML elements (div, span, button, etc.)
- ❌ Do NOT use web-specific libraries
- ❌ Do NOT use mobile-first CSS (this is for web, not React Native)
- ❌ Do NOT use Next.js or any web framework
- ❌ Do NOT create responsive web design

### DO:
- ✅ Use ONLY React Native components (View, Text, ScrollView, FlatList, Image, TouchableOpacity, Pressable, TextInput, etc.)
- ✅ Use Expo SDK 54 for React Native mobile app development
- ✅ Use React Native StyleSheet for styling
- ✅ Use native mobile navigation (Expo Router or React Navigation)
- ✅ Use React Native Paper or native UI components
- ✅ Follow React Native best practices
- ✅ Ensure native mobile performance
- ✅ Use native mobile gestures and animations
- ✅ Handle edge cases with React Native error boundaries
- ✅ Include proper error handling for React Native
- ✅ Add loading states everywhere using React Native ActivityIndicator
- ✅ Make it production-ready for iOS and Android app stores

## Notes

- **This is a React Native mobile application** that will run natively on iOS and Android devices
- Use Expo 54 and latest stable React Native packages
- Follow React Native best practices (not web practices)
- Ensure native mobile accessibility
- Optimize for native mobile performance
- Handle edge cases with React Native patterns
- Include proper error handling for mobile apps
- Add loading states everywhere using React Native components
- Make it production-ready for App Store and Google Play Store

---

**⚠️ FINAL REMINDER: Create a complete, production-ready React Native mobile application (NOT a web app) with all the above features, screens, and requirements. Use ONLY React Native components. The design should be beautiful, modern, and professional - suitable for a commercial mobile marketplace application that will be published to iOS App Store and Google Play Store.**

