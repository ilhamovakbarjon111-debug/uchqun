# Telegram Bot Sozlash Qo'llanmasi

## 1. Telegram Bot Yaratish

1. Telegram'da `@BotFather` ga yozing
2. `/newbot` buyrug'ini yuboring
3. Bot nomini kiriting (masalan: "Uchqun Admin Bot")
4. Bot username'ni kiriting (masalan: "uchqun_admin_bot")
5. Bot token'ni oling (masalan: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

## 2. Channel/Group Yaratish va Botni Qo'shish

### Variant A: Public Channel (Tavsiya etiladi)

1. Telegram'da yangi channel yarating
2. Channel'ni public qiling (username qo'shing, masalan: `@uchqun_admin_notifications`)
3. Botni channel'ga admin qiling:
   - Channel settings → Administrators → Add Administrator
   - Botni tanlang va "Post Messages" ruxsatini bering

### Variant B: Private Group

1. Telegram'da yangi group yarating
2. Botni group'ga qo'shing va admin qiling
3. Group ID'ni olish uchun:
   - Botni group'ga qo'shing
   - `https://api.telegram.org/bot<TOKEN>/getUpdates` ga so'rov yuboring
   - Response'dan `chat.id` ni toping (masalan: `-1001234567890`)

## 3. Channel/Group ID Olish

### Public Channel uchun:
- Username'ni ishlating: `@your_channel_name`
- Yoki channel'ga kirib, linkdan username'ni oling

### Private Group/Channel uchun:
1. Botni group/channel'ga qo'shing
2. Quyidagi URL'ga so'rov yuboring (browser yoki Postman):
   ```
   https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
   ```
3. Response'dan `chat.id` ni toping (manfiy raqam bo'ladi, masalan: `-1001234567890`)

## 4. Railway'ga Qo'shish

Railway dashboard'da environment variables'ga quyidagilarni qo'shing:

```
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHANNEL_ID=@uchqun_admin_notifications
```

Yoki private channel/group bo'lsa:

```
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHANNEL_ID=-1001234567890
```

## 5. Xabar Yuborish Usullari

Sistema ikki usul bilan xabar yuborishga harakat qiladi:

### Usul 1: To'g'ridan-to'g'ri foydalanuvchiga (Tavsiya etiladi)
- Foydalanuvchi botni start qilgan bo'lsa, xabar to'g'ridan-to'g'ri yuboriladi
- **Afzalligi:** Foydalanuvchi channel'ga a'zo bo'lishi shart emas
- **Kamchiligi:** Foydalanuvchi botni start qilgan bo'lishi kerak

### Usul 2: Channel/Group orqali (Fallback)
- Agar to'g'ridan-to'g'ri yuborib bo'lmasa, channel'ga yuboriladi
- **Afzalligi:** Har doim ishlaydi (agar channel sozlangan bo'lsa)
- **Kamchiligi:** Foydalanuvchi channel'ga a'zo bo'lishi kerak

## 6. Test Qilish

1. Admin registration request yuborishda Telegram username kiriting
2. Super admin tasdiqlaganda:
   - Agar foydalanuvchi botni start qilgan bo'lsa → to'g'ridan-to'g'ri xabar yuboriladi
   - Aks holda → channel'ga xabar yuboriladi va user mention qilinadi
3. Foydalanuvchi xabarni ko'radi (bot orqali yoki channel'da)

## Eslatmalar

- **Eng yaxshi yechim:** Foydalanuvchilardan botni start qilishni so'rash
- Bot channel'da admin bo'lishi kerak (fallback usul uchun)
- Public channel bo'lsa, `@channel_name` formatida qo'shing
- Private channel/group bo'lsa, numeric ID ishlating (manfiy raqam)
- Channel usuli uchun foydalanuvchi channel'ga a'zo bo'lishi kerak

## Muammo hal qilish

Agar xabar yuborilmasa:
1. Bot token to'g'ri ekanligini tekshiring
2. Bot channel'da admin ekanligini tekshiring
3. Channel ID to'g'ri ekanligini tekshiring
4. Backend loglarini ko'rib chiqing
