# APK yig‘ish (lokal)

Ilova APK faylini kompyuteringizda yig‘ish uchun quyidagi qadamlarni bajarishingiz mumkin.

## Talablar

- **Node.js** (loyihada ishlatiladigan versiya)
- **Java JDK 17** (Android build uchun) — [Adoptium](https://adoptium.net/) yoki Oracle JDK
- **Android SDK** (agar `ANDROID_HOME` o‘rnatilgan bo‘lsa, Gradle o‘zi kerakli qismlarni yuklab oladi)

## 1-usul: NPM script orqali

```bash
cd mobile
npm run build:apk
```

Birinchi marta ishga tushganda Gradle va barcha dependency’lar yuklanadi (10–20 daqiqa vaqt olishi mumkin). Keyingi build’lar tezroq bo‘ladi.

## 2-usul: Qo‘lda

```bash
cd mobile

# Agar android papkasi yo‘q bo‘lsa, avval prebuild:
npm run prebuild:android

# APK yig‘ish (Windows):
cd android
.\gradlew.bat assembleRelease

# Yoki macOS/Linux da:
# ./gradlew assembleRelease
```

## APK fayl joyi

Build muvaffaqiyatli tugagach, APK fayl shu joyda bo‘ladi:

- **Windows/macOS/Linux:**  
  `mobile/android/app/build/outputs/apk/release/app-release.apk`

Ushbu faylni telefonga o‘tkazing yoki kerakli joyga nusxalang.

## EAS Build (bulut)

Agar Expo hisobingizda loyiha ochilgan bo‘lsa, bulutda APK yig‘ish:

```bash
cd mobile
npx eas-cli login
npx eas-cli build --platform android --profile preview
```

`preview` profili APK beradi. Build tugagach, Expo dashboard’dan APK’ni yuklab olasiz.
