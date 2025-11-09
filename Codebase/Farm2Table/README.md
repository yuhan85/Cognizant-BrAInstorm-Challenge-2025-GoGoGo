# Farm2Table - Local Farms to Customers Demo

A Next.js web application that connects local farms to customers, featuring a polished responsive UI, AI-powered features, and comprehensive order management.

## Features

- **Landing Page**: Hero section with video background, our story, partner farms grid, testimonials, and carbon reduction calculator
- **Farms**: Browse farms by city, view farm details with products and growth timelines
- **Pricing**: Two plans (Basic and Premium) with clear feature comparison
- **Farmer Dashboard**: 
  - Edit farm profile and manage products
  - Product management with create, update, and delete functionality
  - Analytics dashboard with monthly profit trends and sales overview
  - AI-powered business insights with weather impact, demand planning, and consumer preferences analysis
- **Customer Dashboard**: 
  - Profile management and preferences (allergies, special notes)
  - Nutrition tracking with weekly analysis and AI recommendations
  - Recipe recommendations using AI based on weekly box ingredients
  - Order history with detailed tracking and return functionality
  - Weekly bundle (Basic) or build your own box (Premium)
- **Driver Dashboard**:
  - Interactive map showing all pending delivery orders
  - Route optimization with visual path display
  - Order list with delivery addresses and time windows
  - Real-time order status tracking
- **Basic Plan**: Weekly fixed bundle with ability to remove items before cutoff
- **Premium Plan**: Build your own weekly box with delivery date/time selection
- **AI Features**: 
  - RAG-powered help widget with city and role filtering
  - Carbon reduction calculator with Google Gemini 2.0 Flash
  - Nutrition advisor with personalized recommendations
  - AI recipe generation based on weekly ingredients
  - AI business insights for farmers (weather, demand, consumer preferences)
- **Email Notifications**: Gmail API integration for premium orders (with MOCK fallback)

## Tech Stack

- **Framework**: Next.js 14 App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn UI components
- **Icons**: Lucide React
- **Authentication**: NextAuth.js with Credentials provider
- **Data Fetching**: React Query (TanStack Query)
- **AI**: Google Gemini 2.0 Flash
- **Email**: Gmail API (googleapis)
- **Validation**: Zod
- **Maps**: React Leaflet with OpenStreetMap
- **Charts**: Recharts for data visualization

## Setup

### Prerequisites

- Node.js 18+ and pnpm (or npm/yarn)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Create a `.env.local` file in the root directory:
   ```env
   # Google Gemini API (for language models)
   # Get your API key from: https://aistudio.google.com/app/apikey
   # API key should be at least 20 characters long
   GEMINI_API_KEY=your_gemini_api_key_here

   # Optional: Hugging Face API (for embeddings only)
   # If not provided, will use hash-based embeddings as fallback
   HUGGINGFACE_API_KEY=your_huggingface_api_key_here

   # Email Configuration
   EMAIL_MODE=MOCK
   NOTIFY_ORDERS_TO=orders@example.com

   # Gmail API (only needed if EMAIL_MODE=GMAIL)
   GMAIL_CLIENT_ID=
   GMAIL_CLIENT_SECRET=
   GMAIL_REDIRECT_URI=
   GMAIL_REFRESH_TOKEN=

   # App Configuration
   # Base URL for the application (used for redirects)
   # Use NEXT_PUBLIC_ prefix to make it available in client components
   NEXT_PUBLIC_APP_BASE_URL=http://localhost:3000
   APP_BASE_URL=http://localhost:3000
   OPTIONAL_CITY_DEFAULT=

   # NextAuth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-change-in-production
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Demo Accounts

The app includes four demo accounts for immediate login:

### Farmer Account
- **Email**: farmer_demo@example.com
- **Password**: FarmDemo!23
- **Access**: Farmer dashboard to manage farm profile, products, and view analytics

### Basic Plan Customer
- **Email**: basic_demo@example.com
- **Password**: BasicDemo!23
- **Access**: Customer dashboard with basic plan features (weekly bundle, nutrition tracking, recipes)

### Premium Plan Customer
- **Email**: premium_demo@example.com
- **Password**: PremiumDemo!23
- **Access**: Customer dashboard with premium plan features (build your own box, nutrition tracking, recipes)

### Driver Account
- **Email**: driver_demo@example.com
- **Password**: DriverDemo!23
- **Access**: Driver dashboard with interactive map, route optimization, and order management

## Email Mode

The app supports two email modes:

### MOCK Mode (Default)
- Logs email payloads to console
- Shows success toast to user
- No actual emails sent
- Perfect for development and demos

### GMAIL Mode
- Requires Gmail API credentials
- Sends actual emails via Gmail API
- Set `EMAIL_MODE=GMAIL` in `.env.local`
- Configure Gmail OAuth credentials

## Data Storage

- **Server**: In-memory stores loaded from JSON files in `/data` directory
- **Client**: localStorage for user profile and preferences
- **No Database**: All data is stored in memory and resets on server restart

## Project Structure

```
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── farms/             # Farm pages
│   ├── login/             # Login page
│   ├── pricing/           # Pricing page
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── ui/               # shadcn UI components
│   └── ...               # Feature components
├── contexts/             # React contexts
├── data/                 # JSON data files
├── lib/                  # Utility functions and helpers
└── types/                # TypeScript type definitions
```

## Key Features

### City Filtering
- Global city selector in navigation
- Filters farms and products by selected city
- Persists selection in localStorage

### AI Help Widget
- Persistent chat bubble on every page
- RAG-powered responses using precomputed embeddings
- City and role-based filtering
- Source badges with deep links

### Carbon Calculator
- Input: trips per week, distance, vehicle class
- Uses Google Gemini 2.0 Flash for intelligent estimates
- Falls back to deterministic calculation on error

### Nutrition Advisor
- Analyzes weekly nutrition intake for both Basic and Premium users
- Google Gemini 2.0 Flash-powered recommendations
- Respects allergies and preferences
- Suggests up to 5 items to fill nutritional gaps
- Visual nutrition charts showing weekly totals vs. recommended values

### AI Recipe Recommendations
- Generates personalized recipes based on weekly box ingredients
- Considers dietary restrictions and allergies
- Provides detailed instructions, ingredients list, and nutritional notes
- Available in dedicated Recipes tab

### Farmer Analytics
- Monthly profit trends per product
- Total sales overview with growth percentages
- AI-powered business insights covering:
  - Weather impact analysis
  - Demand planning recommendations
  - Local consumer preferences insights

### Driver Dashboard
- Interactive map (Halifax area) showing all pending delivery orders
- Route optimization algorithm for efficient delivery paths
- Visual path display connecting all delivery locations
- Order list with addresses, time windows, and status
- Real-time order tracking

### Order Management
- Real-time inventory checks
- Status updates (Created, Preparing, Out for delivery, Delivered)
- Farmer can update item status
- Customer sees aggregated order status
- Order details with tracking and return functionality
- Driver can view all pending deliveries on map

## Development

### Running Locally

```bash
pnpm dev
```

### Building for Production

```bash
pnpm build
pnpm start
```

### Linting

```bash
pnpm lint
```

## Notes

- All data is in-memory and resets on server restart
- User edits are mirrored to localStorage on the client
- No file writes to disk (except for localStorage)
- Gmail API requires OAuth setup for production use
- Google Gemini API key is required for AI features (get it from https://aistudio.google.com/app/apikey)
- Optional: Hugging Face API key for embeddings (falls back to hash-based embeddings if not provided)
- Map component uses dynamic import to avoid SSR issues with Leaflet
- Driver dashboard shows orders with status "out_for_delivery" in Halifax area
- Route optimization uses a predefined sequence for demo purposes

## License

MIT

