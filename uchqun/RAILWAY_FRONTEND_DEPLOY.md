# Railway'da Frontend Deploy Qilish Qo'llanmasi (Uzbek)

Bu qo'llanma frontend loyihalarni Railway'ga deploy qilish uchun qadam-baqadam ko'rsatma.

## Tushuncha

Railway'da frontend deploy qilish uchun:
1. Vite build qiladi (static file'lar yaratadi)
2. Express server static file'larni serve qiladi
3. Railway server'ni ishga tushiradi

## Qadam-baqadam Ko'rsatma

### 1. Har bir Frontend uchun Railway Service Yaratish

Har bir frontend loyiha uchun alohida Railway service yarating:

#### Admin Frontend:
1. Railway dashboard'da **+ New** → **GitHub Repo** ni tanlang
2. Repository'ni tanlang
3. **Root Directory** ni `admin` ga o'rnating
4. Service nomini `uchqun-admin` qilib qo'ying

#### Reception Frontend:
1. Xuddi shunday, lekin **Root Directory** ni `reception` ga o'rnating
2. Service nomini `uchqun-reception` qilib qo'ying

#### Teacher Frontend:
1. **Root Directory** ni `teacher` ga o'rnating
2. Service nomini `uchqun-teacher` qilib qo'ying

#### Super Admin Frontend:
1. **Root Directory** ni `super-admin` ga o'rnating
2. Service nomini `uchqun-super-admin` qilib qo'ying

### 2. Environment Variables Qo'shish

Har bir frontend service uchun quyidagi environment variable'ni qo'shing:

**Variable Name:** `VITE_API_URL`  
**Value:** `https://uchqun-production-4f83.up.railway.app/api`

**Qanday qo'shish:**
1. Service'ga kiring
2. **Variables** tab'ni oching
3. **+ New Variable** tugmasini bosing
4. `VITE_API_URL` ni qo'shing
5. Backend URL'ini kiriting (oxirida `/api` bo'lishi kerak)

### 3. Build Settings

Railway avtomatik ravishda quyidagilarni aniqlaydi:
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`

Agar ishlamasa, **Settings** → **Build & Deploy** bo'limida:
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`

### 4. Port Sozlash

Railway avtomatik ravishda `PORT` environment variable'ni beradi. Server.js fayllarida bu port ishlatiladi.

## Qo'shimcha Sozlamalar

### NODE_ENV

Production uchun:
```
NODE_ENV=production
```

### Custom Domain

Agar custom domain ishlatmoqchi bo'lsangiz:
1. Service → **Settings** → **Networking**
2. **Generate Domain** yoki **Custom Domain** qo'shing

## Tekshirish

Deploy qilgandan keyin:

1. Service URL'ini oching
2. Browser console'ni oching (F12)
3. Network tab'da API so'rovlarini tekshiring
4. API so'rovlar to'g'ri backend URL'ga ketayotganini tekshiring

## Masalalar va Yechimlar

### Build Xatosi

**Muammo:** Build muvaffaqiyatsiz bo'lmoqda

**Yechim:**
1. Build log'larni tekshiring
2. `npm install` to'g'ri ishlayotganini tekshiring
3. `dist` papka yaratilganini tekshiring

### Server Ishlamayapti

**Muammo:** Server start bo'lmayapti

**Yechim:**
1. `package.json` da `start` script borligini tekshiring
2. `server.js` fayl mavjudligini tekshiring
3. `express` dependency o'rnatilganini tekshiring

### 404 Error

**Muammo:** SPA routing ishlamayapti

**Yechim:**
- `server.js` da `app.get('*', ...)` route borligini tekshiring
- Bu barcha route'lar uchun `index.html` ni qaytaradi

### API Connection Error

**Muammo:** Frontend backend'ga ulanmayapti

**Yechim:**
1. `VITE_API_URL` to'g'ri ekanligini tekshiring
2. Backend ishlayotganini tekshiring
3. CORS sozlamalarini tekshiring (backend'dagi `FRONTEND_URL`)

## Alternativ: Vercel/Netlify

Agar Railway'da muammo bo'lsa, Vercel yoki Netlify'da deploy qilish osonroq:

- **Vercel:** GitHub repo'ni ulash, avtomatik deploy
- **Netlify:** Drag & drop yoki GitHub integration

Batafsil: `FRONTEND_DEPLOYMENT.md` faylini ko'ring.

## Xulosa

Railway'da frontend deploy qilish:
1. ✅ Root directory'ni to'g'ri o'rnating
2. ✅ `VITE_API_URL` environment variable'ni qo'shing
3. ✅ Build va start command'lar to'g'ri ishlayotganini tekshiring
4. ✅ Deploy qiling va test qiling







