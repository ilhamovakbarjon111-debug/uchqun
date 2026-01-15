# Super Admin Panel - Netlify Deploy Qo'llanmasi

## Netlify'ga Deploy Qilish

### 1. Netlify Dashboard orqali

1. [Netlify](https://app.netlify.com) ga kiring
2. "Add new site" → "Import an existing project" ni tanlang
3. GitHub repository'ni ulang
4. Build settings:
   - **Base directory:** `super-admin`
   - **Build command:** `npm install && npm run build`
   - **Publish directory:** `dist`

### 2. Environment Variables

Netlify Dashboard → Site settings → Environment variables bo'limiga quyidagilarni qo'shing:

```
VITE_API_URL=https://uchqun-production.up.railway.app/api
VITE_SUPER_ADMIN_SECRET_KEY=your_secret_key_here
```

### 3. Automatic Deploy

GitHub'ga push qilganda avtomatik deploy bo'ladi.

## Muammolar va Yechimlar

### Hech narsa ko'rinmayapti

1. **Build loglarni tekshiring** - Netlify Dashboard → Deploys → Build log
2. **Environment variables** to'g'ri qo'yilganligini tekshiring
3. **Publish directory** `dist` ekanligini tekshiring
4. **Base directory** `super-admin` ekanligini tekshiring

### 404 Error (Routing muammosi)

`public/_redirects` fayli mavjudligini tekshiring. Bu fayl SPA routing uchun zarur.
