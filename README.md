# TR
# Ofis Yönetim Sistemi (Office Reservation System)

Enterprise-grade ofis masaları ve meeting odaları yönetim platformu. Çalışanlar masa/oda rezervasyonu yapabilir, yöneticiler onay verebilir, adminler sistemi yönetebilir.

## Amaç

Şirketlerin ofis kaynaklarını (masalar, toplantı odaları) verimli şekilde yönetmesine ve çalışanların online olarak rezervasyon yapmasına olanak sağlamak.

---

## Sistem Özeti

| Bileşen | Teknoloji | Durum |
|---------|-----------|-------|
| **Backend API** | .NET 9 (C#) |
| **Database** | PostgreSQL |
| **Frontend** | React 19 + TypeScript |
| **Styling** | Tailwind CSS | Material Design 3 |
| **Authentication** | JWT + Refresh Token | Implemented |
| **Authorization** | Role-Based Access Control | 3 Role |

---

## Mimari Yapı

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                       │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │  Dashboard   │ │ Reservations │ │   Settings   │ ...    │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
└──────────────────────────┬──────────────────────────────────┘
                           │ (HTTP/REST)
┌──────────────────────────┴──────────────────────────────────┐
│                    BACKEND API (.NET 9)                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │   Auth   │ │Reservation│ │ Locations│ │ Analytics│      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│  JWT | RBAC | Validation | Business Logic                  │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────┐
│                  PostgreSQL Database                        │
│  Users | Reservations | Locations | Desks | Rooms | Logs   │
└─────────────────────────────────────────────────────────────┘
```

---

## Temel Özellikler

### Rezervasyon Sistemi
- ✅ Masa ve oda online rezervasyonu
- ✅ Otomatik çakışma kontrolü (aynı masaya 2 kişi reserve edemez)
- ✅ İşletme kuralları (Min/max süresi, işletme saatleri)
- ✅ Manager onay iş akışı
- ✅ Hızlı iptal (2 saat öncesine kadar)

### Güvenlik & Erişim Kontrolü
- ✅ JWT Token Authentication (24 saat geçerli)
- ✅ Refresh Token Mekanizması
- ✅ Role-Based Authorization (Employee/Manager/Admin)
- ✅ Resource-level Permission Control
- ✅ Audit Logging (Tüm işlemler kaydediliyor)

### 👥 Üç Kullanıcı Rolü

| Rol | Yetkiler |
|-----|----------|
| **Employee**  | Kendi rez. yapabilir, QR ile giriş, profil güncelle |
| **Manager**  | Takımın rez. onaylayabilir, takım yönetimi, raporlar |
| **Admin**  | Sistem yönetimi, kural ayarlama, denetim günlüğü |

### Analytics & Raporlama
- ✅ Dashboard istatistikleri
- ✅ Kullanım analizi (günlük/haftalık/aylık)
- ✅ Peak hours analizi
- ✅ PDF/CSV export

### QR Code Integration
- ✅ Hızlı check-in/check-out (QR tarama)
- ✅ 15 dakika geçerli QR token'ları
- ✅ Otomatik zamanlama kaydı

---

## Veritabanı Tasarımı

**11 Tablo (Normalized PostgreSQL)**

```
USERS (Kullanıcılar)
├─ Email, Password, Role, Status, FirstName, LastName
└─ Departman, Telefon, ProfilePicture

LOCATIONS (Ofisler)
├─ Name, Address, City, Capacity
└─ OpeningHours, ContactPerson

FLOORS (Katlar)
├─ LocationId, FloorNumber
└─ Harita, Özellikleri

DESKS (Masalar)
├─ FloorId, DeskNumber, Capacity, Status
└─ Specifications (Monitor, Equipment)

ROOMS (Toplantı Odaları)
├─ LocationId, Name, Capacity
└─ Equipment (Projector, Whiteboard)

RESERVATIONS (Rezervasyonlar)
├─ UserId, DeskId/RoomId, StartTime, EndTime
├─ Status (Pending/Confirmed/Cancelled)
└─ ApprovedBy (Manager)

CHECKINS (Giriş Kayıtları)
├─ ReservationId, CheckinTime, CheckoutTime
└─ QR Token validation

RULES (Kurallar)
├─ MinDuration, MaxDuration, DailyMax
└─ WorkingHours, HolidayDates

AUDITLOG (Denetim Günlüğü)
├─ UserId, Action, Resource, Timestamp
└─ ChangedData

NOTIFICATIONS (Bildirimler)
├─ UserId, Type, Message, IsRead
└─ CreatedAt

QRTOKENS (QR Tokenları)
├─ Token, ExpiresAt, Used
└─ ReservationId
```

---

## API Endpoints (10 Modül)

### 1. Authentication
```
POST   /api/auth/login           # Giriş yap
POST   /api/auth/register        # Kayıt ol
POST   /api/auth/refresh-token   # Token yenile
GET    /api/auth/me              # Profil bilgisi
```

### 2. Reservations
```
GET    /api/reservations                    # Liste
POST   /api/reservations                    # Oluştur
GET    /api/reservations/{id}               # Detay
PUT    /api/reservations/{id}               # Güncelle
DELETE /api/reservations/{id}               # İptal et
GET    /api/reservations/availability/check # Yer boş mu?
POST   /api/reservations/{id}/approve       # Onayla (Manager)
```

### 3. Locations, Desks, Rooms
```
GET    /api/locations           # Tüm ofisler
GET    /api/locations/{id}      # Detay
GET    /api/desks               # Masalar
GET    /api/rooms               # Odalar
```

### 4. Check-in/Check-out
```
POST   /api/checkins            # QR ile giriş
POST   /api/checkins/{id}/checkout # Çıkış
```

### 5. Analytics
```
GET    /api/analytics/dashboard  # Ana istatistikler
GET    /api/analytics/reports    # Detaylı raporlar
GET    /api/analytics/usage      # Kullanım analizi
```

### 6-10. Users, Notifications, Logs, Rules, Health
```
GET    /api/users               # Kullanıcı listesi
GET    /api/notifications       # Bildirimler
GET    /api/logs                # Denetim günlüğü
GET    /api/rules               # İşletme kuralları
GET    /api/health              # Sistem sağlığı
```

---

## Proje Yapısı

```
Ofis-Yonetim-Sistemi-.NET/
│
├── frontend/                          (React 19 + TypeScript)
│   ├── src/
│   │   ├── pages/                    (17+ sayfa, 3 role)
│   │   │   ├── employee/             (Dashboard, Reservations, Settings)
│   │   │   ├── manager/              (Reservations, Users, Reports)
│   │   │   └── admin/                (Approval, Users, Locations, Logs)
│   │   ├── widgets/                  (50+ Material Design 3 Component)
│   │   ├── context/                  (Auth, Global State)
│   │   ├── types/                    (TypeScript Definitions)
│   │   └── app/                      (Router, Layout)
│   ├── package.json
│   └── vite.config.ts
│
├── src/                               (.NET 9 Backend)
│   ├── API/                          (REST Controllers)
│   │   ├── Controllers/              (Auth, Reservations, Locations, etc.)
│   │   └── Program.cs               (Startup, DI, Middleware)
│   ├── Application/                 (Business Logic)
│   │   ├── Services/                (Reservation, User, Analytics Services)
│   │   └── DTOs/                    (Data Transfer Objects)
│   ├── Infrastructure/              (Database, Auth, External Services)
│   │   ├── Data/                    (DbContext, Migrations, Configurations)
│   │   ├── Authentication/          (JWT, Authorization)
│   │   └── Repositories/            (Database Access)
│   ├── Domain/                      (Core Business Rules)
│   │   ├── Entities/                (User, Reservation, Desk, Room, etc.)
│   │   ├── Enums/                   (UserRole, ReservationStatus, etc.)
│   │   └── Events/                  (Domain Events)
│   └── Tests/                       (Unit & Integration Tests)
│
├── docs/                             (Dokumentasyon)
│   ├── README.md                    (Docs index)
│   ├── api_presentation.md          (Detaylı API sunum)
│   ├── quick_summary.txt            (Hızlı özet)
│   └── comparison_table.txt         (Role karşılaştırması)
│
└── README.md                        (Bu dosya)
```

---

## Kurulum & Çalıştırma

### Prerequisites
- Node.js 18+ (Frontend)
- .NET 9 SDK (Backend)
- PostgreSQL 14+
- Git

### Frontend Setup
```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

### Backend Setup
```bash
cd src/API
dotnet restore
dotnet ef database update    # Migrations çalıştır
dotnet run                   # http://localhost:5000
```

### Database
```bash
# PostgreSQL bağlantı string'i appsettings.json'da ayarlayın
# Migrations otomatik olarak çalışacaktır
```

### Swagger Documentation
```
http://localhost:5000/swagger/index.html
```

---

## Güvenlik

### Authentication Flow
```
1. User giriş yapar (Email + Password)
2. Backend JWT token üretir (24 saat geçerli)
3. Frontend token'ı localStorage'de saklar
4. Her request'te "Authorization: Bearer {token}" header'ı gönderilir
5. Token süresi dolduğunda refresh token kullanılarak yenilenir
```

### Authorization Rules
- Employee: Kendi rez., kendi profil
- Manager: Takımın rez., takımın profili
- Admin: Tüm sistem

### Additional Security
- ✅ Password Hashing (Bcrypt)
- ✅ CORS Policy (Production domain'e ayarlanmalı)
- ✅ Input Validation
- ✅ SQL Injection Protection (Parameterized Queries)
- ✅ Rate Limiting (Planned)
- ✅ HTTPS (Production'da zorunlu)

---
## Dokumantasyon

Detaylı dokumantasyon `/docs` klasöründe:

| Dosya | Hedef | Okuma Süresi |
|-------|-------|--------------|
| `docs/README.md` | Rehber | 2 min |
| `docs/quick_summary.txt` | Yönetim | 5 min |
| `docs/api_presentation.md` | Geliştiriciler | 30 min |
| `docs/comparison_table.txt` | Role detayları | 5 min |

---

## Önemli Notlar

### Environment Variables Gerekli
```env
# Backend
DATABASE_CONNECTION_STRING=postgresql://user:password@localhost/officedb
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=24h
CORS_ORIGIN=http://localhost:5173

# Frontend
VITE_API_BASE_URL=http://localhost:5000/api
```

### Performance Notes
- Frontend: React 19 + Vite (Fast build, HMR)
- Backend: .NET 9 (High performance, multi-threaded)
- Database: PostgreSQL (Efficient queries, indexes)
- API: RESTful (Stateless, scalable)

# ENG

# Office Management System (Office Reservation System)

An enterprise-grade platform for managing office desks and meeting rooms. Employees can make desk/room reservations, managers can approve them, and administrators can manage the system.

## Purpose

To enable companies to efficiently manage office resources (desks and meeting rooms) and allow employees to make online reservations.

---

## System Overview

| Component          | Technology                | Status                  |
| ------------------ | ------------------------- | ----------------------- |
| **Backend API**    | .NET 9 (C#)               | 95% Complete            |
| **Database**       | PostgreSQL                | 100% Complete           |
| **Frontend**       | React 19 + TypeScript     | 90% Complete (UI Ready) |
| **Styling**        | Tailwind CSS              | Material Design 3       |
| **Authentication** | JWT + Refresh Token       | Implemented             |
| **Authorization**  | Role-Based Access Control | 3 Roles                 |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                       │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │  Dashboard   │ │ Reservations │ │   Settings   │ ...    │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
└──────────────────────────┬──────────────────────────────────┘
                           │ (HTTP/REST)
┌──────────────────────────┴──────────────────────────────────┐
│                    BACKEND API (.NET 9)                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │   Auth   │ │Reservation│ │ Locations│ │ Analytics│      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│  JWT | RBAC | Validation | Business Logic                  │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────┐
│                  PostgreSQL Database                        │
│  Users | Reservations | Locations | Desks | Rooms | Logs   │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Features

### Reservation System

* ✅ Online desk and room booking
* ✅ Automatic conflict detection (no double-booking)
* ✅ Business rules (min/max duration, office hours)
* ✅ Manager approval workflow
* ✅ Quick cancellation (up to 2 hours prior)

### Security & Access Control

* ✅ JWT Token Authentication (24-hour validity)
* ✅ Refresh Token Mechanism
* ✅ Role-Based Authorization (Employee/Manager/Admin)
* ✅ Resource-level Permission Control
* ✅ Audit Logging (all actions recorded)

### 👥 Three User Roles

| Role         | Permissions                                            |
| ------------ | ------------------------------------------------------ |
| **Employee** | Make own reservations, check-in via QR, update profile |
| **Manager**  | Approve team reservations, manage team, view reports   |
| **Admin**    | Manage system, configure rules, view audit logs        |

### Analytics & Reporting

* ✅ Dashboard statistics
* ✅ Usage analysis (daily/weekly/monthly)
* ✅ Peak hours analysis
* ✅ PDF/CSV export

### QR Code Integration

* ✅ Fast check-in/check-out (QR scan)
* ✅ 15-minute valid QR tokens
* ✅ Automatic time tracking

---

## Database Design

**11 Tables (Normalized PostgreSQL)**

```
USERS
├─ Email, Password, Role, Status, FirstName, LastName
└─ Department, Phone, ProfilePicture

LOCATIONS
├─ Name, Address, City, Capacity
└─ OpeningHours, ContactPerson

FLOORS
├─ LocationId, FloorNumber
└─ Map, Features

DESKS
├─ FloorId, DeskNumber, Capacity, Status
└─ Specifications (Monitor, Equipment)

ROOMS
├─ LocationId, Name, Capacity
└─ Equipment (Projector, Whiteboard)

RESERVATIONS
├─ UserId, DeskId/RoomId, StartTime, EndTime
├─ Status (Pending/Confirmed/Cancelled)
└─ ApprovedBy (Manager)

CHECKINS
├─ ReservationId, CheckinTime, CheckoutTime
└─ QR Token validation

RULES
├─ MinDuration, MaxDuration, DailyMax
└─ WorkingHours, HolidayDates

AUDITLOG
├─ UserId, Action, Resource, Timestamp
└─ ChangedData

NOTIFICATIONS
├─ UserId, Type, Message, IsRead
└─ CreatedAt

QRTOKENS
├─ Token, ExpiresAt, Used
└─ ReservationId
```

---

## API Endpoints (10 Modules)

### 1. Authentication

```
POST   /api/auth/login           # Login
POST   /api/auth/register        # Register
POST   /api/auth/refresh-token   # Refresh token
GET    /api/auth/me              # Profile info
```

### 2. Reservations

```
GET    /api/reservations                    # List
POST   /api/reservations                    # Create
GET    /api/reservations/{id}               # Detail
PUT    /api/reservations/{id}               # Update
DELETE /api/reservations/{id}               # Cancel
GET    /api/reservations/availability/check # Availability
POST   /api/reservations/{id}/approve       # Approve (Manager)
```

### 3. Locations, Desks, Rooms

```
GET    /api/locations           # All locations
GET    /api/locations/{id}      # Details
GET    /api/desks               # Desks
GET    /api/rooms               # Rooms
```

### 4. Check-in/Check-out

```
POST   /api/checkins            # QR check-in
POST   /api/checkins/{id}/checkout # Check-out
```

### 5. Analytics

```
GET    /api/analytics/dashboard  # Main stats
GET    /api/analytics/reports    # Detailed reports
GET    /api/analytics/usage      # Usage analytics
```

### 6-10. Users, Notifications, Logs, Rules, Health

```
GET    /api/users               # Users
GET    /api/notifications       # Notifications
GET    /api/logs                # Audit logs
GET    /api/rules               # Business rules
GET    /api/health              # Health check
```

---

## Project Structure

```
Office-Management-System-.NET/
│
├── frontend/                          (React 19 + TypeScript)
│   ├── src/
│   │   ├── pages/                    (17+ pages, 3 roles)
│   │   │   ├── employee/             (Dashboard, Reservations, Settings)
│   │   │   ├── manager/              (Reservations, Users, Reports)
│   │   │   └── admin/                (Approvals, Users, Locations, Logs)
│   │   ├── widgets/                  (50+ Material Design 3 Components)
│   │   ├── context/                  (Auth, Global State)
│   │   ├── types/                    (TypeScript Definitions)
│   │   └── app/                      (Router, Layout)
│   ├── package.json
│   └── vite.config.ts
│
├── src/                               (.NET 9 Backend)
│   ├── API/                          (REST Controllers)
│   │   ├── Controllers/              (Auth, Reservations, Locations, etc.)
│   │   └── Program.cs               (Startup, DI, Middleware)
│   ├── Application/                 (Business Logic)
│   │   ├── Services/                (Reservation, User, Analytics)
│   │   └── DTOs/                    (Data Transfer Objects)
│   ├── Infrastructure/              (Database, Auth, External Services)
│   │   ├── Data/                    (DbContext, Migrations, Configurations)
│   │   ├── Authentication/          (JWT, Authorization)
│   │   └── Repositories/            (Database Access)
│   ├── Domain/                      (Core Business Rules)
│   │   ├── Entities/                (User, Reservation, Desk, Room, etc.)
│   │   ├── Enums/                   (UserRole, ReservationStatus, etc.)
│   │   └── Events/                  (Domain Events)
│   └── Tests/                       (Unit & Integration Tests)
│
├── docs/                             (Documentation)
│   ├── README.md                    (Docs index)
│   ├── api_presentation.md          (Detailed API presentation)
│   ├── quick_summary.txt            (Quick summary)
│   └── comparison_table.txt         (Role comparison)
│
└── README.md                        (This file)
```

---

## Setup & Run

### Prerequisites

* Node.js 18+ (Frontend)
* .NET 9 SDK (Backend)
* PostgreSQL 14+
* Git

### Frontend Setup

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

### Backend Setup

```bash
cd src/API
dotnet restore
dotnet ef database update
dotnet run           # http://localhost:5000
```

### Database

```bash
# Configure PostgreSQL connection string in appsettings.json
# Migrations will run automatically
```

### Swagger Documentation

```
http://localhost:5000/swagger/index.html
```

---

## Security

### Authentication Flow

```
1. User logs in (Email + Password)
2. Backend issues JWT token (valid for 24 hours)
3. Frontend stores token in localStorage
4. Each request sends "Authorization: Bearer {token}" header
5. When token expires, it’s renewed using the refresh token
```

### Authorization Rules

* Employee: Own reservations, profile
* Manager: Team reservations, team profiles
* Admin: Full system access

### Additional Security

* ✅ Password Hashing (Bcrypt)
* ✅ CORS Policy (set for production domain)
* ✅ Input Validation
* ✅ SQL Injection Protection (Parameterized Queries)
* ✅ Rate Limiting (Planned)
* ✅ HTTPS (Required in production)

---

## Documentation

Detailed docs in `/docs`:

| File                        | Purpose      | Reading Time |
| --------------------------- | ------------ | ------------ |
| `docs/README.md`            | Guide        | 2 min        |
| `docs/quick_summary.txt`    | Management   | 5 min        |
| `docs/api_presentation.md`  | Developers   | 30 min       |
| `docs/comparison_table.txt` | Role details | 5 min        |

---

## Important Notes

### Required Environment Variables

```env
# Backend
DATABASE_CONNECTION_STRING=postgresql://user:password@localhost/officedb
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=24h
CORS_ORIGIN=http://localhost:5173

# Frontend
VITE_API_BASE_URL=http://localhost:5000/api
```

### Performance Notes

* Frontend: React 19 + Vite (Fast build, HMR)
* Backend: .NET 9 (High performance, multi-threaded)
* Database: PostgreSQL (Efficient queries, indexes)
* API: RESTful (Stateless, scalable)
