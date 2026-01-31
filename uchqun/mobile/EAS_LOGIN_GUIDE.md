# EAS Login - Muammo hal qilish

## Muammo
`eas login` qilganda parol yoki email noto'g'ri deyilmoqda.

## Yechimlar

### 1. Expo akkaunt yaratish (yangi foydalanuvchi uchun)

1. Brauzerni oching va quyidagi linkka kiring:
   https://expo.dev/signup

2. Email yoki GitHub bilan akkaunt yarating

3. Email'ingizga tasdiqlash xabari keladi - uni tasdiqlang

4. Keyin mobile papkasida qayta login qiling:
   ```bash
   cd mobile
   eas login
   ```

### 2. Parolni tiklash (esdan chiqqan bo'lsa)

1. Brauzerni oching:
   https://expo.dev/forgot-password

2. Email'ingizni kiriting

3. Email'ingizga parol tiklash linki keladi

4. Yangi parol kiriting

5. Keyin qayta login qiling:
   ```bash
   cd mobile
   eas login
   ```

### 3. GitHub bilan login (SSO)

Agar GitHub akkauntingiz bo'lsa:
```bash
cd mobile
eas login -s
```

Bu sizni GitHub orqali login qiladi.

### 4. Manual login (terminal)

```bash
cd mobile
eas login
```

Keyin:
- Email yoki username: `ilhamovakbarjon.111@gmail.com`
- Password: parolingizni kiriting

**Eslatma:** Parol kiritishda hech narsa ko'rinmaydi - bu normal. Shunchaki yozing va Enter bosing.

### 5. Aksaunt tekshirish

Agar allaqachon login qilgan bo'lsangiz, quyidagi buyruq bilan tekshiring:
```bash
eas whoami
```

Bu joriy foydalanuvchi ma'lumotlarini ko'rsatadi.

## Tekshirish

Login muvaffaqiyatli bo'lgandan keyin:
```bash
eas whoami
```

Bu sizning username yoki email'ingizni ko'rsatishi kerak.

## Keyingi qadam

Login muvaffaqiyatli bo'lgandan keyin:
```bash
eas build --platform android --profile preview
```

Bu APK build qilishni boshlaydi.
