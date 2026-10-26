# Prisma Press — Modular Blog Backend

A modular REST API built with TypeScript, Express 5, Prisma ORM, and PostgreSQL. Prisma Press supports user authentication, profile management, blog publishing, comments, moderation, administrative reporting, and Stripe-powered premium subscriptions.

## 🚀 Features

### 🔐 Authentication (`auth`)
- User login with email and password
- Password verification using bcrypt
- JWT access and refresh tokens
- HTTP-only cookie-based token storage
- Access token refresh endpoint

### 👤 User Management (`user`)
- User registration
- User profile creation
- Authenticated user profile retrieval
- Profile updates
- User roles and account status management

### 📝 Blog Posts (`post`)
- Create, retrieve, update, and delete posts
- Public post listing
- Search and filtering
- Pagination and sorting
- Post view count tracking
- Featured post management
- Author ownership checks
- Post statistics for administrators

### 💬 Comments (`comment`)
- Create and retrieve comments
- Retrieve comments by author
- Update and delete owned comments
- Comment ownership checks
- Admin comment moderation
- Approved and rejected comment statuses

### ⭐ Premium Content (`premium`)
- Premium content access controls
- Premium post access based on subscription eligibility
- Restricted access to premium content

### 💳 Subscription Management (`subscription`)
- Stripe Checkout integration
- Subscription lifecycle management
- Stripe webhook handling
- Subscription status synchronization
- Premium access management based on subscription status

### 🛡️ Middleware & Error Handling
- Authentication middleware
- Role-based authorization
- Premium access middleware
- Centralized error handling
- 404 handling for unknown routes
- Standardized API response utilities

### 🗄️ Database & Architecture
- PostgreSQL database
- Prisma ORM with PostgreSQL adapter
- Feature-based modular architecture
- Shared configuration and utility modules
- Database connection before server startup

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Express 5
- **ORM:** Prisma 7
- **Database:** PostgreSQL
- **Authentication:** JWT and bcrypt
- **Payments:** Stripe
- **Middleware:** CORS and cookie-parser
- **Development:** tsx
- **Package Managers:** npm and pnpm

## 📂 Project Structure

```text
src/
├── config/
├── db/
├── lib/
├── middlewares/
│   ├── auth.middleware.ts
│   ├── error.middleware.ts
│   ├── notFound.middleware.ts
│   └── premium.middleware.ts
├── modules/
│   ├── auth/
│   ├── user/
│   ├── post/
│   ├── comment/
│   ├── premium/
│   └── subscription/
├── utils/
├── app.ts
└── server.ts
```

## ⚙️ Getting Started

### Prerequisites

- Node.js
- PostgreSQL
- npm or pnpm
- Stripe account for subscription functionality

### Installation

```bash
git clone https://github.com/mafiullahhasan/prisma-press.git
cd prisma-press
npm install
```

### Environment Configuration

Create a `.env` file based on `.env.example` and configure the required database, application, authentication, and Stripe environment variables.

Never commit `.env` or secret credentials.

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

## 💳 Stripe Webhooks

The development webhook script forwards the following Stripe events to the local API:

- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Start the local webhook listener with:

```bash
npm run stripe:webhook
```

Configure the webhook signing secret and other Stripe credentials according to the application's environment configuration.

## 🧪 Testing

Automated tests are not currently configured. Testing coverage can be added as the project evolves.

## ⚠️ Known Limitations

- No automated test suite is currently configured.
- Request validation and rate limiting are not yet implemented.
- API response formats are not fully standardized across all modules.
- The authentication middleware expects the raw access token in the `Authorization` header.

## 📌 Project Status

A learning and portfolio project focused on modular backend architecture, authentication, content management, and subscription-based premium access.
