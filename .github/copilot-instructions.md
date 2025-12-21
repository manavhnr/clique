# Clique React Native App - Development Guide

## Project Overview
React Native mobile application for Clique with:
- Expo framework with TypeScript
- NativeWind for styling (matching web version themes)
- SMS OTP authentication system
- React Navigation for app navigation
- Same features as Next.js web version:
  - Event hosting and discovery
  - Booking system
  - User management
  - Real-time notifications

## Project Requirements
- Platform: React Native with Expo SDK 54
- Language: TypeScript
- Styling: NativeWind (Tailwind CSS for React Native)
- Authentication: SMS OTP with demo mode
- Navigation: React Navigation v6 with tab and stack navigators
- State Management: Context API with Expo SecureStore
- Features: Event hosting, discovery, booking, user profiles

## Development Guidelines
- Use Expo managed workflow
- Maintain consistent styling with web version
- Implement responsive design for mobile screens
- Follow React Native best practices
- Ensure cross-platform compatibility (iOS/Android)
- Use TypeScript for all components and services
- Follow component-based architecture patterns

## Key Features
- SMS OTP authentication with secure storage
- Bottom tab navigation with conditional screens
- Dark theme with purple/gold accent colors
- Demo mode for development and testing
- Profile management with host capabilities
- Responsive mobile-first design

## Development Commands
- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS simulator  
- `npm run web` - Run in web browser
- `npx tsc --noEmit` - Type checking