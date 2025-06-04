# StreamFlix - Netflix-like Streaming Application

A React Native application for streaming web series with subscription management.

## Features

- User authentication and profile management
- Browse and discover web series content
- Video streaming with offline viewing
- Custom video player with playback controls
- Subscription management with private payment gateway
- Admin panel for content management

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- React Native development environment
- Android Studio / Xcode

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/streamflix.git
   cd streamflix
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn install
   ```

3. Start the Metro bundler:
   ```
   npx react-native start
   ```

4. Run the application:
   ```
   npx react-native run-android
   # or
   npx react-native run-ios
   ```

## Project Structure

```
streamflix/
├── src/
│   ├── api/                  # API service and endpoints
│   ├── assets/               # Images, fonts, and other static assets
│   ├── components/           # Reusable UI components
│   ├── navigation/           # Navigation configuration
│   ├── screens/              # Application screens
│   ├── services/             # Business logic services
│   ├── store/                # State management
│   ├── theme/                # UI theme and styling
│   └── utils/                # Utility functions
├── android/                  # Android project files
├── ios/                      # iOS project files
├── App.js                    # Application entry point
└── package.json              # Project dependencies
```

## Tech Stack

- React Native
- React Navigation
- Redux / Context API
- React Native Video
- Axios
- AsyncStorage
- Firebase / Custom Backend

## Backend Services

- Authentication
- Content Management
- Payment Processing
- Analytics

## Development Roadmap

See the `context.md` file for a detailed development roadmap and technical architecture.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 