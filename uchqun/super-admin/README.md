# Uchqun Super Admin

Super Admin panel - Admin foydalanuvchilarini yaratish uchun alohida panel.

## O'rnatish

```bash
npm install
```

## Ishga tushirish

```bash
npm run dev
```

Ilova `http://localhost:5176` manzilida ochiladi.

## Build

```bash
npm run build
```

## Xususiyatlar

- Admin foydalanuvchilarini yaratish (email va parol bilan)
- Minimal va sodda interfeys
- Alohida ishga tushiriladi (admin paneldan alohida)

## Environment Variables

`.env` faylida quyidagi o'zgaruvchilarni belgilash mumkin:

```
VITE_API_URL=http://localhost:5000/api
VITE_SUPER_ADMIN_SECRET_KEY=your-super-admin-secret-key
```

**Eslatma**: 
- Development rejimida `VITE_SUPER_ADMIN_SECRET_KEY` ixtiyoriy (agar backend'da `SUPER_ADMIN_SECRET_KEY` belgilanmagan bo'lsa)
- Production rejimida `VITE_SUPER_ADMIN_SECRET_KEY` majburiy (backend'dagi `SUPER_ADMIN_SECRET_KEY` bilan mos kelishi kerak)

