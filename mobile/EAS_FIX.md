# EAS Build Muammosi - Hal Qilish

## Muammo
```
You don't have the required permissions to perform this operation.
Entity not authorized: AppEntity[3564d21e-75a3-4401-8b9d-932b25b0c9ab]
```

Bu degani, loyiha boshqa hisobga (`owl_wilde`) tegishli.

## Yechimlar

### 1-usul: Owner'ni o'zgartirish (Agar `owl_wilde` sizning hisobingiz bo'lsa)

1. `owl_wilde` hisobiga kirish:
```bash
eas logout
eas login
# owl_wilde hisobiga kirish
```

2. Keyin build qilish:
```bash
eas build --platform android --profile preview
```

### 2-usul: Yangi Project ID yaratish (Tavsiya etiladi)

1. `app.json` faylida `owner` va `projectId` ni o'zgartirish:
   - `owner`: `akbarjon_ilhamov` (yoki sizning Expo username'ingiz)
   - `eas.projectId`: yangi ID yaratish kerak

2. Yangi project yaratish:
```bash
eas init
```

Bu buyruq yangi project ID yaratadi va `app.json` ga qo'shadi.

3. Keyin build qilish:
```bash
eas build --platform android --profile preview
```

### 3-usul: Lokal Build (EAS kerak emas)

Agar EAS ishlamasa, lokal build ishlatish mumkin:

```bash
cd mobile
npm run build:apk
```

APK fayl: `mobile/android/app/build/outputs/apk/release/app-release.apk`
