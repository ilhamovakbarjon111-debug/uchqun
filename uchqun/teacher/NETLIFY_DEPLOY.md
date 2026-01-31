# Netlify Deploy Qo'llanmasi

## Netlify'ga Deploy Qilish

### 1. Netlify Dashboard orqali

1. [Netlify](https://app.netlify.com) ga kiring
2. "Add new site" → "Import an existing project" ni tanlang
3. GitHub repository'ni ulang
4. Build settings:
   - **Build command:** `npm install && npm run build`
   - **Publish directory:** `dist`
   - **Base directory:** `teacher` (agar root folder emas bo'lsa)

### 2. Environment Variables

Netlify Dashboard → Site settings → Environment variables bo'limiga quyidagilarni qo'shing:

```
VITE_API_URL=https://uchqun-production.up.railway.app/api
```

### 3. Automatic Deploy

GitHub'ga push qilganda avtomatik deploy bo'ladi.

### 4. Manual Deploy

Agar manual deploy qilmoqchi bo'lsangiz:

```bash
cd teacher
npm install
npm run build
```

Keyin `dist` papkasini Netlify'ga drag & drop qiling.

## Muammolar va Yechimlar

### Hech narsa ko'rinmayapti

1. **Build loglarni tekshiring** - Netlify Dashboard → Deploys → Build log
2. **Environment variables** to'g'ri qo'yilganligini tekshiring
3. **Publish directory** `dist` ekanligini tekshiring
4. **Browser console** da xatolarni tekshiring

### 404 Error (Routing muammosi)

`public/_redirects` fayli mavjudligini tekshiring. Bu fayl SPA routing uchun zarur.

### API ishlamayapti

1. `VITE_API_URL` environment variable to'g'ri qo'yilganligini tekshiring
2. CORS sozlamalarini backend'da tekshiring
3. Network tab'da API so'rovlarini tekshiring

## Fayllar

- `netlify.toml` - Netlify build konfiguratsiyasi
- `public/_redirects` - SPA routing uchun redirect qoidalari
- `vite.config.js` - Vite build konfiguratsiyasi
