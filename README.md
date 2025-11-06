# HYN React Native App

## 🎉 Host Your Night - Mobile Edition

React Native mobile application for HYN (Host Your Night) platform, built with Expo and TypeScript. Experience seamless event hosting and discovery on your mobile device with the same powerful features as the web version.

## ✨ Features

### 🔐 **Authentication**
- SMS OTP-based authentication
- Secure user session management with Expo SecureStore
- Demo mode with console-based OTP for development

### 🎨 **Design & Styling**
- **NativeWind** (Tailwind CSS for React Native)
- **Same visual identity** as web version
- **Purple & Gold theme** (#8B5CF6, #F59E0B)
- **Dark gradient backgrounds**
- **Responsive mobile design**

### 🧭 **Navigation**
- **React Navigation v6** with stack and tab navigators
- **Bottom tab navigation** for main screens
- **Conditional navigation** based on user type (host/user)
- **Deep linking ready**

### 📱 **Core Screens**
- **Home** - Dashboard with quick actions and featured events
- **Discover** - Event discovery and search (coming soon)
- **Host** - Event creation for hosts (coming soon)
- **Dashboard** - User's events and bookings (coming soon)
- **Profile** - Account management and settings

### 🏗️ **Architecture**
- **Context API** for state management
- **TypeScript** for type safety
- **Modular service layer**
- **Reusable components**
- **Secure storage** for user data

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ and npm
- **Expo CLI** (installed globally)
- **Expo Go app** on your mobile device
- **iOS Simulator** or **Android Emulator** (optional)

### Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Start development server**:
```bash
npm start
# or
npx expo start
```

3. **Run on device/simulator**:
   - **Expo Go**: Scan QR code with Expo Go app
   - **iOS Simulator**: Press `i` in terminal
   - **Android Emulator**: Press `a` in terminal
   - **Web**: Press `w` in terminal

## 📁 Project Structure

```
src/
├── contexts/           # React contexts (Auth, etc.)
│   └── AuthContext.tsx
├── navigation/         # Navigation configuration
│   └── AppNavigator.tsx
├── screens/           # Screen components
│   ├── LoginScreen.tsx
│   ├── HomeScreen.tsx
│   ├── DiscoverScreen.tsx
│   ├── HostScreen.tsx
│   ├── DashboardScreen.tsx
│   └── ProfileScreen.tsx
├── services/          # API and business logic
│   └── authService.tsx
├── types/             # TypeScript type definitions
│   └── auth.ts
└── components/        # Reusable UI components (planned)
```

## 🔧 Development

### Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run web` - Run in web browser
- `npx tsc --noEmit` - Type check without compilation

### Development Features

- **Hot reloading** for instant updates
- **TypeScript** error checking
- **Console-based OTP** in demo mode
- **Secure storage** persistence
- **Metro bundler** with React Native fast refresh

## 🎯 Demo Mode

The app runs in **demo mode** by default:

1. **Login** with any phone number
2. **Check console** for OTP code
3. **Enter OTP** to authenticate
4. **Explore** the app features

### Demo OTP Flow
```
Enter phone: +1234567890
Console: 🔐 Demo Mode OTP for +1234567890: 123456
Enter OTP: 123456
✅ Authenticated successfully
```

## 🔗 Relation to Web Version

This React Native app mirrors the Next.js web application:

### **Shared Features**
- ✅ Same authentication system (SMS OTP)
- ✅ Identical branding and color scheme
- ✅ User and host role management
- ✅ Event-focused user experience

### **Mobile-Optimized**
- 📱 Touch-friendly interface
- 📱 Bottom tab navigation
- 📱 Mobile-specific gestures
- 📱 Native mobile components

### **Architecture Alignment**
- 🏗️ Context-based state management
- 🏗️ Service layer pattern
- 🏗️ TypeScript throughout
- 🏗️ Component-based architecture

## 🛣️ Roadmap

### **Phase 1** (Current)
- ✅ Authentication system
- ✅ Navigation structure
- ✅ Basic screens and UI
- ✅ Demo mode functionality

### **Phase 2** (Next)
- 🔲 Event discovery and search
- 🔲 Event creation for hosts
- 🔲 Booking system
- 🔲 QR code generation

### **Phase 3** (Future)
- 🔲 Real-time notifications
- 🔲 Payment integration
- 🔲 Social features
- 🔲 Advanced host tools

## 📦 Tech Stack

- **React Native** 0.74+ with Expo SDK 54
- **TypeScript** for type safety
- **React Navigation** v6 for navigation
- **NativeWind** for styling (Tailwind CSS)
- **Expo SecureStore** for secure data persistence
- **Expo Linear Gradient** for backgrounds
- **Expo Vector Icons** for UI icons

## 🔐 Security

- **Secure storage** with Expo SecureStore
- **OTP-based authentication**
- **Session management**
- **Type-safe API calls**

## 🎨 Design System

### **Colors**
- Primary: `#8B5CF6` (Purple)
- Accent: `#F59E0B` (Gold)
- Background: `#0F0F23` (Dark)
- Panel: `#1A1A2E` (Panel)
- Muted: `#94A3B8` (Text)

### **Typography**
- Font: System default (Inter preferred)
- Weights: 400, 500, 600, 700
- Responsive sizing

### **Components**
- Gradient backgrounds
- Rounded corners (12px)
- Purple borders and accents
- Consistent spacing (16px, 24px)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

## 📄 License

This project is part of the HYN platform. All rights reserved.

---

**Built with ❤️ using React Native & Expo**

*Ready to host your night? Download and start exploring!* 🎉