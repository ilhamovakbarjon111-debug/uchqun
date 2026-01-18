# Uchqun Mobile App

React Native (Expo) ilovasi - Teacher va Parent uchun ideal mobil ilova.

## Struktura

- **Clean Architecture** - Toza kod strukturasu
- **Role-based Navigation** - Teacher/Parent uchun alohida routing
- **WebView Integration** - Web ilova bilan perfect sync
- **Modern UI** - Zamonaviy dizayn

## Features

- ✅ Teacher va Parent uchun bitta login
- ✅ Role-based routing (Teacher → `/teacher`, Parent → `/`)
- ✅ Perfect localStorage synchronization
- ✅ Camera permission support (scanner uchun)
- ✅ Auto token refresh
- ✅ Error handling va loading states

## Development

### Talablar

- Node.js 18+ yoki 20+
- Expo CLI
- Android Studio (APK test qilish uchun)

### Ishga Tushirish

```bash
cd mobile
npm install
npm start
```

Yoki tunnel mode (real device uchun):
```bash
npx expo start --tunnel
```

Expo Go ilovasida QR kodni scan qiling.

### Environment Variables

`.env` fayl yarating (`mobile/.env`):

```env
EXPO_PUBLIC_API_URL=https://uchqun-production.up.railway.app/api
EXPO_PUBLIC_WEB_URL=https://uchqun-platform.netlify.app
```

## Build (APK/AAB)

EAS build uchun `BUILD_GUIDE.md` faylini qarang.

### APK Build

```bash
cd mobile
eas build --platform android --profile preview
```

### Production Build (AAB)

```bash
cd mobile
eas build --platform android --profile production
```

## Struktura

```
mobile/
├── src/
│   ├── context/
│   │   └── AuthContext.js       # Authentication context
│   ├── navigation/
│   │   └── RootNavigator.js     # Root navigation
│   ├── screens/
│   │   ├── LoginScreen.js       # Login screen
│   │   ├── WebAppScreen.js      # WebView screen
│   │   └── LoadingScreen.js     # Loading screen
│   ├── services/
│   │   └── api.js               # API service
│   ├── storage/
│   │   └── authStorage.js       # AsyncStorage wrapper
│   └── config.js                # Configuration
├── App.js                       # Main app component
└── package.json
```

## Qo'llab-quvvatlash

Muammolar uchun `EXPO_GO_FIX.md` faylini qarang.