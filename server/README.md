# HR Lodex Backend - Auth API

Node.js, Express.js, MongoDB va Nodemailer orqali qurilgan autentifikatsiya tizimi.

## O'rnatish

1. Dependencies o'rnatilgan (npm install)
2. `.env.example` faylini `.env` ga nusxalang
3. `.env` da EMAIL va JWT sozlamalarini kiriting

## Ishga tushirish

```bash
npm start
```

Server `http://localhost:5000` da ishlaydi.

---

## API Endpoints

### Ro'yxatdan o'tish (Register)

#### 1-qadam: Ma'lumotlar yuborish
```
POST /api/auth/register
Content-Type: application/json

{
  "fullName": "Ali Valiyev",
  "email": "ali@example.com",
  "password": "parol123"
}
```

→ Elektron pochtaga 6 xonali tasdiqlash kodi yuboriladi (1 daqiqa amal qiladi)

#### 2-qadam: Email tasdiqlash
```
POST /api/auth/verify-email
Content-Type: application/json

{
  "email": "ali@example.com",
  "code": "123456"
}
```

#### 3-qadam: Kodni qayta yuborish (muddat tugasa yoki xato bo'lsa)
```
POST /api/auth/resend-code
Content-Type: application/json

{
  "email": "ali@example.com",
  "type": "register"
}
```

#### 4-qadam: Rol tanlash
```
POST /api/auth/select-role
Content-Type: application/json

{
  "email": "ali@example.com",
  "role": "employer"   // yoki "candidate"
}
```

→ JWT token qaytariladi

---

### Kirish (Login)

#### 1-qadam: Email va parol
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "ali@example.com",
  "password": "parol123"
}
```

→ Elektron pochtaga tasdiqlash kodi yuboriladi

#### 2-qadam: Login tasdiqlash
```
POST /api/auth/verify-login
Content-Type: application/json

{
  "email": "ali@example.com",
  "code": "123456"
}
```

→ JWT token qaytariladi

#### Login uchun kodni qayta yuborish
```
POST /api/auth/resend-code
Content-Type: application/json

{
  "email": "ali@example.com",
  "type": "login"
}
```

---

## Himoyalangan endpointlar

Token header da yuboriladi:
```
Authorization: Bearer <token>
```

---

## .env sozlamalari

| O'zgaruvchi | Tavsif |
|-------------|--------|
| PORT | Server porti (default: 5000) |
| MONGODB_URI | MongoDB ulanish stringi |
| JWT_SECRET | JWT imzolash kaliti |
| JWT_EXPIRES_IN | Token amal qilish muddati |
| EMAIL_HOST | SMTP server (Gmail: smtp.gmail.com) |
| EMAIL_PORT | SMTP port (587) |
| EMAIL_USER | Pochta manzili |
| EMAIL_PASS | Gmail App Password |

**Gmail App Password:** https://myaccount.google.com/apppasswords
