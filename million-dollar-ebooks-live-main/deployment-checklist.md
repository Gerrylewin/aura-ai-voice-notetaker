
# Mobile App Deployment Checklist

## Pre-Deployment Setup ✅

### 1. Install Required Dependencies
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
```

### 2. Initialize Capacitor
```bash
npx cap init
```

### 3. Build and Sync
```bash
npm run build
npx cap sync
```

## Android Deployment 🤖

### 1. Add Android Platform
```bash
npx cap add android
```

### 2. Generate App Icons
- Create icon files in: `android/app/src/main/res/`
- Sizes needed: 48x48, 72x72, 96x96, 144x144, 192x192, 512x512

### 3. Generate Splash Screens
- Create splash files in: `android/app/src/main/res/drawable/`
- Multiple density folders: hdpi, mdpi, xhdpi, xxhdpi, xxxhdpi

### 4. Configure App Signing
- Generate keystore: `keytool -genkey -v -keystore my-upload-key.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias`
- Update `android/app/build.gradle` with signing config

### 5. Build Release APK
```bash
npx cap open android
# In Android Studio: Build → Generate Signed Bundle/APK
```

### 6. Google Play Console
- Upload APK/AAB to Google Play Console
- Fill out store listing with provided descriptions
- Set up pricing and distribution
- Submit for review

## iOS Deployment 🍎

### 1. Add iOS Platform (macOS only)
```bash
npx cap add ios
```

### 2. Configure Xcode Project
```bash
npx cap open ios
```

### 3. App Icons and Launch Images
- Use Xcode's App Icon & Launch Image slots
- Generate all required sizes automatically

### 4. Apple Developer Account Setup
- Ensure you have Apple Developer Program membership ($99/year)
- Configure Bundle ID: `app.lovable.b955570b335046b69c6c77fba61a9c56`
- Set up provisioning profiles

### 5. Build and Archive
- In Xcode: Product → Archive
- Upload to App Store Connect

### 6. App Store Connect
- Fill out app information
- Upload screenshots for all device sizes
- Set pricing and availability
- Submit for review

## Required Assets 📱

### App Icons (Both Platforms)
- Android: Various sizes in res/mipmap folders
- iOS: App Icon set in Assets.xcassets

### Splash Screens
- Android: splash.xml drawable
- iOS: LaunchScreen.storyboard

### Screenshots (Store Listings)
- Phone screenshots: 6.5" and 5.5" displays
- Tablet screenshots: 12.9" and 11" displays
- Highlight key features in screenshots

### Store Metadata
- App name: "Million Dollar eBooks"
- Description: Use provided store description
- Keywords: books, reading, writing, ebooks
- Category: Books/Entertainment
- Age rating: 4+ (All Ages)

## Final Steps 🚀

1. **Test on Real Devices**: Always test on physical devices before submission
2. **Review Guidelines**: Ensure compliance with both Google Play and App Store guidelines
3. **Privacy Policy**: Ensure privacy policy is accessible and compliant
4. **Terms of Service**: Update terms for mobile app usage
5. **Support Contact**: Provide valid support email/website

## Post-Launch 📈

1. **Monitor Reviews**: Respond to user feedback promptly
2. **Analytics**: Set up app analytics to track usage
3. **Updates**: Regular updates improve store rankings
4. **Marketing**: Promote your app across social channels

---

**Need Help?** Refer to the official Capacitor documentation: https://capacitorjs.com/docs
