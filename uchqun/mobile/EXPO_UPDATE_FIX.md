# Expo "Failed to download remote update" Xatosini Hal Qilish

## Muammo
Expo Go ilovasida "Uncaught Error: java.io.IOException: Failed to download remote update" xatosi chiqyapti.

## Sabab
Expo Go avtomatik ravishda update'larni yuklashga harakat qilayapti, lekin network yoki configuration muammosi tufayli muvaffaqiyatsiz tugayapti.

## Yechimlar

### 1. app.json'da Updates'ni O'chirish

`mobile/app.json` faylida updates'ni o'chirdim:

```json
{
  "expo": {
    "updates": {
      "enabled": false,
      "checkAutomatically": "NEVER",
      "fallbackToCacheTimeout": 0
    }
  }
}
```

### 2. Expo Server'ni Cache'ni Tozalab Qayta Ishga Tushirish

```bash
cd mobile
npx expo start --clear
```

### 3. Expo Go Ilovasini Qayta O'rnatish (Agar Kerak Bo'lsa)

1. Expo Go ilovasini yoping
2. Settings > Apps > Expo Go > Clear Cache
3. Ilovani qayta oching
4. QR kodni qayta scan qiling

### 4. Development Mode'da Ishlatish

Expo Go development mode'da ishlatilganda update muammosi bo'lmasligi kerak:

```bash
cd mobile
npm start
```

Yoki:

```bash
cd mobile
npx expo start --dev-client
```

## Eslatma

Bu muammo odatda Expo Go ilovasida development mode'da ishlatilganda yuzaga kelmaydi. Agar hali ham muammo bo'lsa:

1. Expo Go ilovasini to'liq yoping
2. Cache'ni tozalang
3. QR kodni qayta scan qiling
4. Yoki tunnel mode ishlating: `npx expo start --tunnel`
