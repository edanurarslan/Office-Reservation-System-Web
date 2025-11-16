# 🏢 OFİS YÖNETİM SİSTEMİ - API SUNUMU (Yönetim Açısından)

---

## 📋 PROJE HAKKINDA HIZLI ÖZET

**İsim:** Ofis Yönetim Sistemi (Office Reservation System)
**Amaç:** Ofis masaları, meeting odaları ve kaynakları yönetmek için entegre bir platform
**Teknoloji Stack:**
- **Backend:** .NET 9 (C#) - Modern, güvenli, enterprise-grade
- **Database:** PostgreSQL - Açık kaynak, güçlü, enterprise-ready
- **Frontend:** React 19 + TypeScript - Modern UI/UX
- **API Mimarisi:** RESTful API + JWT Authentication

---

## 🏗️ BACKEND ARKİTEKTÜRÜ (Clean Architecture)

```
src/
├── API/              (REST API Controllers & Endpoints)
├── Application/      (Business Logic & Use Cases)
├── Infrastructure/   (Database, Authentication, External Services)
├── Domain/          (Core Business Rules & Entities)
└── Tests/           (Unit & Integration Tests)
```

### Neden Bu Yapı?
✅ **Ölçeklenebilirlik:** Kod büyüdükçe yönetimi kolay
✅ **Test Edilebilirlik:** Her katman bağımsız olarak test edilebilir
✅ **Bakım Kolaylığı:** Değişiklikleri izole şekilde yapabiliriz
✅ **Ekip Çalışması:** Geliştiriciler aynı kodu etkilemeden çalışabilir

---

## 🗄️ VERİTABANI YAPISI (PostgreSQL)

### Temel Tablolar:

```
1. USERS (Kullanıcılar)
   - Id, Email, PasswordHash, FirstName, LastName
   - Role (Employee, Manager, Admin)
   - Status (Active, Inactive, Suspended)
   - Departman, Telefon, Profil Resmi
   → 3 farklı role'e göre erişim kontrolü

2. LOCATIONS (İş Yerleri/Ofisler)
   - Id, Name, Address, City
   - Kapasite, Açık Saatler
   - 1 lokasyonda birden fazla Kat, Masa, Oda olabilir
   → Multi-lokasyon desteği

3. FLOORS (Katlar)
   - LocationId (Hangi lokasyonda?)
   - Floor Number, Harita
   - İçerisinde Masalar ve Odalar barındırır

4. DESKS (Masalar)
   - FloorId (Hangi katta?)
   - Desk Number, Kapasitesi
   - Status (Available, Occupied, Reserved)
   - Specifications (Monitör var mı, ek donanım vb.)

5. ROOMS (Meeting Odaları)
   - LocationId, Floor Number
   - Name, Kapasitesi
   - Equipment (Projeksiyön, Whiteboard vb.)
   - Resepsiyon, Çay/Kahve vb.

6. RESERVATIONS (Rezervasyonlar)
   - UserId, DeskId/RoomId
   - StartTime, EndTime
   - Status (Pending, Confirmed, Cancelled)
   - Approval gerektirse Manager onayı
   → Çakışma kontrollü sistem

7. CHECKINS (Giriş Kayıtları)
   - ReservationId
   - CheckinTime, CheckoutTime
   - QR Code ile otomatik check-in
   - Sanal olarak ofiste var mı diye takip

8. RULES (Kurallar & Politikalar)
   - Minimum rezervasyon süresi (ör: 30 dakika)
   - Maksimum rezervasyon süresi (ör: 8 saat)
   - İşletme saatleri
   - İzin/Tatil günleri

9. AUDITLOG (Sistem Denetim Günlüğü)
   - Kim, Ne, Ne Zaman yaptı?
   - Security & compliance için
   - Şüpheli aktiviteleri takip etmek

10. NOTIFICATIONS (Bildirimler)
    - UserId, Type, Message
    - IsRead (Okundu mu?)
    - CreatedAt
    → İn-app bildirim sistemi

11. QRTOKENS (QR Code Tokenları)
    - Token, ExpiresAt
    - Quick Check-in için
    - 15 dakika geçerli
```

### İlişkiler Haritası:
```
User ──── Reservations ──── Desk/Room
              │
              └──── CheckIns
              
Location ──── Floors ──── Desks
         └──── Rooms
         
Desk ──── Rules (Ofis kuralları)
Room ──── Rules
```

---

## 🔌 API ENDPOINTS (10 Modul)

### 1️⃣ AUTH (Kimlik Doğrulama)
```
POST   /api/auth/login          → Giriş yap (Email + Şifre)
POST   /api/auth/register       → Kayıt ol (Yeni kullanıcı)
POST   /api/auth/refresh-token  → Token yenile (Süresi dolmuş mu?)
POST   /api/auth/logout         → Çıkış yap
GET    /api/auth/me             → Profil bilgilerini getir
```
**Güvenlik:** JWT Token (24 saat geçerli) + Refresh Token (7 gün)

### 2️⃣ USERS (Kullanıcı Yönetimi)
```
GET    /api/users               → Tüm kullanıcıları listele (Admin only)
GET    /api/users/{id}          → Kullanıcı detayını getir
PUT    /api/users/{id}          → Kullanıcı bilgisini güncelle
DELETE /api/users/{id}          → Kullanıcıyı devre dışı bırak
PATCH  /api/users/{id}/role     → Role değiştir (Admin only)
```
**Roller:**
- 👨‍💼 **Employee:** Masa/oda rezerv edebilir, QR ile giriş yapabilir
- 👨‍💻 **Manager:** Takımının rezervasyonlarını onaylayabilir, takım yönetimi
- 👨‍⚖️ **Admin:** Sistemin tüm yönetimi

### 3️⃣ RESERVATIONS (Rezervasyon Sistemi)
```
GET    /api/reservations        → Mevcut rezervasyonları listele
GET    /api/reservations/{id}   → Rezervasyon detayı
POST   /api/reservations        → Yeni rezervasyon oluştur
PUT    /api/reservations/{id}   → Rezervasyonu güncelle
DELETE /api/reservations/{id}   → Rezervasyonu iptal et
GET    /api/reservations/availability/check
                                → Belirli zaman aralığında yer var mı?
POST   /api/reservations/{id}/approve    → Manager onayı
```
**Özellikler:**
- Çakışma kontrolü (aynı masaya 2 kişi reserve edemez)
- Kurallar kontrollü (süresi kurallara uygun mu?)
- Notification gönderme (Değişiklik olduğunda bildir)

### 4️⃣ LOCATIONS (İş Yerleri Yönetimi)
```
GET    /api/locations           → Tüm lokasyonları listele
GET    /api/locations/{id}      → Lokasyon detayı & istatistikleri
POST   /api/locations           → Yeni lokasyon ekle (Admin)
PUT    /api/locations/{id}      → Lokasyonu güncelle (Admin)
DELETE /api/locations/{id}      → Lokasyonu sil (Admin)
GET    /api/locations/{id}/stats → Lokasyon istatistikleri
                                  (Kaç masa dolu, boş vb.)
```

### 5️⃣ DESKS & ROOMS (Masa ve Oda Yönetimi)
```
GET    /api/desks               → Masaları listele
GET    /api/desks/{id}          → Masa detayı
POST   /api/desks               → Yeni masa ekle (Admin)
PUT    /api/desks/{id}          → Masa bilgisini güncelle
DELETE /api/desks/{id}          → Masayı sil

GET    /api/rooms               → Odaları listele
GET    /api/rooms/{id}          → Oda detayı
POST   /api/rooms               → Yeni oda ekle (Admin)
PUT    /api/rooms/{id}          → Oda bilgisini güncelle
DELETE /api/rooms/{id}          → Odayı sil
```

### 6️⃣ CHECKINS (Giriş/Çıkış Yönetimi)
```
POST   /api/checkins            → Check-in yap (QR ile)
POST   /api/checkins/{id}/checkout → Check-out yap
GET    /api/checkins            → Check-in geçmişi
```
**Akış:**
1. Kullanıcı QR kodu tarar
2. Sistem otomatik olarak check-in kaydı oluşturur
3. İşten ayrılırken check-out yapar
4. Zamanlama verileri saklanır

### 7️⃣ ANALYTICS (İstatistikler & Raporlar)
```
GET    /api/analytics/dashboard → Ana dashboard verileri
                                (Dolu masalar, trend vb.)
GET    /api/analytics/usage     → Kullanım istatistikleri
GET    /api/analytics/occupancy → İşgal oranları
GET    /api/analytics/reports   → Detaylı raporlar
                                (PDF/CSV export)
```
**Gösterilen Metrikleri:**
- Günlük/Haftalık/Aylık kullanım
- En çok kullanılan masalar
- Peak hours (En yoğun saatler)
- Employee aktiviteleri

### 8️⃣ NOTIFICATIONS (Bildirim Sistemi)
```
GET    /api/notifications       → Bildirimleri listele
GET    /api/notifications/unread → Okunmamış bildirimleri
PUT    /api/notifications/{id}/read → Bildirimi oku işaretle
DELETE /api/notifications/{id}  → Bildirimi sil
```

### 9️⃣ LOGS (Sistem Denetim Günlüğü)
```
GET    /api/logs                → Sistem faaliyetlerini listele (Admin)
GET    /api/logs/user/{id}      → Kullanıcının aktiviteleri
GET    /api/logs/export         → Denetim raporunu indir (PDF/CSV)
```
**Kaydedilen İşlemler:**
- Kim giriş/çıkış yaptı
- Kim rezervasyon oluşturdu
- Kim rule değiştirdi
- Kim kullanıcı sildikten sonra geri yüklemeli iş

### 🔟 RULES (Kural Yönetimi)
```
GET    /api/rules               → Kuralları listele
GET    /api/rules/{id}          → Kural detayı
POST   /api/rules               → Yeni kural ekle (Admin)
PUT    /api/rules/{id}          → Kural güncelle (Admin)
DELETE /api/rules/{id}          → Kural sil (Admin)
```
**Yönetilebilir Kurallar:**
- Minimum/maksimum rezervasyon süresi
- Günlük maksimum rezervasyon adedi
- İzin günleri
- İşletme saatleri

---

## 🔐 GÜVENLİK ÖNLEMLERİ

### 1. Kimlik Doğrulama (Authentication)
- ✅ JWT Token tabanlı (Stateless)
- ✅ Password hashing (Bcrypt/Argon2)
- ✅ Token expiration (24 saat)
- ✅ Refresh token mekanizması

### 2. Yetkilendirme (Authorization)
- ✅ Role-based access control (RBAC)
  - Employee: Kendi rezervasyonları görebilir
  - Manager: Takımının tüm verileri
  - Admin: Sistemin tüm verileri
- ✅ Resource-level authorization (Başkasının verisine erişim yasağı)

### 3. Veri Güvenliği
- ✅ HTTPS zorunlu (production'da)
- ✅ CORS policy konfigürasyonu
- ✅ Input validation (Geçersiz veri kabul etme)
- ✅ SQL injection koruması (Parameterized queries)

### 4. Audit Trail (Denetim İzleri)
- ✅ Her işlem kaydediliyor (Kim, Ne, Ne Zaman?)
- ✅ Silinen veri kurtarma mövenibiliyeti
- ✅ Compliance raporları (Yasal gereklilikler)

---

## 📊 VERITABANI MİGRASYONLARI

Entity Framework Core kullanılıyor:

```
Migration 1: InitialCreate (Başlangıç)
  - Tüm tablolar ve ilişkiler oluşturuldu
  
Migration 2: UpdateModel (Gelişmeler)
  - Yeni alanlar eklendi
  - İlişkiler iyileştirildi
```

**Avantajları:**
- ✅ Kod tarafından database kontrol ediliyor (Code-first)
- ✅ Version control'de database değişiklikleri var
- ✅ Rollback yapılabilir (Eski versiyona dönülebilir)

---

## 🚀 API TESTING (Swagger)

**URL:** `http://localhost:5000/swagger/index.html`

**Özellikler:**
- ✅ İnteraktif API test arayüzü
- ✅ Tüm endpoint'ler dokümante ediliyor
- ✅ Request/Response örnekleri
- ✅ JWT token test desteği

---

## 📈 DEPLOYMENT & PRODUCTION

### Ortamlar:
1. **Development:** localhost:5000
2. **Staging:** test sunucusu
3. **Production:** Gerçek sunucu

### Docker Support:
```dockerfile
Dockerfile ve docker-compose.yml var
→ Tüm stack'i containerize edilebilir
```

---

## ✅ TAMAMLANAN ÖZELLİKLER

- ✅ Database tasarımı ve migration'ları
- ✅ 10 ana modül API endpoints
- ✅ JWT authentication sistemi
- ✅ Role-based authorization
- ✅ Reservation çakışma kontrolü
- ✅ Audit logging sistemi
- ✅ Analytics & reporting
- ✅ Notification sistemi
- ✅ QR token sistemi
- ✅ Swagger documentation

---

## 🔄 BACKEND-FRONTEND ENTEGRASYONU

### Current Status:
- ✅ Frontend: React UI tamamen tasarlanmış & bileşenleri var
- ✅ Backend: API endpoints hazır
- ⏳ Integration: Mock data ile test ediliyor

### Sonraki Aşama:
1. Frontend'i gerçek API'ye bağla
2. Mock data'yı kaldır
3. End-to-end testing yap
4. Performance optimization
5. Production deployment

---

## 📞 İLETİŞİM (API Çağrıları Örneği)

### Login (Giriş Yap)
```bash
POST http://localhost:5000/api/auth/login
Body: {
  "email": "user@example.com",
  "password": "securePassword123"
}
Response: {
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "refresh_token_here",
  "user": { "id": "1", "email": "user@example.com", "role": "Employee" }
}
```

### Rezervasyon Oluştur
```bash
POST http://localhost:5000/api/reservations
Headers: Authorization: Bearer <token>
Body: {
  "deskId": "desk-123",
  "startTime": "2024-11-17T09:00:00",
  "endTime": "2024-11-17T17:00:00"
}
Response: {
  "id": "res-456",
  "status": "Pending",
  "message": "Rezervasyon başarıyla oluşturuldu"
}
```

### Mevcudiyet Kontrolü
```bash
GET http://localhost:5000/api/reservations/availability/check?deskId=desk-123&date=2024-11-17
Response: {
  "isAvailable": true,
  "availableSlots": [
    { "startTime": "09:00", "endTime": "10:00" },
    { "startTime": "10:00", "endTime": "11:00" },
    // ... daha fazla zaman aralığı
  ]
}
```

---

## 🎯 ÖZET (Executive Summary)

**Ne İnşa Ettik?**
- Enterprise-grade ofis yönetim sistemi
- Modern, güvenli, ölçeklenebilir architecture
- Tam integre çözüm (Users, Reservations, Analytics, Security)

**Neden Bu Sistem?**
- ✅ Ofis kaynaklarının verimli kullanımı
- ✅ Çatışmaların otomatik çözülmesi
- ✅ Raporlama ve analytics
- ✅ Denetim ve uyum (Compliance)

**Hazırlık Durumu:**
- ✅ Backend: Production-ready
- ✅ Frontend: UI tamamlanmış
- ⏳ Integration: İlerlemede

---

