# Progress Counter App

A mobile app for tracking events with countdown timers, time-since tracking, and stopwatch functionality. Built with React Native and Expo.

## Features

### ✅ Core Features
- **Add Events**: Create events with custom titles, dates, and types
- **Timer**: Stopwatch functionality with start/pause controls
- **Countdown**: Countdown to future events with real-time updates
- **Time Since**: Track how much time has passed since a specific date
- **Tags**: Organize events with custom tags and colors
- **Calendar Sync**: Sync events to your device calendar
- **Reminders**: Set notifications for countdown events
- **Real-time Updates**: Live time displays that update every second

### 📱 Platform Support
- iOS
- Android
- Web (limited functionality)

## Getting Started

### Prerequisites
- Node.js (v18 or later)
- npm or yarn
- Expo CLI (optional, but recommended)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npx expo start
   ```

3. Run on your preferred platform:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your device

## App Structure

```
src/
  ├── components/       # Reusable UI components
  │   ├── EventsCard.tsx
  │   └── TagChip.tsx
  ├── models/          # TypeScript interfaces
  │   ├── Event.ts
  │   └── Tag.ts
  ├── screens/         # Screen components
  │   ├── HomeScreen.tsx
  │   ├── AddEventScreen.tsx
  │   └── EventDetailScreen.tsx
  ├── storage/         # Data persistence
  │   └── db.ts
  └── utils/           # Utility functions
      ├── time.ts
      ├── calendar.ts
      └── notifications.ts
```

## Features in Detail

### Event Types

1. **Countdown**: Counts down to a future date/time
   - Shows days, hours, minutes, and seconds remaining
   - Can set reminders
   - Can sync to calendar

2. **Time Since**: Tracks elapsed time from a past date
   - Shows days, hours, and minutes since the event
   - Useful for tracking milestones

3. **Timer**: Stopwatch functionality
   - Start/pause controls
   - Tracks elapsed time from when started
   - Resets reference date when paused/resumed

### Tags
- Create custom tags with names and colors
- Assign multiple tags to events
- Organize and filter events by tags

### Calendar Integration
- Sync events to your device's default calendar
- Events appear in your calendar app
- Automatic reminders for countdown events

### Notifications
- Set reminders for countdown events
- Notifications appear 15 minutes before the event
- Requires notification permissions

## Widget Support

Widget support requires native code implementation. To add widget support:

### iOS Widgets
1. Create a Widget Extension in Xcode
2. Use WidgetKit to display event information
3. Configure app groups for data sharing

### Android Widgets
1. Create an App Widget Provider
2. Implement widget layout XML
3. Update widget data using AppWidgetManager

**Note**: Widget implementation is not included in this codebase as it requires native code. The app is structured to support widget integration in the future.

## Permissions

The app requires the following permissions:

- **Calendar**: To sync events to your calendar
- **Notifications**: To send reminder notifications

Permissions are requested when you first use the related features.

## Development

### Project Structure
- Uses Expo Router for file-based routing
- TypeScript for type safety
- AsyncStorage for local data persistence
- Expo Calendar and Notifications for platform integrations

### Key Dependencies
- `expo-router`: File-based routing
- `@react-native-async-storage/async-storage`: Local storage
- `expo-calendar`: Calendar integration
- `expo-notifications`: Push notifications
- `dayjs`: Date/time manipulation
- `uuid`: Unique ID generation

## Building for Production

1. Configure app.json with your app details
2. Build for iOS:
   ```bash
   eas build --platform ios
   ```
3. Build for Android:
   ```bash
   eas build --platform android
   ```

## Future Enhancements

- [ ] Widget support (iOS & Android)
- [ ] Event editing functionality
- [ ] Event filtering and search
- [ ] Multiple calendar support
- [ ] Recurring events
- [ ] Export/import events
- [ ] Cloud sync
- [ ] Dark mode improvements

## License

This project is private and proprietary.
