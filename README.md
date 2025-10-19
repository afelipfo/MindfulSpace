# MindfulSpace

A comprehensive mental wellness platform that connects users with licensed therapists, provides AI-powered wellness recommendations, and offers tools for mood tracking and personal growth.

## Overview

MindfulSpace is a full-stack web application designed to support mental health through a combination of professional therapy, self-monitoring tools, and AI-assisted guidance. The platform enables users to schedule therapy sessions, communicate with therapists, track mood patterns, set wellness goals, and receive personalized recommendations.

## Core Features

### User Management
- Secure authentication and authorization with Supabase Auth
- User profiles with customizable privacy settings (public, encrypted, anonymized)
- Comprehensive onboarding flow to capture user concerns, goals, and preferences
- Timezone and notification preferences management

### Therapy Services
- Browse and filter licensed therapists by specialization, location, and availability
- View detailed therapist profiles including credentials, experience, and therapy approaches
- Schedule, manage, and cancel appointments with integrated calendar
- Real-time messaging system with therapists
- AI-generated greeting messages and cancellation notifications
- Video, phone, and in-person session support

### Wellness Tools
- Mood logging with customizable metrics (mood level, energy, stress)
- Interactive mood trend visualization and heatmap analytics
- Wellness goal creation and progress tracking
- AI-powered wellness recommendations based on user data
- Diagnostics summary generation and sharing with therapists
- Activity and resource recommendations (music, podcasts, exercises, local venues)

### AI Features
- MindfulBot: Interactive AI companion for mental health support
- Automated goal recommendations based on onboarding data
- Intelligent recommendation system with feedback loop
- Context-aware therapist greeting generation
- Diagnostics report synthesis for therapist communication

### Administration
- Therapist account management utilities
- User data export and privacy controls
- Audit logging for compliance
- Debug endpoints for development

## Technology Stack

### Frontend
- **Framework**: Next.js 15.5.6 (React 19)
- **Styling**: Tailwind CSS 4.1.9
- **UI Components**: Radix UI primitives with custom Shadcn components
- **State Management**: React Hooks and server components
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js with TypeScript 5
- **API**: Next.js API Routes (REST)
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth with JWT
- **Storage**: Supabase Storage
- **Real-time**: Supabase Realtime subscriptions

### AI & External Services
- **AI Models**: OpenAI GPT-4 via AI SDK
- **Music Data**: Spotify API
- **Location Services**: Foursquare API

### Development Tools
- **Language**: TypeScript
- **Package Manager**: pnpm
- **Build Tool**: Next.js (Webpack/Turbopack)
- **Testing**: Node.js test runner with tsx
- **Linting**: ESLint

## Project Structure

```
mental-wellness-platform/
├── app/                          # Next.js app directory
│   ├── api/                      # API route handlers
│   │   ├── appointments/         # Appointment CRUD and scheduling
│   │   ├── messages/             # Messaging and conversations
│   │   ├── mood-logs/            # Mood tracking endpoints
│   │   ├── wellness-goals/       # Goal management
│   │   ├── recommendations/      # AI recommendation engine
│   │   ├── therapists/           # Therapist search and matching
│   │   ├── diagnostics/          # User diagnostics and reporting
│   │   ├── mindful-bot/          # AI chatbot endpoints
│   │   ├── profile/              # User profile management
│   │   ├── settings/             # User preferences
│   │   ├── onboarding/           # Onboarding data collection
│   │   ├── admin/                # Administrative utilities
│   │   └── debug/                # Development debugging
│   ├── auth/                     # Authentication pages
│   ├── dashboard/                # Main user dashboard
│   ├── profile/                  # User profile view
│   ├── settings/                 # Settings interface
│   ├── appointments/             # Appointment management UI
│   ├── messages/                 # Messaging interface
│   ├── therapists/               # Therapist discovery
│   ├── recommendations/          # Recommendation viewer
│   ├── onboarding/               # User onboarding flow
│   └── admin/                    # Admin tools
├── components/                   # React components
│   ├── ui/                       # Base UI primitives (46 components)
│   ├── dashboard/                # Dashboard-specific components
│   ├── messages/                 # Messaging components
│   ├── therapists/               # Therapist-related components
│   ├── appointments/             # Appointment components
│   ├── onboarding/               # Onboarding flow components
│   ├── profile/                  # Profile management components
│   ├── recommendations/          # Recommendation display
│   └── settings/                 # Settings components
├── lib/                          # Utility libraries
│   ├── supabase/                 # Supabase client configurations
│   ├── wellness/                 # Wellness recommendation logic
│   ├── diagnostics/              # Diagnostics generation
│   ├── recommendations/          # Recommendation algorithms
│   └── utils.ts                  # Shared utilities
├── scripts/                      # Database migrations and utilities
│   ├── 001-013_*.sql            # Sequential database migrations
│   └── fix-therapist-accounts.ts # Account setup utility
├── tests/                        # Test files
├── public/                       # Static assets
├── middleware.ts                 # Next.js middleware (auth)
└── styles/                       # Global styles
```

## Database Schema

### Core Tables
- **profiles**: User profile data and preferences
- **onboarding_data**: Initial user assessment data
- **therapists**: Licensed therapist profiles and metadata
- **appointments**: Therapy session scheduling
- **messages**: User-therapist messaging
- **mood_logs**: User mood tracking entries
- **wellness_goals**: User-defined wellness objectives
- **recommendations**: AI-generated wellness recommendations
- **audit_logs**: System activity logging

### Key Relationships
- Users (auth.users) → Profiles (1:1)
- Users → Mood Logs (1:N)
- Users → Wellness Goals (1:N)
- Users → Appointments (1:N)
- Therapists → Appointments (1:N)
- Users ↔ Therapists → Messages (N:M through messages)

## API Endpoints

### Authentication
- `POST /api/auth/*` - Handled by Supabase Auth

### User Data
- `GET/PATCH /api/profile` - User profile management
- `POST /api/onboarding` - Save onboarding responses
- `GET/PATCH /api/settings` - User preferences

### Wellness
- `GET/POST /api/mood-logs` - Mood logging
- `GET/POST /api/wellness-goals` - Goal management
- `PATCH/DELETE /api/wellness-goals/[id]` - Individual goal operations

### Recommendations
- `POST /api/recommendations/generate` - Generate AI recommendations
- `POST /api/recommendations/feedback` - Submit feedback

### Therapy
- `GET /api/therapists` - List therapists
- `GET /api/therapists/nearby` - Location-based search
- `POST /api/therapists/generate-message` - AI greeting generation
- `GET/POST /api/appointments` - Appointment management
- `POST /api/appointments/cancel` - Cancel appointment
- `POST /api/appointments/cancellation-message` - Generate cancellation message

### Messaging
- `GET/POST /api/messages` - Send and retrieve messages
- `GET /api/messages/conversations` - List conversations

### Diagnostics
- `POST /api/diagnostics/share` - Generate diagnostics summary
- `GET /api/diagnostics/export` - Export user data

### AI
- `POST /api/mindful-bot` - Chat with AI companion

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Spotify
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# Foursquare
FOURSQUARE_API_KEY=your_foursquare_api_key
```

## Setup Instructions

### Prerequisites
- Node.js 18+ and pnpm
- PostgreSQL database (Supabase recommended)
- OpenAI API account
- Spotify Developer account (optional, for music recommendations)
- Foursquare Developer account (optional, for location-based recommendations)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/afelipfo/MindfulSpace.git
cd MindfulSpace
```

2. Install dependencies:
```bash
pnpm install
```

3. Configure environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

4. Set up the database:
```bash
# Run migrations in order (001 through 013)
# Execute scripts/*.sql in your Supabase SQL editor
```

5. Start the development server:
```bash
pnpm dev
```

6. Access the application at `http://localhost:3000`

## Database Migrations

Execute SQL scripts in numerical order:
1. `001_create_profiles.sql` - User profiles
2. `002_create_onboarding_data.sql` - Onboarding data
3. `003_create_mood_logs.sql` - Mood tracking
4. `004_create_wellness_goals.sql` - Wellness goals
5. `005_create_recommendations.sql` - Recommendations
6. `006_create_therapists.sql` - Therapist profiles
7. `007_create_messages.sql` - Messaging system
8. `008_create_appointments.sql` - Appointments
9. `009_create_audit_logs.sql` - Audit logging
10. `010_seed_therapists.sql` - Sample therapist data
11. `011_alter_profiles_add_settings.sql` - User settings
12. `012_alter_therapists_add_location.sql` - Location data
13. `013_fix_therapist_user_accounts.sql` - Account setup

## Development

### Running Tests
```bash
pnpm test
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

## MCP Server Integration

MindfulSpace includes Model Context Protocol (MCP) server configuration for integration with AI assistants like Claude Desktop. Access the configuration through the Settings page under "MCP Server".

## Security & Privacy

- End-to-end encryption for sensitive data
- Row-level security (RLS) policies on all database tables
- HIPAA-compliant data handling practices
- Configurable privacy levels (public, encrypted, anonymized)
- Audit logging for compliance tracking
- Secure credential management via environment variables

## Key Features Implementation

### Mood Tracking
Users can log daily mood, energy, and stress levels. The system provides:
- Interactive mood entry form with 1-10 scales
- Visual trend charts (line graphs)
- Mood heatmap calendar view
- Historical mood analysis

### Wellness Goals
Users define personal wellness objectives:
- AI-suggested goals based on onboarding data
- Custom goal creation
- Progress tracking
- Goal status management (active, completed, abandoned)

### AI Recommendations
The recommendation engine generates personalized suggestions:
- Music playlists via Spotify
- Podcasts on mental wellness
- Physical exercises and activities
- Local venues and resources via Foursquare
- Recommendation feedback loop for continuous improvement

### Therapist Matching
Intelligent therapist discovery:
- Filter by specialization, approach, location
- View credentials, experience, bio
- Check availability and insurance acceptance
- Generate personalized connection messages

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari 14+

## License

Proprietary - All rights reserved

## Contact

For questions or support, contact: afelipeflorezo@gmail.com

## Acknowledgments

Built with Next.js, Supabase, OpenAI, and the React ecosystem.
