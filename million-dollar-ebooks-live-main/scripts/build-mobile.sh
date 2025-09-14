
#!/bin/bash

echo "🚀 Building Million Dollar eBooks for mobile platforms..."

# Build the web app
echo "📦 Building web application..."
npm run build

# Check if Capacitor is initialized
if [ ! -f "capacitor.config.ts" ]; then
    echo "⚙️ Initializing Capacitor..."
    npx cap init
fi

# Add platforms if they don't exist
if [ ! -d "android" ]; then
    echo "🤖 Adding Android platform..."
    npx cap add android
fi

if [ ! -d "ios" ]; then
    echo "🍎 Adding iOS platform..."
    npx cap add ios
fi

# Sync with native platforms
echo "🔄 Syncing with native platforms..."
npx cap sync

echo "✅ Mobile build completed successfully!"
echo ""
echo "📱 Next steps:"
echo "Android: Run 'npx cap open android' to open in Android Studio"
echo "iOS: Run 'npx cap open ios' to open in Xcode (macOS only)"
echo ""
echo "📖 For detailed mobile development guide, visit:"
echo "https://lovable.dev/blogs/mobile-development-guide"
