# Money Tracker - Weekly Expense Tracking App

A React Native app built with Expo for tracking weekly expenses on iOS. The app automatically resets every Monday and helps you stay within your weekly spending limit.

## Features

- ✅ Set weekly spending limit during onboarding
- ✅ Add expenses with categories (Food, Transport, Shopping, Entertainment, Bills, Health, Other)
- ✅ Automatic weekly reset every Monday
- ✅ View past weeks with date ranges
- ✅ Detailed week view with pie chart showing spending by category
- ✅ Settings page to update weekly limit
- ✅ Real-time budget tracking with progress bar

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your iPhone (for development) OR EAS Build account (for production builds)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the Expo development server:
```bash
npm start
```

3. Scan the QR code with the Expo Go app on your iPhone, or press `i` to open in iOS Simulator.

## Building for iPhone

### Option 1: Using Expo Go (Free - Development)
- Install Expo Go from the App Store
- Run `npm start` and scan the QR code
- This is perfect for testing during development

### Option 2: Using EAS Build (Free tier available)
1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Login to your Expo account:
```bash
eas login
```

3. Configure the project:
```bash
eas build:configure
```

4. Build for iOS:
```bash
eas build --platform ios
```

5. Follow the prompts to build. You can build for development or production.

## Project Structure

```
money-tracking/
├── App.js                 # Main app component with navigation
├── screens/
│   ├── OnboardingScreen.js    # Initial setup screen
│   ├── HomeScreen.js          # Add expenses screen
│   ├── OverviewScreen.js      # List of all weeks
│   ├── WeekDetailScreen.js    # Week details with pie chart
│   └── SettingsScreen.js      # Update weekly limit
├── utils/
│   └── storage.js         # Data persistence and week management
└── package.json
```

## How It Works

- **Weekly Reset**: The app automatically detects when a new week starts (Monday) and archives the previous week's expenses
- **Data Storage**: All data is stored locally using AsyncStorage
- **Categories**: Expenses can be categorized into 7 predefined categories
- **Budget Tracking**: Real-time tracking of spending against weekly limit with visual progress bar

## Notes

- All data is stored locally on your device
- The app resets expenses every Monday at midnight
- Past weeks are archived and can be viewed in the Overview screen
- Weekly limit can be updated anytime in Settings

