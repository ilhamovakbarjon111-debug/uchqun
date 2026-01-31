# Uchqun Mobile App - Build Guide

## APK Build uchun yo'riqnoma

### Talablar
- Node.js 18+ yoki 20+
- Expo CLI
- EAS CLI (Expo Application Services)
- Android Studio (APK test qilish uchun)

### 1. EAS CLI o'rnatish
```bash
npm install -g eas-cli
```

### 2. EAS ga kirish
```bash
eas login
```

### 3. EAS project sozlash (birinchi marta)
```bash
eas build:configure
```

### 4. APK build qilish

#### Preview/APK build:
```bash
cd mobile
eas build --platform android --profile preview
```

Bu `apk` formatida APK yaratadi va test qilish uchun yuklab olish mumkin.

#### Production build (App Bundle):
```bash
eas build --platform android --profile production
```

Bu Google Play Store uchun `aab` formatida yaratadi.

### 5. Build holatini kuzatish
```bash
eas build:list
```

### 6. Build ni yuklab olish
Build tugagach, EAS sizga link beradi. Shu linkdan APK yuklab olishingiz mumkin.

### Environment Variables

Build vaqtida quyidagi o'zgaruvchilar ishlatiladi:

- `EXPO_PUBLIC_API_URL` - Backend API URL (default: https://uchqun-production.up.railway.app/api)
- `EXPO_PUBLIC_WEB_URL` - Web app URL (default: https://uchqun-one.vercel.app)

Bu o'zgaruvchilar `eas.json` faylida sozlangan.

### Role-based Navigation

Ilova foydalanuvchi role'iga qarab to'g'ri sahifaga yo'naltiradi:

- **Parent** → `/` (Dashboard)
- **Teacher** → `/teacher` (Teacher Dashboard)
- **Admin** → `/teacher` (Teacher Dashboard)
- **Reception** → `/teacher` (Teacher Dashboard)

### APK Testing

1. Build tugagach, APK yuklab oling
2. Android telefon/emulator'ga o'tkazing
3. "Noma'lum manbalardan o'rnatish" ni ruxsat bering
4. APK'ni o'rnating va test qiling

### Troubleshooting

- Agar build xatolik bersa, `eas.json` dagi URL'larni tekshiring
- Environment variables to'g'ri o'rnatilganligini tekshiring
- Network sozlamalarini tekshiring
