# Mobile App - Debug Guide

## Terminal Log'lari Tahlili

### Normal Log'lar:
- `[WebAppScreen] Start URL:` - WebView boshlang'ich URL'i
- `[WebAppScreen] User:` - Foydalanuvchi ma'lumotlari
- `[WebAppScreen] AccessToken exists:` - Token mavjudligi
- `[WebAppScreen] onLoadStart` - Sahifa yuklanishi boshlangan
- `[WebAppScreen] Load progress 100%` - Yuklanish 100% ga yetgan
- `[WebAppScreen] onLoadEnd` - Sahifa yuklanishi tugagan
- `[WebAppScreen] Re-injecting localStorage after load` - localStorage qayta inject qilinmoqda

### Muammo:
Agar sahifa ko'rsatilmayapti (oq ekran), quyidagilarni tekshiring:

1. **Expo Go ilovasida:**
   - Settings > Apps > Expo Go > Clear Cache
   - Ilovani to'liq yoping va qayta oching

2. **Expo Server:**
   ```bash
   cd mobile
   npx expo start --clear
   ```

3. **Browser'da tekshiring:**
   - `https://uchqun-platform.netlify.app/` ni browser'da ochib ko'ring
   - Login qiling va ishlashini tekshiring

4. **WebView Console:**
   - Expo Go'da WebView console log'larini ko'ring
   - `[Mobile]` prefikslari bilan boshlanadigan log'larni tekshiring

### Qo'shimcha Ma'lumot:
- localStorage injection `injectedJavaScriptBeforeContentLoaded` va `onLoadEnd` da qilinadi
- Loading timeout 10 soniyadan keyin avtomatik yopiladi
- Login page detection va redirect qo'shilgan
