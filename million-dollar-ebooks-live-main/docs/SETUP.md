
# Million Dollar eBooks - Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git for version control
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/million-dollar-ebooks.git
cd million-dollar-ebooks

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see your app running!

## 🏗️ Project Structure

```
million-dollar-ebooks/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── auth/            # Authentication components
│   │   ├── onboarding/      # User onboarding flows
│   │   ├── chat/            # Chat system components
│   │   ├── dashboard/       # Dashboard components
│   │   └── ui/              # Base UI components (shadcn/ui)
│   ├── hooks/               # Custom React hooks
│   ├── pages/               # Page components and routing
│   ├── contexts/            # React contexts (theme, auth)
│   ├── integrations/        # External service integrations
│   ├── utils/               # Utility functions
│   └── types/               # TypeScript type definitions
├── docs/                    # Documentation files
├── supabase/               # Supabase configuration and functions
├── public/                 # Static assets
└── store-assets/           # App store marketing materials
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Development-specific settings
VITE_DEV_MODE=true
```

### Supabase Setup

1. **Create Supabase Project**
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Initialize Supabase
   supabase init
   
   # Link to your project
   supabase link --project-ref your-project-ref
   ```

2. **Database Migration**
   ```bash
   # Apply database migrations
   supabase db push
   
   # Verify tables are created
   supabase db diff
   ```

3. **Configure Authentication**
   - Enable email authentication in Supabase dashboard
   - Set up Google OAuth (optional)
   - Configure RLS policies

## 📱 Development Workflow

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run preview         # Preview production build
npm run lint            # Run ESLint
npm run type-check      # TypeScript type checking

# Mobile Development
npm run build:mobile    # Build for mobile deployment
npm run cap:sync        # Sync with Capacitor
npm run cap:android     # Open in Android Studio
npm run cap:ios         # Open in Xcode (macOS only)

# Database
npm run db:generate     # Generate Supabase types
npm run db:push         # Push schema changes
npm run db:reset        # Reset database
```

### Code Style

We use ESLint and Prettier for code formatting:

```bash
# Check code style
npm run lint

# Auto-fix style issues
npm run lint:fix

# Format with Prettier
npm run format
```

## 🛠️ Development Guidelines

### Component Creation

#### Creating New Components
```typescript
// Use this template for new components
import React from 'react';
import { cn } from '@/lib/utils';

interface ComponentNameProps {
  className?: string;
  // Add your props here
}

export function ComponentName({ className, ...props }: ComponentNameProps) {
  return (
    <div className={cn("base-styles", className)}>
      {/* Component content */}
    </div>
  );
}
```

#### File Naming Conventions
- Components: `PascalCase.tsx` (e.g., `BookCard.tsx`)
- Hooks: `camelCase.ts` with `use` prefix (e.g., `useBookData.ts`)
- Utilities: `camelCase.ts` (e.g., `formatDate.ts`)
- Pages: `PascalCase.tsx` (e.g., `Dashboard.tsx`)

### State Management

#### Using Custom Hooks
```typescript
// Custom hooks for data fetching
const { books, isLoading, error } = useBooks();
const { user, signIn, signOut } = useAuth();
const { sendMessage, messages } = useChat();
```

#### Context Usage
```typescript
// Theme context
const { theme, toggleTheme } = useTheme();

// Auth context  
const { user, profile, loading } = useAuth();
```

### Styling Guidelines

#### Tailwind CSS Best Practices
- Use responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`
- Prefer utility classes over custom CSS
- Use the `cn()` utility for conditional classes
- Follow the design system color palette

#### Component Styling Example
```typescript
<div className={cn(
  "base-styles here",
  "responsive:styles",
  "dark:dark-mode-styles",
  condition && "conditional-styles",
  className
)}>
```

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests
```typescript
// Component testing example
import { render, screen } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

## 🚢 Deployment

### Production Build
```bash
# Create production build
npm run build

# Test production build locally
npm run preview
```

### Deployment Platforms

#### Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

#### Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

#### Self-Hosted
```bash
# Build the app
npm run build

# Serve the dist folder with any static file server
# Example with serve:
npx serve dist
```

### Environment Configuration

#### Production Environment Variables
```env
# Production Supabase
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key

# Analytics (optional)
VITE_ANALYTICS_ID=your_analytics_id

# Performance monitoring
VITE_MONITORING_DSN=your_monitoring_dsn
```

## 📱 Mobile Development

### Capacitor Setup
```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli

# Initialize Capacitor
npx cap init

# Add platforms
npx cap add android
npx cap add ios
```

### Building for Mobile
```bash
# Build web assets
npm run build

# Sync with native projects
npx cap sync

# Open in native IDEs
npx cap open android
npx cap open ios
```

### Mobile Testing
```bash
# Run on device
npx cap run android
npx cap run ios

# Live reload during development
npx cap run android --livereload --external
npx cap run ios --livereload --external
```

## 🔧 Troubleshooting

### Common Issues

#### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build cache
rm -rf dist .vite
npm run build
```

#### TypeScript Errors
```bash
# Generate fresh Supabase types
npm run db:generate

# Check for type errors
npm run type-check
```

#### Development Server Issues
```bash
# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

### Getting Help

#### Documentation
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Supabase Documentation](https://supabase.com/docs)

#### Community Support
- GitHub Issues: Report bugs and feature requests
- Discord Community: Get help from other developers
- Stack Overflow: Technical questions with `million-dollar-ebooks` tag

#### Development Team
- Email: dev@dollarebooks.app
- Response time: 24-48 hours
- Include error logs and reproduction steps

---

## 🎯 Next Steps

1. **Complete Supabase Setup**: Follow the database setup guide
2. **Run the Development Server**: Start coding with `npm run dev`
3. **Explore the Codebase**: Check out the components and hooks
4. **Read the Features Guide**: Understand what the app can do
5. **Start Contributing**: Pick up an issue or add a new feature

Welcome to the Million Dollar eBooks development team! 🚀
