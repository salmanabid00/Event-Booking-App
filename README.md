# EventBookingApp

A full-stack MERN application for event booking with Stripe payment integration, user authentication, and admin dashboard.

## Features

### User Features
- User registration and authentication with JWT
- Browse events with search and category filters
- View detailed event information
- Book tickets with secure Stripe payment processing
- View booking history and manage bookings
- Email confirmation for successful bookings
- QR code generation for tickets

### Admin Features
- Admin dashboard with comprehensive statistics
- Create, update, and delete events
- Manage event categories (Standard/VIP)
- View all bookings and payment statuses
- Track ticket sales and availability

### Technical Features
- Responsive design with Tailwind CSS
- Secure payment processing with Stripe
- Email notifications using Nodemailer
- Role-based access control
- MongoDB database with Mongoose ODM
- RESTful API architecture
- Webhook integration for payment confirmation

## Tech Stack

### Frontend
- **React.js** with Vite
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Stripe React** for payment processing
- **Axios** for API calls
- **React QR Code** for ticket generation

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Stripe** for payment processing
- **Nodemailer** for email notifications
- **bcryptjs** for password hashing

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local)
- Stripe account for payment processing
- Gmail account for email notifications

### Backend Setup

1. Navigate to the backend directory:
\`\`\`bash
cd backend
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Create environment file:
\`\`\`bash
cp .env.example .env
\`\`\`

4. Configure your `.env` file:
\`\`\`env
MONGODB_URI=mongodb://localhost:27017/eventbookingapp
JWT_SECRET=your_super_secret_jwt_key_here
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here
PORT=5000
\`\`\`

5. Start the backend server:
\`\`\`bash
npm run dev
\`\`\`

### Frontend Setup

1. Navigate to the frontend directory:
\`\`\`bash
cd frontend
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Create environment file:
\`\`\`bash
cp .env.example .env
\`\`\`

4. Configure your `.env` file:
\`\`\`env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
VITE_API_URL=http://localhost:5000/api
\`\`\`

5. Start the frontend development server:
\`\`\`bash
npm run dev
\`\`\`

## Configuration Guide

### MongoDB Setup
1. Install MongoDB locally or use MongoDB Atlas
2. Create a database named `eventbookingapp`
3. Update the `MONGODB_URI` in your backend `.env` file

### Stripe Setup
1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe dashboard
3. Set up webhooks for payment confirmation:
   - Endpoint URL: `http://localhost:5000/api/payments/webhook`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Add the webhook secret to your `.env` file

### Email Setup (Gmail)
1. Enable 2-factor authentication on your Gmail account
2. Generate an app password for the application
3. Use your Gmail address and app password in the `.env` file

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Events
- `GET /api/events` - Get all events (with filters)
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create event (admin only)
- `PUT /api/events/:id` - Update event (admin only)
- `DELETE /api/events/:id` - Delete event (admin only)
- `GET /api/events/admin/stats` - Get event statistics (admin only)

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my-bookings` - Get user bookings
- `GET /api/bookings/all` - Get all bookings (admin only)
- `GET /api/bookings/:id` - Get booking by ID
- `PATCH /api/bookings/:id/cancel` - Cancel booking

### Payments
- `POST /api/payments/create-payment-intent` - Create Stripe payment intent
- `POST /api/payments/webhook` - Stripe webhook handler
- `GET /api/payments/status/:paymentIntentId` - Get payment status

## Database Schema

### User Model
\`\`\`javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (user/admin),
  bookings: [ObjectId],
  timestamps: true
}
\`\`\`

### Event Model
\`\`\`javascript
{
  title: String,
  description: String,
  date: Date,
  venue: String,
  price: Number,
  totalTickets: Number,
  remainingTickets: Number,
  category: String (Standard/VIP),
  image: String,
  createdBy: ObjectId,
  timestamps: true
}
\`\`\`

### Booking Model
\`\`\`javascript
{
  userId: ObjectId,
  eventId: ObjectId,
  ticketCount: Number,
  amountPaid: Number,
  paymentStatus: String (pending/completed/failed/refunded),
  stripePaymentIntentId: String,
  bookingId: String (unique),
  status: String (active/cancelled),
  timestamps: true
}
\`\`\`

## Usage

### For Users
1. Register for an account or login
2. Browse available events on the homepage
3. Use search and filters to find specific events
4. Click on an event to view details
5. Select number of tickets and proceed to checkout
6. Complete payment using Stripe
7. Receive email confirmation with QR code ticket
8. View all bookings in "My Bookings" section

### For Admins
1. Register with admin role or login as admin
2. Access admin dashboard from navigation
3. View statistics and analytics
4. Create new events with all details
5. Edit or delete existing events
6. Monitor all bookings and payments
7. Track ticket sales and availability

