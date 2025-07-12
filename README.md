# Printify - Comprehensive API Documentation

## Table of Contents

1. [Overview](#overview)
2. [Backend API Documentation](#backend-api-documentation)
3. [Backend Services & Utilities](#backend-services--utilities)
4. [Frontend Components & Public APIs](#frontend-components--public-apis)
5. [Setup & Usage Instructions](#setup--usage-instructions)
6. [Examples](#examples)

---

## Overview

Printify is a comprehensive print order management platform built with:
- **Backend**: Node.js + Express with Prisma ORM and PostgreSQL
- **Frontend**: React with modern UI components and PDF handling
- **Features**: JWT authentication, role-based access, PDF uploads, order management, store management

---

## Backend API Documentation

**Base URL**: `/api/v1`

### Authentication Endpoints

#### POST `/auth/signup`
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "firstName": "John",
  "lastName": "Doe",
  "mobile": "1234567890"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "User created successfully",
  "data": {
    "id": "USR_12345678-1234-1234-1234-123456789012",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

#### POST `/auth/login`
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "USR_12345678-1234-1234-1234-123456789012",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

### User Endpoints

#### GET `/users/me`
Get current user profile.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "USR_12345678-1234-1234-1234-123456789012",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "mobile": "1234567890",
    "role": "user"
  }
}
```

#### PATCH `/users/me`
Update user profile.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "mobile": "9876543210",
  "email": "john.smith@example.com"
}
```

### Store Endpoints

#### POST `/stores/register`
Register a new store.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "storeName": "Print Shop Central",
  "shopAddress": "123 Main St, Anytown, ST 12345",
  "supportPhone": "(555) 123-4567",
  "businessName": "Print Shop Central LLC",
  "gstNumber": "GST123456789",
  "bankAccount": "1234567890",
  "billingAddress": "123 Main St, Anytown, ST 12345"
}
```

#### GET `/stores/me`
Get current user's store profile.

**Headers:** `Authorization: Bearer <token>`

#### PATCH `/stores/{id}`
Update store profile.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "storeName": "Updated Store Name",
  "shopAddress": "456 New Address, City, ST 54321",
  "supportPhone": "(555) 987-6543",
  "billingAddress": "456 New Address, City, ST 54321"
}
```

#### PATCH `/stores/{id}/pricing`
Update store print pricing.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "blackWhitePrice": 0.50,
  "colorPrice": 1.25
}
```

#### GET `/stores/all-approved`
List all approved stores (public endpoint).

**Query Parameters:**
- `status` (optional): Filter by status
- `skip` (optional): Number of records to skip (pagination)
- `take` (optional): Number of records to take (pagination)

**Response:**
```json
{
  "status": "success",
  "data": {
    "stores": [
      {
        "id": "SHP_12345678-1234-1234-1234-123456789012",
        "storeName": "Print Shop Central",
        "shopAddress": "123 Main St, Anytown",
        "supportPhone": "(555) 123-4567",
        "blackWhitePrice": 0.50,
        "colorPrice": 1.25,
        "status": "approved"
      }
    ],
    "total": 1,
    "skip": 0,
    "take": 20
  }
}
```

### Order Endpoints

#### POST `/orders/create`
Place a new print order with PDF upload.

**Headers:** `Authorization: Bearer <token>`

**Request Body:** `multipart/form-data`
- `pdf`: PDF file
- `storeId`: Store ID
- `colorMode`: "color" or "black_white"
- `pageRange`: Page range (e.g., "1,3,5-7")
- `paymentStatus`: Payment status
- `paymentMethod`: Payment method
- `discount`: Discount amount (optional)

**Response:**
```json
{
  "status": "success",
  "message": "Order created successfully",
  "data": {
    "id": "ORD_12345678-1234-1234-1234-123456789012",
    "price": 12.50,
    "discount": 2.00,
    "finalPrice": 10.50,
    "paymentStatus": "pending",
    "paymentMethod": "cash"
  }
}
```

#### GET `/orders/user`
Get current user's orders.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` (optional): Filter by status
- `skip` (optional): Number of records to skip
- `take` (optional): Number of records to take

#### GET `/orders/shop/{storeId}`
Get orders for a specific store (shop owner only).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` (optional): Filter by status
- `skip` (optional): Number of records to skip
- `take` (optional): Number of records to take

#### PATCH `/orders/{id}/status`
Update order status.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "status": "completed"
}
```

#### DELETE `/orders/{id}/pdf`
Delete order PDF and mark as completed.

**Headers:** `Authorization: Bearer <token>`

### Webhook Endpoints

#### POST `/webhooks/payment`
Payment webhook endpoint for external payment processors.

**Request Body:**
```json
{
  "event": "payment.completed",
  "payload": {
    "orderId": "ORD_12345678-1234-1234-1234-123456789012",
    "amount": 10.50,
    "transactionId": "txn_123456789"
  }
}
```

---

## Backend Services & Utilities

### Controllers

#### `authController.js`
**Exported Functions:**
- `signup(req, res, next)`: Handle user registration
- `login(req, res, next)`: Handle user authentication
- `getMe(req, res, next)`: Get current user profile
- `updateProfile(req, res, next)`: Update user profile
- `uploadProfileImage(req, res, next)`: Upload user profile image

#### `orderController.js`
**Exported Functions:**
- `createOrder(req, res, next)`: Create new order with PDF upload
- `getShopOrders(req, res, next)`: Get orders for a shop
- `getUserOrders(req, res, next)`: Get orders for current user
- `getOrderById(req, res, next)`: Get specific order details
- `updateOrderStatus(req, res, next)`: Update order status
- `deleteOrderPdf(req, res, next)`: Delete order PDF

#### `storeController.js`
**Exported Functions:**
- `registerStore(req, res, next)`: Register new store
- `getPendingStores(req, res, next)`: Get pending store approvals
- `approveStore(req, res, next)`: Approve store registration
- `getAllApprovedStores(req, res, next)`: Get all approved stores
- `getStoreByOwner(req, res, next)`: Get store by owner
- `updateStoreProfile(req, res, next)`: Update store profile
- `updateStorePricing(req, res, next)`: Update store pricing

#### `userController.js`
**Exported Functions:**
- `getUserProfile(req, res, next)`: Get user profile
- `updateUserProfile(req, res, next)`: Update user profile

#### `webhookController.js`
**Exported Functions:**
- `handlePaymentWebhook(req, res, next)`: Handle payment webhooks

### Services

#### `userService.js`
**Exported Functions:**
```javascript
createUser(userData) // Create new user
authenticateUser(email, password) // Authenticate user
getUserProfile(userId) // Get user profile
getUserById(userId) // Get user by ID
getUserByEmail(email) // Get user by email
updateUserProfile(userId, data) // Update user profile
updateUserProfileImage(userId, imageUrl) // Update profile image
```

#### `orderService.js`
**Exported Functions:**
```javascript
createOrder(orderData) // Create new order
getShopOrders({ storeId, status, skip, take }) // Get shop orders
getUserOrders({ userId, status, skip, take }) // Get user orders
getOrderById(orderId) // Get order by ID
updateOrderStatus(orderId, status) // Update order status
deleteOrderPdf(orderId) // Delete order PDF
```

#### `storeService.js`
**Exported Functions:**
```javascript
registerStore(storeData, ownerId) // Register new store
getPendingStores() // Get pending stores
approveStore(storeId) // Approve store
getAllApprovedStores({ status, skip, take }) // Get approved stores
getStoreByOwner(ownerId) // Get store by owner
updateStoreProfile(storeId, data) // Update store profile
updateStorePricing(storeId, data) // Update store pricing
```

#### `webhookService.js`
**Exported Functions:**
```javascript
createWebhook(event, payload) // Create webhook event
```

### Middleware

#### `auth.js`
**Exported Functions:**
```javascript
authenticate(req, res, next) // JWT authentication middleware
authorizeRoles(...roles) // Role-based authorization middleware
```

#### `logger.js`
**Exported Functions:**
```javascript
requestLogger(req, res, next) // Request logging middleware
```

### Utilities

#### `idPrefix.js`
**Exported Functions:**
```javascript
withPrefix(prefix) // Add prefix to IDs (e.g., USR_, SHP_, ORD_)
```

#### `s3.js`
**Exported Functions:**
```javascript
upload // Multer middleware for S3 uploads
```

---

## Frontend Components & Public APIs

### Main App Component

#### `App.js`
The root React component that handles routing and main application logic.

**Exported Function:**
```javascript
export default function App()
```

**Routes:**
- `/`: Main application content
- `/profile`: User profile page
- `/dashboard`: Shop owner dashboard
- `/orders`: Orders management page

**Usage:**
```jsx
import React from 'react';
import App from './App';

// In index.js:
ReactDOM.render(<App />, document.getElementById('root'));
```

### API Utility

#### `api.js`
Axios instance configured with JWT authentication and base URL.

**Exported:**
```javascript
export default api
```

**Configuration:**
- Base URL: `process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000/api/v1'`
- Automatic JWT token attachment from localStorage
- Request/response interceptors

**Usage:**
```javascript
import api from './api';

// GET request
const response = await api.get('/stores/all-approved');

// POST request with data
const response = await api.post('/auth/login', {
  email: 'user@example.com',
  password: 'password123'
});

// POST request with file upload
const formData = new FormData();
formData.append('pdf', file);
formData.append('storeId', storeId);
const response = await api.post('/orders/create', formData);
```

### Service Worker Registration

#### `serviceWorkerRegistration.js`
Service worker registration for PWA capabilities.

**Exported Functions:**
```javascript
export function register(config)
export function unregister()
```

**Parameters:**
- `config`: Configuration object with optional callbacks
  - `onSuccess`: Called when service worker is successfully registered
  - `onUpdate`: Called when new content is available

**Usage:**
```javascript
import { register, unregister } from './serviceWorkerRegistration';

// Register service worker
register({
  onSuccess: (registration) => {
    console.log('Service worker registered successfully');
  },
  onUpdate: (registration) => {
    console.log('New content available');
  }
});

// Unregister service worker
unregister();
```

### Utility Functions

#### `parsePagesInput(input, numPages)`
Parse page range input for PDF printing.

**Parameters:**
- `input`: String input (e.g., "1,3,5-7")
- `numPages`: Total number of pages in PDF

**Returns:** Array of page numbers

**Usage:**
```javascript
const pages = parsePagesInput("1,3,5-7", 10);
// Returns: [1, 3, 5, 6, 7]
```

### Components

#### `Navbar`
Navigation component with authentication state management.

**Props:**
- `active`: Current active page
- `onProfileClick`: Profile click handler
- `onLoginClick`: Login click handler

**Features:**
- Automatic authentication state detection
- Store information display for shop owners
- Responsive navigation menu

#### `ProfilePage`
User profile management component.

**Features:**
- User information display and editing
- Store registration for shop owners
- Profile image management

#### `OrdersPage`
Order management component for shop owners.

**Features:**
- Order listing with filtering
- Order status updates
- PDF preview and printing
- Expandable order details

#### `ShopOwnerDashboard`
Dashboard component for shop owners.

**Features:**
- Overview of shop operations
- Quick access to orders and settings

---

## Setup & Usage Instructions

### Backend Setup

1. **Install Dependencies:**
   ```bash
   cd Backend
   npm install
   ```

2. **Environment Configuration:**
   Create `.env` file with:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/printify"
   JWT_SECRET="your-jwt-secret"
   AWS_ACCESS_KEY_ID="your-aws-access-key"
   AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
   AWS_S3_BUCKET="your-s3-bucket"
   ```

3. **Database Setup:**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

4. **Start Server:**
   ```bash
   npm start
   ```

### Frontend Setup

1. **Install Dependencies:**
   ```bash
   cd test-cra
   npm install
   ```

2. **Environment Configuration:**
   Create `.env` file with:
   ```
   REACT_APP_API_BASE_URL=http://localhost:4000/api/v1
   ```

3. **Start Development Server:**
   ```bash
   npm start
   ```

### Production Build

**Backend:**
```bash
cd Backend
npm run build
```

**Frontend:**
```bash
cd test-cra
npm run build
```

---

## Examples

### Complete User Registration Flow

```javascript
// 1. Register user
const signupResponse = await api.post('/auth/signup', {
  email: 'john@example.com',
  password: 'securepass123',
  firstName: 'John',
  lastName: 'Doe',
  mobile: '1234567890'
});

// 2. Login
const loginResponse = await api.post('/auth/login', {
  email: 'john@example.com',
  password: 'securepass123'
});

// 3. Store token
localStorage.setItem('token', loginResponse.data.data.token);

// 4. Register store
const storeResponse = await api.post('/stores/register', {
  storeName: 'Print Shop Central',
  shopAddress: '123 Main St, Anytown',
  supportPhone: '(555) 123-4567',
  businessName: 'Print Shop Central LLC',
  gstNumber: 'GST123456789',
  bankAccount: '1234567890',
  billingAddress: '123 Main St, Anytown'
});
```

### Complete Order Creation Flow

```javascript
// 1. Get approved stores
const storesResponse = await api.get('/stores/all-approved');
const stores = storesResponse.data.data.stores;

// 2. Create order with PDF
const formData = new FormData();
formData.append('pdf', pdfFile);
formData.append('storeId', stores[0].id);
formData.append('colorMode', 'color');
formData.append('pageRange', '1-5');
formData.append('paymentStatus', 'pending');
formData.append('paymentMethod', 'cash');

const orderResponse = await api.post('/orders/create', formData);
const order = orderResponse.data.data;
```

### Frontend Component Usage

```jsx
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import { register } from './serviceWorkerRegistration';

function Root() {
  React.useEffect(() => {
    register({
      onSuccess: () => console.log('PWA ready'),
      onUpdate: () => console.log('Update available')
    });
  }, []);

  return (
    <Router>
      <App />
    </Router>
  );
}

export default Root;
```

---

## API Response Format

All API endpoints return a consistent response format:

```json
{
  "status": "success|error",
  "message": "Human-readable message",
  "data": {
    // Response data
  }
}
```

## Error Handling

API errors follow the same format:

```json
{
  "status": "error",
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": "Additional error details"
  }
}
```

## Authentication

Most endpoints require JWT authentication via the `Authorization` header:

```
Authorization: Bearer <jwt-token>
```

Tokens are automatically managed by the frontend API utility.

---

This documentation covers all public APIs, functions, and components in the Printify project. For additional details, refer to the Swagger documentation at `/api-docs` when the backend is running.