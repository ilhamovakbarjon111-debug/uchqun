# Uchqun Mobile (Android) — React Native (Expo)

Bu mobil ilova **bitta login** bilan foydalanuvchi roli bo‘yicha:

- `parent` → web’dagi **Parent panel** (`/`)
- `teacher`/`admin` → web’dagi **Teacher panel** (`/teacher`)

### Muhim sozlama (WEB URL)

Mobil ilova web panelni `WebView` orqali ochadi. Shuning uchun teacher web frontend’ning URL’i kerak bo‘ladi.

- **Android emulator (local dev)**: `http://10.0.2.2:5174`
- **Real device**: PC LAN IP (masalan `http://192.168.x.x:5174`) yoki Railway/Vercel’da deploy qilingan URL

### Environment variables

`.env` fayl yarating (`mobile/.env`):

```env
EXPO_PUBLIC_API_URL=https://uchqun-production-4f83.up.railway.app/api
EXPO_PUBLIC_WEB_URL=https://uchqun-platform.vercel.app
```

### Run

```bash
cd mobile
npm run android
```

## Build (APK/AAB) — EAS

Expo Go test uchun yaxshi, lekin real ilova (.apk/.aab) uchun EAS build kerak bo‘ladi.

### 1) EAS login

```bash
npx eas-cli login
```

### 2) APK (internal test)

```bash
cd mobile
npx eas-cli build -p android --profile preview
```

### 3) Play Store uchun AAB

```bash
cd mobile
npx eas-cli build -p android --profile production
```

### Android package nomi

`mobile/app.json` ichida hozircha:
- `android.package`: `com.uchqun.platform`

Agar boshqa package xohlasangiz ayting — almashtirib beraman (Play Store’da unique bo‘lishi kerak).

