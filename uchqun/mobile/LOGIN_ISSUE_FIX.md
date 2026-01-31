# Login'dan keyin hech narsa chiqmayapti - Muammo va Yechim

## Muammo
Login qilgandan keyin mobile app'da hech narsa chiqmayapti (oq ekran).

## Sabab
Web app'dagi `AuthContext` localStorage'ni faqat mount vaqtida o'qiyapti (`useEffect` with empty deps). Shuning uchun localStorage injection qilgandan keyin ham AuthContext o'zgarishini bilmayapti.

## Yechim
1. **localStorage injection'ni `injectedJavaScriptBeforeContentLoaded` da qilamiz** - Bu sahifa yuklanguncha localStorage'ni tayyorlaydi, shunda AuthContext o'qiganda ma'lumot bo'ladi.

2. **Loading state'ni to'g'ri boshqaramiz** - `onLoadEnd` da loading'ni yopamiz.

3. **Login page redirect'ni yaxshilaymiz** - Login sahifasida bo'lsak va localStorage'da user bo'lsa, avtomatik redirect qilamiz.

## Tekshirish
1. Expo server'ni qayta ishga tushiring:
```bash
cd mobile
npx expo start --clear
```

2. Expo Go ilovasida cache'ni tozalang:
   - Settings > Apps > Expo Go > Clear Cache
   - Ilovani yoping va qayta oching

3. Login qiling va terminal log'larini tekshiring:
   - `[Mobile] localStorage injection` log'lari ko'rinishi kerak
   - `[Mobile] Verification` log'lari localStorage'ni to'g'ri set qilganini ko'rsatishi kerak

## Qo'shimcha
Agar hali ham ishlamasa, web app'dagi `AuthContext` ni o'zgartirish kerak - `storage` event'ini eshitish uchun, lekin bu web app kodini o'zgartirishni talab qiladi.
