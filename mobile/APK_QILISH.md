# APK Yaratish - Qisqa Qo'llanma

## Eng Oson Usul: EAS Build (Tavsiya etiladi) ☁️

Bu usul bulutda APK yaratadi, kompyuteringizda Android Studio kerak emas.

### 1. EAS CLI o'rnatish
```bash
npm install -g eas-cli
```

### 2. EAS ga kirish
```bash
cd mobile
eas login
```
Agar hisobingiz yo'q bo'lsa, avval [expo.dev](https://expo.dev) da ro'yxatdan o'ting.

### 3. APK yaratish
```bash
eas build --platform android --profile preview
```

Bu buyruq:
- Bulutda APK yaratadi
- 15-30 daqiqa vaqt olishi mumkin
- Tugagach, sizga link beradi
- Shu linkdan APK yuklab olasiz

### 4. APK yuklab olish
Build tugagach, terminalda link ko'rsatiladi. Yoki:
```bash
eas build:list
```
Bu buyruq barcha build'larni ko'rsatadi.

---

## Lokal Usul (Kompyuteringizda) 💻

Agar kompyuteringizda APK yaratmoqchi bo'lsangiz:

### Talablar:
- **Java JDK 17** - [Yuklab olish](https://adoptium.net/)
- **Android SDK** (ixtiyoriy, Gradle o'zi yuklab oladi)

### Qadamlar:

#### 1. Android papkasini yaratish (birinchi marta)
```bash
cd mobile
npm run prebuild:android
```

#### 2. APK yaratish
```bash
npm run build:apk
```

Yoki qo'lda:
```bash
cd mobile/android
.\gradlew.bat assembleRelease
```

### APK fayl joyi:
```
mobile/android/app/build/outputs/apk/release/app-release.apk
```

---

## Qaysi Usulni Tanlash?

### EAS Build (Bulut) - Tavsiya etiladi ✅
- ✅ Oson va tez
- ✅ Android Studio kerak emas
- ✅ Har qanday kompyuterdan ishlaydi
- ❌ Internet kerak
- ❌ Expo hisob kerak

### Lokal Build
- ✅ Internet kerak emas (build'dan keyin)
- ✅ Xususiy build
- ❌ Java JDK va Android SDK kerak
- ❌ Birinchi marta uzoq vaqt olishi mumkin

---

## Muammo bo'lsa?

1. **EAS login xatosi**: `eas login` qayta urinib ko'ring
2. **Build xatosi**: `eas.json` faylini tekshiring
3. **Lokal build xatosi**: Java JDK 17 o'rnatilganligini tekshiring

---

## Production Build (Google Play Store uchun)

Agar Google Play Store'ga yuklamoqchi bo'lsangiz:

```bash
eas build --platform android --profile production
```

Bu `.aab` (Android App Bundle) formatida yaratadi, bu Google Play Store uchun kerak.
