
# Million Dollar eBooks - Technical Stack

## 🛠 Technical Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for responsive styling with Netflix-inspired designs
- **shadcn/ui** for consistent UI components
- **React Router** for navigation
- **React Query** for data fetching and state management
- **Recharts** for analytics visualizations

### Backend & Database
- **Supabase** for authentication, database, and real-time features
- **PostgreSQL** database with Row-Level Security (RLS)
- **Supabase Edge Functions** for serverless backend logic

### Key Libraries
- **Lucide React** for icons
- **React Hook Form** with Zod validation
- **Date-fns** for date manipulation
- **Next Themes** for dark/light mode

### External Integrations
- **Stripe** for payment processing
- **Google OAuth** for authentication
- **Google Docs API** for content import
- **Resend** for email notifications with verified domain (dollarebooks.app)

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── admin/           # Admin dashboard components
│   ├── analytics/       # Analytics and reporting
│   ├── auth/            # Authentication forms
│   ├── authors/         # Author discovery and profiles
│   ├── book/            # Book-related components
│   ├── books/           # Netflix-style book discovery components
│   ├── dashboard/       # User dashboards
│   ├── social/          # Social features (chat, gifts, friends)
│   ├── settings/        # User settings including notifications
│   ├── stories/         # Daily story competition components
│   └── ui/              # Base UI components (shadcn/ui)
├── hooks/               # Custom React hooks
├── pages/               # Route components
├── integrations/        # External service integrations
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
└── contexts/            # React contexts (Theme, etc.)
```

## 🗄 Database Schema

### Core Tables
- **profiles**: User information and roles
- **books**: Book metadata and content
- **categories/genres**: Content organization
- **purchases**: Transaction records
- **reviews**: User ratings and reviews
- **analytics_events**: Detailed user interaction tracking

### Story Competition System
- **daily_stories**: Story submissions with competition data
- **story_reactions**: User votes and reactions on stories
- **story_comments**: Community discussions on stories
- **story_bookmarks**: Reader saved stories

### Author Status System
- **Author qualification logic**: Tracks published books and completed story competitions
- **Time-based validation**: Ensures stories complete full voting cycles before granting author status

### Notification System
- **notification_preferences**: User email and app notification settings
- **favorite_authors**: Author following relationships for notifications

### Social Features
- **friends**: Friendship relationships
- **chat_conversations**: Private messaging
- **chat_messages**: Encrypted message content
- **book_gifts**: Gift transactions
- **thank_messages**: Gratitude expressions

### Moderation System
- **moderation_requests**: User requests to become moderators
- **content_flags**: Reported content for review

### Gamification
- **reading_progress**: Track reading advancement
- **author_progress**: Monitor writing achievements
- **author_achievements**: Achievement definitions

## 🔒 Security Features

- **Row-Level Security (RLS)**: Database-level access control
- **Encrypted Chat**: Messages encrypted before storage
- **Secure Payments**: PCI-compliant Stripe integration
- **OAuth Integration**: Secure Google authentication
- **Content Moderation**: Flagging system for inappropriate content
- **Authentication**: Secure JWT-based auth via Supabase
- **Email Security**: Verified domain for email sending (dollarebooks.app)
- **Competition Integrity**: Time-based validation for author status qualification

## 📧 Email System

- **Resend Integration**: Professional email delivery service
- **Verified Domain**: dollarebooks.app for trusted email sending
- **Template System**: HTML email templates for different notification types
- **Preference Respect**: All emails honor user notification preferences
- **Edge Function**: Serverless email sending via Supabase Edge Functions

## 📱 Responsive Design

The application is fully responsive and works seamlessly across:
- Desktop computers with Netflix-style carousels
- Tablets with optimized carousel interactions
- Mobile phones with touch-friendly navigation
- Various screen sizes and orientations

## 🎨 UI/UX Features (Enhanced v2.1.5)

- **Netflix-Style Interface**: Cinematic layouts with horizontal carousels and featured hero sections
- **Dual Card System**: Netflix-style cards for carousels, detailed cards for grid views
- **Frosty Translucent Effects**: Beautiful backdrop blur effects with white translucent overlays
- **Enhanced Visual Hierarchy**: Professional typography, improved contrast, and sophisticated spacing
- **Dark/Light Mode**: System preference detection with manual toggle
- **Accessibility**: ARIA labels and keyboard navigation
- **Loading States**: Skeleton screens and progress indicators
- **Error Handling**: User-friendly error messages
- **Notifications**: Toast notifications for user feedback
- **Analytics Visualizations**: Interactive charts and insights
- **Story Competition UI**: Voting interface, winner displays, and submission forms
- **Smooth Animations**: CSS transitions and hover effects throughout

## 📊 Analytics Features

- **Real-time Tracking**: Monitor user interactions as they happen
- **Comprehensive Metrics**: Views, downloads, reading time, completion rates
- **Device Analytics**: Understand how users access content
- **Export Functionality**: Generate detailed reports for external analysis
- **AI-Powered Insights**: Automated recommendations for content optimization
- **Story Performance**: Track voting patterns, engagement, and competition results
- **Netflix-Style Engagement**: Monitor carousel interactions and hero section performance

## 🔔 Notification Features

- **Multi-Channel**: Both email and in-app notifications
- **Granular Control**: Fine-grained user preferences
- **Real-time Delivery**: Instant in-app notifications
- **Email Templates**: Professional HTML email designs
- **Author Following**: Notification system for favorite authors
- **Respect Preferences**: All notifications honor user settings
- **Competition Updates**: Notifications for story submissions and results

## 🏆 Author Status & Discovery System

- **Qualification Engine**: Automated system to grant author status based on:
  - Published book approval
  - Completed daily story competition cycles (24-hour voting periods)
- **Discovery Algorithm**: Only qualified authors appear in author discovery
- **Time Validation**: Stories must complete full voting cycles before qualifying authors
- **Status Indicators**: Visual badges and metrics showing author achievements
- **Competition Tracking**: Monitor story performance and voting completion

## 🎬 Netflix-Style Components (v2.1.5)

### VirtualizedBookGrid System
- **Featured Hero Section**: Large, immersive display with gradient overlays
- **Horizontal Carousels**: Smooth-scrolling sections for different book categories
- **Netflix-Style Cards**: Simplified design showing photo, title, and author
- **Grid View Cards**: Detailed cards with frosty translucent effects
- **Navigation Controls**: Elegant arrow buttons for carousel navigation

### Component Architecture
- **Modular Design**: Separate components for different card types and layouts
- **Performance Optimized**: Efficient rendering for large book collections
- **Mobile Responsive**: Touch-friendly interactions and gesture support
- **Type Safety**: Comprehensive TypeScript definitions
- **Accessibility**: Screen reader support and keyboard navigation

### Animation System
- **Smooth Transitions**: CSS animations for hover states and interactions
- **Scale Effects**: Subtle zoom animations on hover
- **Backdrop Blur**: Modern glass-morphism effects
- **Loading States**: Skeleton screens for better perceived performance
