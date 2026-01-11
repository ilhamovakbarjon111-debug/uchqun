# Frontend Deployment Guide (Uzbek tilida)

Bu qo'llanma barcha frontend loyihalarni deploy qilish uchun kerakli environment variable'larni ko'rsatadi.

## Frontend Loyihalar

Loyihada quyidagi frontend loyihalar mavjud:

1. **admin** - Admin panel
2. **reception** - Reception panel  
3. **teacher** - Teacher panel
4. **super-admin** - Super Admin panel

## Kerakli Environment Variable

Barcha frontend loyihalar uchun faqat bitta environment variable kerak:

### `VITE_API_URL`

Bu backend API URL'ini ko'rsatadi.

**Format:**
```
VITE_API_URL=https://your-backend-url.com/api
```

## Har bir Frontend uchun .env Fayl Yaratish

### 1. Admin Frontend

`admin/` papkasida `.env` fayl yarating:

```env
VITE_API_URL=https://uchqun-production-4f83.up.railway.app/api
```

Yoki local development uchun:
```env
VITE_API_URL=http://localhost:5000/api
```

### 2. Reception Frontend

`reception/` papkasida `.env` fayl yarating:

```env
VITE_API_URL=https://uchqun-production-4f83.up.railway.app/api
```

### 3. Teacher Frontend

`teacher/` papkasida `.env` fayl yarating:

```env
VITE_API_URL=https://uchqun-production-4f83.up.railway.app/api
```

### 4. Super Admin Frontend

`super-admin/` papkasida `.env` fayl yarating:

```env
VITE_API_URL=https://uchqun-production-4f83.up.railway.app/api
```

## Railway Deployment

Railway'da frontend deploy qilish uchun:

### Qadam-baqadam:

1. **Har bir frontend uchun alohida Railway service yarating:**
   - Railway dashboard'da **+ New** → **GitHub Repo**
   - Repository'ni tanlang
   - **Root Directory** ni frontend papkasiga o'rnating:
     - Admin: `admin`
     - Reception: `reception`
     - Teacher: `teacher`
     - Super Admin: `super-admin`

2. **Environment Variable qo'shing:**
   - Service → **Variables** tab
   - **+ New Variable**
   - **Name:** `VITE_API_URL`
   - **Value:** `https://uchqun-production-4f83.up.railway.app/api`

3. **Build Settings (avtomatik, lekin tekshirib ko'ring):**
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`

4. **Deploy qiling**

**Muhim:** Har bir frontend uchun alohida service yarating va Root Directory'ni to'g'ri o'rnating!

Batafsil: `RAILWAY_FRONTEND_DEPLOY.md` faylini ko'ring.

## Vercel/Netlify Deployment

Agar Vercel yoki Netlify'da deploy qilsangiz:

### Vercel uchun:

1. Har bir frontend loyiha uchun alohida Vercel project yarating
2. **Settings** → **Environment Variables** ga kiring
3. Quyidagi variable'ni qo'shing:

   - **Name:** `VITE_API_URL`
   - **Value:** `https://uchqun-production-4f83.up.railway.app/api`
   - **Environment:** Production, Preview, Development (hamma uchun)

4. **Redeploy** qiling

### Netlify uchun:

1. Har bir frontend loyiha uchun alohida Netlify site yarating
2. **Site settings** → **Environment variables** ga kiring
3. **Add variable** tugmasini bosing
4. Quyidagi variable'ni qo'shing:

   - **Key:** `VITE_API_URL`
   - **Value:** `https://uchqun-production-4f83.up.railway.app/api`
   - **Scopes:** All scopes (Production, Deploy previews, Branch deploys)

5. **Deploy site** qiling

## Build Command

Har bir frontend loyiha uchun build command:

```bash
npm run build
```

## Build Output Directory

- **admin:** `admin/dist`
- **reception:** `reception/dist`
- **teacher:** `teacher/dist`
- **super-admin:** `super-admin/dist`

## Production URL'ni O'zgartirish

Agar backend URL'i boshqa bo'lsa, `.env` faylda yoki deployment platform'da `VITE_API_URL` ni yangilang:

```env
VITE_API_URL=https://your-actual-backend-url.com/api
```

**Muhim:** URL oxirida `/api` bo'lishi kerak!

## Tekshirish

Deploy qilgandan keyin:

1. Browser'da frontend'ni oching
2. Developer Console'ni oching (F12)
3. Network tab'da API so'rovlarini tekshiring
4. API so'rovlari to'g'ri backend URL'ga ketayotganini tekshiring

## Masalalar bo'lsa

### CORS Error

Agar CORS error bo'lsa, backend'dagi `FRONTEND_URL` environment variable'ni to'g'ri frontend URL'iga o'rnating.

### API Connection Error

1. Backend ishlayotganini tekshiring
2. `VITE_API_URL` to'g'ri ekanligini tekshiring
3. Backend'dagi CORS sozlamalarini tekshiring

## Qo'shimcha Ma'lumot

- Vite environment variable'lari `VITE_` bilan boshlanishi kerak
- Build qilingandan keyin environment variable'lar kodga birlashtiriladi
- `.env` fayllar `.gitignore` da bo'lishi kerak (secret ma'lumotlar uchun)

