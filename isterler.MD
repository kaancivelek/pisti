# 📘 RECIPE MANAGEMENT SYSTEM (RMS)
## Yazılım Proje Dokümanı

---

# 1. 📌 Proje Tanımı

**Proje Adı:** Recipe Management System (RMS)  
**Tür:** Single-user web-based application (offline-first destekli)  
**Amaç:** Kullanıcının ~8000 tariften oluşan veri setini yönetmesini, aramasını, filtrelemesini ve yazdırmasını sağlayan yüksek performanslı ve kullanıcı dostu bir sistem geliştirmek.

---

# 2. 🎯 Hedefler

- CRUD işlemleri (Create, Read, Update, Delete)
- Gelişmiş arama & filtreleme (multi-stage filtering)
- Responsive UI (PC, tablet, mobil)
- Print-friendly çıktılar (tam tarif + label formatı)
- 8000 kayıt için optimize performans
- Basit ama güvenli erişim
- Backup & restore mekanizması

---

# 3. 👤 Kullanıcı Profili

- Tek kullanıcı (çift erişim: kullanıcı + eşi)
- Teknik olmayan kullanıcı
- Basit ve sezgisel arayüz beklentisi

---

# 4. 🧱 Sistem Mimarisi

## 4.1 Genel Mimari

- **Frontend:** React (Next.js önerilir)
- **Backend:** Node.js (Express veya Next API Routes)
- **Database:** PostgreSQL
- **Storage:** Local file system veya cloud (image URL destekli)

## 4.2 Alternatif (Daha düşük maliyetli)

- Backend + DB: Supabase veya Firebase
- Hosting: Vercel / Netlify

---

# 5. 🗄️ Veri Modeli

## 5.1 Recipe Tablosu

| Alan | Tip | Açıklama |
|------|-----|---------|
| id | UUID | Primary Key |
| name | TEXT | Tarif adı |
| description | TEXT | Açıklama |
| ingredients | TEXT | Malzemeler |
| instructions | TEXT | Yapılış |
| category | TEXT | Kategori |
| prep_time | INT | Hazırlık süresi |
| cook_time | INT | Pişirme süresi |
| total_time | INT | Toplam süre |
| servings | INT | Porsiyon |
| tags | TEXT[] | Etiketler |
| image_url | TEXT | Görsel |
| heating_instructions | TEXT | Isıtma talimatı |
| created_at | TIMESTAMP | Oluşturma tarihi |
| updated_at | TIMESTAMP | Güncelleme |

---

# 6. 🔍 Fonksiyonel Gereksinimler

## 6.1 CRUD

- Tarif ekleme (form tabanlı)
- Tarif güncelleme
- Tarif silme (soft delete önerilir)

## 6.2 Arama & Filtreleme

- Full-text search
- Çoklu filtre:
  - kategori
  - süre
  - etiket
- **Drill-down filtering**
  - İlk sonuç → ek filtre uygulanabilir

## 6.3 Listeleme

- Pagination veya infinite scroll
- 8000 kayıt optimize edilmelidir

## 6.4 Görsel Yönetimi

- URL veya local path desteği
- Thumbnail + full view

## 6.5 Yazdırma

### 1. Full Recipe Print
- Başlık
- Görsel
- Malzemeler
- Talimatlar

### 2. Label Print (2x4 inch)
- Tarif adı
- Kısa açıklama
- Isıtma talimatı

---

# 7. 📱 Responsive Tasarım

Desteklenen cihazlar:

- Windows 11 PC
- Android telefon (Samsung S25+)
- Android tablet (Galaxy Tab S9 FE)

## UI Davranışı

- Mobile: tek kolon
- Tablet: 2 kolon
- Desktop: grid + sidebar

---

# 8. 🔐 Güvenlik

- Basit authentication:
  - Email + password
- Alternatif:
  - Magic link (Supabase)

- Yetkilendirme:
  - Tek kullanıcı rolü

---

# 9. ⚡ Performans Gereksinimleri

- 8000 kayıt < 1 saniye listeleme
- Arama < 500ms
- Lazy loading images
- Indexed DB alanları:
  - name
  - tags
  - category

---

# 10. 💾 Veri Yükleme (Seeding)

- CSV import desteği
- Mapping UI (opsiyonel)
- Batch insert (optimize)

---

# 11. 🔄 Backup & Restore

## Backup

- JSON export
- CSV export

## Restore

- Import file
- DB overwrite veya merge

---

# 12. 🧪 Test Stratejisi

## Functional Tests
- CRUD testleri
- Arama doğruluğu

## Performance Tests
- 8000 kayıt yük testi

## UI Tests
- Responsive test
- Print preview

---

# 13. 🚀 Deployment

## Önerilen Stack

| Katman | Teknoloji |
|--------|----------|
| Frontend | Next.js |
| Backend | Node.js |
| DB | MongoDB |
| Hosting | Vercel |


---

# 14. 💰 Maliyet Optimizasyonu

- Free tier kullanılabilir
- Görseller için CDN önerilir
- Serverless tercih edilmeli

---

# 15. 📦 Ek Özellikler (Opsiyonel)

- Favoriler
- Tarif puanlama
- AI öneri sistemi
- Meal planning

---

# 16. 🧭 Geliştirme Planı

## Faz 1
- DB tasarımı
- CRUD API

## Faz 2
- UI geliştirme
- Listeleme & filtre

## Faz 3
- Print sistemi
- Responsive iyileştirme

## Faz 4
- Backup & restore
- Performans optimizasyonu

---

# 17. 📊 Riskler

| Risk | Çözüm |
|------|------|
| 8000 kayıt performansı | indexing + pagination |
| Print uyumsuzluğu | CSS print media |
| Veri kaybı | düzenli backup |

---

# 18. 📌 Sonuç

Bu sistem:

- Küçük ama ölçeklenebilir
- Düşük maliyetli
- Yüksek performanslı
- Kullanıcı dostu

bir tarif yönetim çözümü sunar.