# Expo Go - Muammolarni Hal Qilish

## Muammolar

### 1. "404: NOT_FOUND" yoki "DEPLOYMENT_NOT_FOUND" xatosi
### 2. Loading/Downloading holatida to'xtab qolish
### 3. 100% Bundling bo'lgandan keyin ochilmayapti (Oq ekran)

## Yechimlar

### 1. Development Server'ni Ishga Tushirish

Mobile papkasiga kiring va development server'ni ishga tushiring:

```bash
cd mobile
npm start
```

Yoki:

```bash
cd mobile
npx expo start
```

### 2. Tunnel Mode (Real Device uchun)

Agar real device'da test qilayotgan bo'lsangiz va bir xil Wi-Fi'da emas bo'lsangiz:

```bash
cd mobile
npx expo start --tunnel
```

Bu ngrok tunnel orqali ishlaydi va har qanday internet orqali ulanish mumkin.

### 3. QR Kodni Qayta Scan Qilish

1. Terminal'da `npm start` yoki `npx expo start` ni ishga tushiring
2. Terminal'da QR kod paydo bo'ladi
3. Expo Go ilovasida "Scan QR Code" tugmasini bosing
4. Yangi QR kodni scan qiling

### 4. Expo Go Ilovasini Yangilash

Agar QR kod ishlamasa:
1. Expo Go ilovasini to'liq yoping (close all apps)
2. Ilovani qayta oching
3. QR kodni qayta scan qiling

### 5. Network Muammosi

Agar Wi-Fi muammosi bo'lsa:
- Telefon va kompyuter bir xil Wi-Fi tarmog'ida bo'lishi kerak
- Yoki tunnel mode ishlating: `npx expo start --tunnel`

### 6. Loading/Downloading Muammosi (To'xtab Qolish)

Agar QR kodni scan qilgandan keyin faqat "Loading" yoki "Downloading" holatida qolib ketsa:

#### Yechim 1: Cache'ni Tozalash

```bash
cd mobile
# Metro bundler cache'ni tozalash
npx expo start --clear
```

#### Yechim 2: Node Modules'ni Qayta O'rnatish

```bash
cd mobile
# node_modules va package-lock.json ni o'chirish
rm -rf node_modules package-lock.json
# npm cache'ni tozalash
npm cache clean --force
# Dependencies'ni qayta o'rnatish
npm install
# Server'ni qayta ishga tushirish
npm start
```

#### Yechim 3: Metro Bundler Port'ini Tekshirish

Agar port band bo'lsa, boshqa port ishlating:

```bash
cd mobile
npx expo start --port 8082
```

#### Yechim 4: Tunnel Mode Ishlatish

Agar network muammosi bo'lsa, tunnel mode ishlating:

```bash
cd mobile
npx expo start --tunnel
```

#### Yechim 5: Expo Go Ilovasini Yangilash

1. Expo Go ilovasini Play Store'dan yangilang
2. Ilovani to'liq yoping (Force Stop)
3. Cache'ni tozalang (Settings > Apps > Expo Go > Storage > Clear Cache)
4. Ilovani qayta oching va QR kodni qayta scan qiling

#### Yechim 6: Network Tekshirish

- Telefon va kompyuter bir xil Wi-Fi tarmog'ida bo'lishi kerak
- Firewall Metro bundler port'ini (8081) bloklamasligi kerak
- Antivirus Metro bundler'ni bloklamasligi kerak

#### Yechim 7: Terminal'da Xatolarni Tekshirish

Terminal'da quyidagi xatolarni tekshiring:
- "Error: Cannot find module" → `npm install` qiling
- "Port 8081 is already in use" → Port'ni o'zgartiring yoki band jarayonni yoping
- "Network error" → Tunnel mode ishlating yoki Wi-Fi'ni tekshiring

### 8. 404 NOT_FOUND Xatosi (WEB_URL Noto'g'ri)

Agar `onHttpError: 404` yoki `DEPLOYMENT_NOT_FOUND` xatosi chiqsa:

#### Yechim 1: .env Faylini Tekshirish

`mobile/.env` faylida `EXPO_PUBLIC_WEB_URL` to'g'ri sozlanganligini tekshiring:

```bash
cd mobile
cat .env
```

To'g'ri URL:
```
EXPO_PUBLIC_WEB_URL=https://uchqun-platform.netlify.app
```

Noto'g'ri URL (o'chirib tashlang):
```
EXPO_PUBLIC_WEB_URL=https://uchqun-mobile.vercel.app/
```

#### Yechim 2: .env Faylini To'g'rilash

`.env` faylini tahrir qiling va to'g'ri URL ni qo'ying:

```env
EXPO_PUBLIC_API_URL=https://uchqun-production.up.railway.app/api
EXPO_PUBLIC_WEB_URL=https://uchqun-platform.netlify.app
```

**Eslatma:** `.env` faylini o'zgartirgandan keyin Expo server'ni qayta ishga tushirish kerak:

```bash
cd mobile
# Ctrl+C bilan to'xtating
npm start
```

### 9. 100% Bundling Bo'lgandan Keyin Ochilmayapti (Oq Ekran)

Agar bundling 100% bo'lgandan keyin ilova ochilmayapti (oq ekran qolib ketayapti):

#### Yechim 1: Terminal'da Xatolarni Tekshirish

Terminal'da JavaScript xatolari yoki network xatolarini tekshiring:
- Console log'larda xatolarni ko'ring
- `[WebAppScreen]` prefikslari bilan boshlanadigan log'larni tekshiring

#### Yechim 2: Authentication Tekshirish

Agar ilovada login ekrani chiqayotgan bo'lsa:
1. Login qiling
2. Keyin WebView yuklanishini kuting

#### Yechim 3: WEB_URL Tekshirish

`mobile/src/config.js` faylida `WEB_URL` to'g'ri sozlanganligini tekshiring:
- Production: `https://uchqun-platform.netlify.app`
- Development: `.env` faylida `EXPO_PUBLIC_WEB_URL` ni tekshiring

#### Yechim 4: Expo Go Ilovasini Qayta O'rnatish

1. Expo Go ilovasini yoping
2. Settings > Apps > Expo Go > Uninstall
3. Play Store'dan qayta o'rnating
4. QR kodni qayta scan qiling

#### Yechim 5: Metro Bundler'ni Qayta Ishga Tushirish

```bash
cd mobile
# Metro bundler'ni to'xtating (Ctrl+C)
# Cache'ni tozalash
npx expo start --clear
```

#### Yechim 6: Network/Internet Tekshirish

- Telefonda internet ulanishini tekshiring
- WEB_URL'ga browser orqali kirishni sinab ko'ring
- Firewall yoki antivirus Metro bundler'ni bloklamasligini tekshiring

### 7. To'g'ri URL Tekshirish

Terminal'da quyidagi ko'rinish chiqishi kerak:
```
Metro waiting on exp://192.168.x.x:8081
Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```

## Qadam-baqadam

1. Terminal'ni oching
2. `cd mobile` buyrug'ini bajaring
3. `npm start` yoki `npx expo start` ni bajarish
4. QR kod terminal'da paydo bo'ladi
5. Expo Go ilovasida QR kodni scan qiling
6. Agar ishlamasa, `--tunnel` flag'i bilan ishga tushiring

## Eslatma

Expo Go faqat development uchun ishlaydi. Production build (APK) uchun EAS build ishlatish kerak (qarang: `BUILD_GUIDE.md`).
