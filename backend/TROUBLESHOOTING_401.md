# 401 Authentication Error - Troubleshooting Guide

## Muammo
Login endpoint `/api/auth/login` 401 xatosi qaytarmoqda.

## Sabablari va Yechimlari

### 1. Email yoki Parol Noto'g'ri
**Belgilar:**
- `Invalid credentials` xabari
- User topilmayapti yoki parol mos kelmayapti

**Yechim:**
- Email va parolni to'g'ri kiriting
- Email kichik harflarda bo'lishi kerak
- Parol to'g'ri ekanligini tekshiring

### 2. JWT_SECRET O'rnatilmagan
**Belgilar:**
- Server ishlamayapti
- Environment variable xatosi

**Yechim:**
```bash
# Railway yoki server environment variables'da:
JWT_SECRET=<kamida-32-belgili-xavfsiz-kalit>
JWT_REFRESH_SECRET=<kamida-32-belgili-boshqa-xavfsiz-kalit>
```

### 3. User Topilmayapti
**Belgilar:**
- Email database'da yo'q
- User yaratilmagan

**Yechim:**
- User yaratilganligini tekshiring
- Database'da user mavjudligini tekshiring

### 4. Parol Hash Muammosi
**Belgilar:**
- `User account error. Password needs to be reset.`
- Parol to'g'ri hash qilinmagan

**Yechim:**
- User parolini qayta o'rnating
- Database'da parol `$2a$`, `$2b$` yoki `$2y$` bilan boshlanishi kerak

### 5. Account Faol Emas (Reception/Admin)
**Belgilar:**
- `Account not approved` yoki `Admin account is not active`
- 403 status code

**Yechim:**
- Reception: Admin tomonidan tasdiqlanishi kerak
- Admin: Super-admin tomonidan faollashtirilishi kerak

### 6. CORS Muammosi
**Belgilar:**
- Browser console'da CORS xatosi
- Preflight request 401 qaytarmoqda

**Yechim:**
- `FRONTEND_URL` environment variable'da frontend URL'ni qo'shing
- Railway'da environment variable'ni to'g'ri o'rnating

## Tekshirish Qadamlari

1. **Backend loglarini tekshiring:**
```bash
# Railway'da logs'ni ko'ring
# Yoki local'da:
npm run dev
```

2. **Environment variables'ni tekshiring:**
```bash
# Railway'da:
# Settings > Variables > JWT_SECRET va JWT_REFRESH_SECRET mavjudligini tekshiring
```

3. **Database'da user mavjudligini tekshiring:**
```sql
SELECT id, email, role, "isActive", "documentsApproved" FROM users WHERE email = 'your-email@example.com';
```

4. **Network request'ni tekshiring:**
- Browser DevTools > Network tab
- Login request'ni ko'ring
- Request body va response'ni tekshiring

## Yechimlar

### JWT_SECRET Generate Qilish
```bash
# Node.js'da:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### User Parolini Reset Qilish
```bash
# Backend'da script yoki database'da:
# User model'da password field'ni yangi hash bilan yangilang
```

### Reception Account'ni Faollashtirish
- Admin panelida Reception account'ni tasdiqlang
- `documentsApproved = true` va `isActive = true` qiling

## Qo'shimcha Ma'lumot

- Login endpoint: `POST /api/auth/login`
- Required fields: `email`, `password`
- Response: `{ success: true, accessToken, refreshToken, user }`
- Error response: `{ error: "Invalid credentials" }` (401)
