# Deployment Talimatları

## 1. Frontend Ayarları

### Environment Değişkenleri (`frontend/.env`)
```env
# Development
REACT_APP_API_URL=http://localhost:5000

# Production - BUNU DEĞİŞTİRİN
REACT_APP_API_URL=https://your-production-backend-url.com
```

### Build Alma
```bash
# Normal build
npm run build

# Ya da direkt URL belirterek
REACT_APP_API_URL=https://your-production-backend-url.com npm run build
```

## 2. Backend Ayarları

### Environment Değişkenleri (`backend/.env`)
```env
# Supabase Ayarları - BUNLARI DEĞİŞTİRİN
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-key

# Flask Secret Key - BUNU DEĞİŞTİRİN (Güvenli bir şekilde)
FLASK_SECRET_KEY=generate-a-secure-random-key

# Admin Bilgileri - BUNLARI DEĞİŞTİRİN
ADMIN_USERNAME=your-admin-username
ADMIN_PASSWORD=your-secure-admin-password

# Güvenlik Ayarları
ALLOWED_ORIGINS=https://your-frontend-domain.com  # Frontend domain'inizi ekleyin
SESSION_LIFETIME_HOURS=1
MAX_LOGIN_ATTEMPTS=5
LOGIN_BLOCK_TIME=300
```

## 3. Güvenlik Kontrol Listesi

### Frontend
- [ ] `.env` dosyası `.gitignore`'da
- [ ] Production API URL'i doğru ayarlandı
- [ ] HTTPS kullanılıyor
- [ ] Build optimizasyonları yapıldı

### Backend
- [ ] `.env` dosyası `.gitignore`'da
- [ ] Güçlü ve benzersiz `FLASK_SECRET_KEY` oluşturuldu
- [ ] Güçlü admin şifresi belirlendi
- [ ] `ALLOWED_ORIGINS` sadece gerçek frontend domain'ini içeriyor
- [ ] HTTPS sertifikası kuruldu
- [ ] Rate limiting aktif
- [ ] Session güvenliği ayarları kontrol edildi
- [ ] Supabase anahtarları production için güncellendi

## 4. Deployment Adımları

1. Backend Deployment:
   - Python bağımlılıklarını yükleyin: `pip install -r requirements.txt`
   - `.env` dosyasını production değerleriyle güncelleyin
   - WSGI sunucusu kurun (örn: Gunicorn)
   - HTTPS için SSL sertifikası alın
   - Nginx veya benzeri bir reverse proxy kurun

2. Frontend Deployment:
   - `.env` dosyasını production değerleriyle güncelleyin
   - Bağımlılıkları yükleyin: `npm install`
   - Production build alın: `npm run build`
   - Build klasörünü web sunucusuna yükleyin
   - HTTPS yapılandırmasını tamamlayın

## 5. Önemli Notlar

1. Güvenlik:
   - Production ortamında debug modu kapalı olmalı
   - Tüm secret ve API key'ler environment değişkenlerinde saklanmalı
   - Regular security updates yapılmalı
   - Düzenli yedekleme planı olmalı

2. Performance:
   - Frontend statik dosyaları CDN üzerinden servis edilmeli
   - Backend için caching mekanizmaları kullanılmalı
   - Database indexleri optimize edilmeli

3. Monitoring:
   - Error logging sistemi kurulmalı
   - Performance monitoring yapılmalı
   - Uptime monitoring ayarlanmalı

## 6. Sık Karşılaşılan Sorunlar

1. CORS Hataları:
   - `ALLOWED_ORIGINS` doğru ayarlandığından emin olun
   - Frontend URL'inin protokol dahil tam olarak eşleştiğini kontrol edin

2. Session/Cookie Sorunları:
   - HTTPS kullanıldığından emin olun
   - Domain ayarlarının doğru olduğunu kontrol edin

3. Upload Sorunları:
   - Dosya boyutu limitlerini kontrol edin
   - Storage permissions'ları kontrol edin

## 7. Yararlı Komutlar

```bash
# Backend status kontrolü
curl https://your-backend-url.com/api/health

# Frontend build ve deploy
npm run build
npm run deploy

# Logs kontrol
tail -f /var/log/nginx/error.log
tail -f /var/log/application.log
``` 