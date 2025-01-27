from flask import Flask, jsonify, request, send_file, session
from flask_cors import CORS
import json
import os
from functools import wraps
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename
from supabase import create_client, Client
from dotenv import load_dotenv
import mimetypes
import uuid
import re
import httpx
from postgrest import APIError
from datetime import timedelta
import time



# Sabit değişkenler
SUPABASE_URL="https://xhfvyuxpinqulphqftnm.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoZnZ5dXhwaW5xdWxwaHFmdG5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4Mjg0OTMsImV4cCI6MjA1MzQwNDQ5M30.4W4K4EReQDPgdbNMhDc8KNblhL9x7XEpEmVAYCHtY0s"
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoZnZ5dXhwaW5xdWxwaHFmdG5tIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzgyODQ5MywiZXhwIjoyMDUzNDA0NDkzfQ.J8RB1oei09yAHBLi4oGL7iktMLGRGeEmoLKK823w4fk"
FLASK_SECRET_KEY="c9d83j4k2l1m5n6p7q8r9s0t1u2v3w4x5y6z7"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123"

# Güvenlik Ayarları
ALLOWED_ORIGINS="http://localhost:3000,https://of-course-five.vercel.app"
SESSION_LIFETIME_HOURS=1
MAX_LOGIN_ATTEMPTS=5
LOGIN_BLOCK_TIME=300
BASE_URL = "https://ayxanmammadov.pythonanywhere.com"

# Supabase bağlantıları
service_supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
public_supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

app = Flask(__name__)
app.secret_key = FLASK_SECRET_KEY

# Session güvenlik ayarları
app.config.update(
    SESSION_COOKIE_SECURE=True,
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE='Lax',
    PERMANENT_SESSION_LIFETIME=timedelta(hours=1)
)

# CORS ayarları
CORS(app, resources={
    r"/api/*": {
        "origins": ALLOWED_ORIGINS.split(','),
        "supports_credentials": True,
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Rate limiting için sayaç
login_attempts = {}
MAX_ATTEMPTS = 5
BLOCK_TIME = 300  # 5 dakika

def handle_supabase_error(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except APIError as e:
            print(f"Supabase API hatası: {str(e)}")
            return jsonify({'error': 'Veritabanı işlemi başarısız'}), 500
        except httpx.HTTPError as e:
            print(f"HTTP hatası: {str(e)}")
            return jsonify({'error': 'Ağ hatası oluştu'}), 500
        except Exception as e:
            print(f"Beklenmeyen hata: {str(e)}")
            return jsonify({'error': 'Bir hata oluştu'}), 500
    return wrapper

def camel_to_snake(name):
    name = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
    return re.sub('([a-z0-9])([A-Z])', r'\1_\2', name).lower()

def snake_to_camel(name):
    components = name.split('_')
    return components[0] + ''.join(x.title() for x in components[1:])

def convert_keys_to_snake_case(data):
    if isinstance(data, dict):
        new_dict = {}
        for key, value in data.items():
            new_key = camel_to_snake(key)
            new_dict[new_key] = convert_keys_to_snake_case(value)
        return new_dict
    elif isinstance(data, list):
        return [convert_keys_to_snake_case(item) for item in data]
    return data

def convert_keys_to_camel_case(data):
    if isinstance(data, dict):
        new_dict = {}
        for key, value in data.items():
            new_key = snake_to_camel(key)
            new_dict[new_key] = convert_keys_to_camel_case(value)
        return new_dict
    elif isinstance(data, list):
        return [convert_keys_to_camel_case(item) for item in data]
    return data

def prepare_course_data(data):
    try:
        # Frontend'den gelen veriyi snake_case'e çevir
        course_data = convert_keys_to_snake_case(data)
        
        # Varsayılan değerleri ayarla
        defaults = {
            'topics': [],
            'tags': [],
            'contact': {},
            'purchase_count': 0,
            'rating': 0
        }
        
        for key, default_value in defaults.items():
            if key not in course_data:
                course_data[key] = default_value
            
        # Rating değerini kontrol et ve sınırla (0-5 arası)
        if 'rating' in course_data:
            try:
                rating = float(course_data['rating'])
                course_data['rating'] = max(0, min(5, rating))
            except (ValueError, TypeError):
                course_data['rating'] = 0
            
        # Otomatik oluşturulan alanları kaldır
        auto_fields = ['id', 'created_at']
        for field in auto_fields:
            if field in course_data:
                del course_data[field]
            
        return course_data
    except Exception as e:
        print(f"Veri hazırlama hatası: {str(e)}")
        raise

# Admin kullanıcı bilgileri
ADMIN_CREDENTIALS = {
    'username': ADMIN_USERNAME,
    'password': generate_password_hash(ADMIN_PASSWORD)
}

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('admin_logged_in'):
            return jsonify({'error': 'Unauthorized'}), 401
        return f(*args, **kwargs)
    return decorated_function

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        # IP adresini al
        ip = request.remote_addr
        
        # Rate limiting kontrolü
        current_time = time.time()
        if ip in login_attempts:
            attempts, block_until = login_attempts[ip]
            if current_time < block_until:
                return jsonify({'error': 'Too many attempts. Try again later.'}), 429
            if current_time - block_until > BLOCK_TIME:
                login_attempts[ip] = (0, 0)
            
        # Login denemelerini kontrol et
        attempts = login_attempts.get(ip, (0, 0))[0]
        if attempts >= MAX_ATTEMPTS:
            login_attempts[ip] = (attempts, current_time)
            return jsonify({'error': 'Too many attempts. Try again later.'}), 429
            
        if username == ADMIN_CREDENTIALS['username'] and check_password_hash(ADMIN_CREDENTIALS['password'], password):
            session.clear()  # Önceki session'ı temizle
            session['admin_logged_in'] = True
            session.permanent = True  # Session süresini aktif et
            
            # Session'ı kaydet
            session.modified = True
            
            # Başarılı girişte deneme sayısını sıfırla
            if ip in login_attempts:
                login_attempts.pop(ip)
                
            response = jsonify({'message': 'Login successful', 'authenticated': True})
            return response
            
        # Başarısız giriş denemesi
        attempts += 1
        login_attempts[ip] = (attempts, current_time if attempts >= MAX_ATTEMPTS else 0)
        return jsonify({'error': 'Invalid credentials', 'authenticated': False}), 401
        
    except Exception as e:
        print(f"Login hatası: {str(e)}")
        return jsonify({'error': 'Login işlemi başarısız', 'authenticated': False}), 500

@app.route('/api/admin/logout', methods=['POST'])
def admin_logout():
    session.pop('admin_logged_in', None)
    return jsonify({'message': 'Logout successful'})

@app.route('/api/admin/check-auth', methods=['GET'])
def check_auth():
    return jsonify({'authenticated': session.get('admin_logged_in', False)})

def upload_file_to_storage(file, bucket_name):
    if not file:
        return None
        
    try:
        # Dosya türünü belirle
        mime_type, _ = mimetypes.guess_type(file.filename)
        if not mime_type:
            # PDF için özel kontrol
            if file.filename.lower().endswith('.pdf'):
                mime_type = 'application/pdf'
            else:
                mime_type = 'application/octet-stream'
        
        # Benzersiz dosya adı oluştur
        file_ext = os.path.splitext(file.filename)[1]
        unique_filename = f"{str(uuid.uuid4())}{file_ext}"
        
        # Dosyayı Supabase Storage'a yükle
        file_content = file.read()
        result = service_supabase.storage.from_(bucket_name).upload(
            unique_filename,
            file_content,
            file_options={
                "contentType": mime_type,
                "cacheControl": "3600"
            }
        )
        
        # Public URL oluştur
        public_url = f"{SUPABASE_URL}/storage/v1/object/public/{bucket_name}/{unique_filename}"
        return public_url
        
    except Exception as e:
        print(f"Dosya yükleme hatası: {str(e)}")
        return None

@app.route('/api/admin/courses', methods=['POST'])
@admin_required
@handle_supabase_error
def add_course():
    try:
        # Frontend'den gelen veriyi al ve hazırla
        if 'courseData' in request.form:
            course_data = json.loads(request.form.get('courseData'))
        else:
            course_data = request.get_json()
            
        if not course_data:
            return jsonify({'error': 'Geçersiz veri formatı'}), 415
            
        # Veriyi hazırla
        course_data = prepare_course_data(course_data)
            
        # Dosyaları yükle
        if request.files:
            if 'image' in request.files:
                image_url = upload_file_to_storage(request.files['image'], 'images')
                if image_url:
                    course_data['image'] = image_url
                    
            if 'downloadFile' in request.files:
                download_url = upload_file_to_storage(request.files['downloadFile'], 'downloads')
                if download_url:
                    course_data['download_url'] = download_url
        
        # Kursu veritabanına ekle (service role ile)
        result = service_supabase.table('courses').insert(course_data).execute()
        
        # Yanıtı camelCase'e çevir
        response_data = convert_keys_to_camel_case(result.data[0])
        return jsonify({'message': 'Course added successfully', 'course': response_data})
        
    except Exception as e:
        print('Hata:', str(e))
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/courses/<int:course_id>', methods=['PUT', 'DELETE'])
@admin_required
@handle_supabase_error
def manage_course(course_id):
    try:
        if request.method == 'DELETE':
            # Kursu sil (service role ile)
            result = service_supabase.table('courses').delete().eq('id', course_id).execute()
            if result.data:
                # Yanıtı camelCase'e çevir
                response_data = convert_keys_to_camel_case(result.data[0])
                return jsonify({'message': 'Course deleted successfully', 'course': response_data})
            return jsonify({'error': 'Course not found'}), 404
            
        elif request.method == 'PUT':
            # Frontend'den gelen veriyi al
            if 'courseData' in request.form:
                course_data = json.loads(request.form.get('courseData'))
            else:
                course_data = request.get_json()
            
            if not course_data:
                return jsonify({'error': 'Geçersiz veri formatı'}), 415
                
            # Veriyi hazırla
            course_data = prepare_course_data(course_data)
                
            # Mevcut kursu al
            existing_course = public_supabase.table('courses').select('*').eq('id', course_id).execute()
            if not existing_course.data:
                return jsonify({'error': 'Course not found'}), 404
                
            # Dosyaları güncelle
            if request.files:
                if 'image' in request.files:
                    image_url = upload_file_to_storage(request.files['image'], 'images')
                    if image_url:
                        course_data['image'] = image_url
                        
                if 'downloadFile' in request.files:
                    download_url = upload_file_to_storage(request.files['downloadFile'], 'downloads')
                    if download_url:
                        course_data['download_url'] = download_url
            
            # Kursu güncelle (service role ile)
            result = service_supabase.table('courses').update(course_data).eq('id', course_id).execute()
            
            # Yanıtı camelCase'e çevir
            response_data = convert_keys_to_camel_case(result.data[0])
            return jsonify({'message': 'Course updated successfully', 'course': response_data})
            
    except Exception as e:
        print('Hata:', str(e))
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/remove-discounts', methods=['POST'])
@admin_required
@handle_supabase_error
def remove_discounts():
    try:
        data = request.get_json()
        course_ids = data.get('courseIds', [])
        
        if not course_ids:
            return jsonify({'error': 'Kurs ID\'leri gerekli'}), 400
            
        # İndirimleri kaldır (service role ile)
        result = service_supabase.table('courses').update({'discounted_price': None}).in_('id', course_ids).execute()
        
        return jsonify({'message': 'İndirimler başarıyla kaldırıldı'})
        
    except Exception as e:
        print('Hata:', str(e))
        return jsonify({'error': str(e)}), 500

@app.route('/api/courses', methods=['GET'])
@handle_supabase_error
def get_courses():
    try:
        search = request.args.get('search', '').lower()
        categories = request.args.getlist('category')
        levels = request.args.getlist('level')
        tags = request.args.getlist('tags')
        discount_filter = request.args.get('discount', 'all')
        
        # Temel sorgu
        query = public_supabase.table('courses').select('*')
        
        # Filtreleri uygula
        if categories and 'all' not in categories:
            query = query.in_('category', categories)
            
        if levels and 'all' not in levels:
            level_list = []
            for level in levels:
                if level.lower() == 'beginner':
                    level_list.append('Beginner')
                elif level.lower() == 'intermediate':
                    level_list.append('Intermediate')
                elif level.lower() == 'advanced':
                    level_list.append('Advanced')
            if level_list:
                query = query.in_('level', level_list)
            
        if tags:
            # Tag'ler için OR mantığı kullan
            tag_conditions = []
            for tag in tags:
                tag_conditions.append(f'"{tag.lower()}"')
            # Herhangi bir tag'i içeren kursları getir
            query = query.filter('tags', 'ov', '{' + ','.join(tag_conditions) + '}')
            
        if discount_filter == 'discounted':
            query = query.not_.is_('discounted_price', 'null')
        elif discount_filter == 'non-discounted':
            query = query.is_('discounted_price', 'null')
            
        # Arama filtresini uygula
        if search:
            all_results = []
            
            # İlk sorgu - başlıkta ara
            title_query = query.filter('title', 'ilike', f'%{search}%').execute()
            all_results.extend(title_query.data)
            
            # İkinci sorgu - açıklamada ara
            description_query = public_supabase.table('courses').select('*')
            # Önceki filtreleri tekrar uygula
            if categories and 'all' not in categories:
                description_query = description_query.in_('category', categories)
            if levels and 'all' not in levels:
                if level_list:
                    description_query = description_query.in_('level', level_list)
            if tags:
                description_query = description_query.filter('tags', 'ov', '{' + ','.join(tag_conditions) + '}')
            if discount_filter == 'discounted':
                description_query = description_query.not_.is_('discounted_price', 'null')
            elif discount_filter == 'non-discounted':
                description_query = description_query.is_('discounted_price', 'null')
                
            description_query = description_query.filter('description', 'ilike', f'%{search}%').execute()
            all_results.extend(description_query.data)
            
            # Üçüncü sorgu - topics araması
            topics_query = public_supabase.table('courses').select('*')
            # Önceki filtreleri tekrar uygula
            if categories and 'all' not in categories:
                topics_query = topics_query.in_('category', categories)
            if levels and 'all' not in levels:
                if level_list:
                    topics_query = topics_query.in_('level', level_list)
            if tags:
                topics_query = topics_query.filter('tags', 'ov', '{' + ','.join(tag_conditions) + '}')
            if discount_filter == 'discounted':
                topics_query = topics_query.not_.is_('discounted_price', 'null')
            elif discount_filter == 'non-discounted':
                topics_query = topics_query.is_('discounted_price', 'null')
                
            topics_query = topics_query.filter('topics', 'cs', '{' + search + '}').execute()
            all_results.extend(topics_query.data)
            
            # Dördüncü sorgu - tags araması
            tags_query = public_supabase.table('courses').select('*')
            # Önceki filtreleri tekrar uygula
            if categories and 'all' not in categories:
                tags_query = tags_query.in_('category', categories)
            if levels and 'all' not in levels:
                if level_list:
                    tags_query = tags_query.in_('level', level_list)
            if tags:
                tags_query = tags_query.filter('tags', 'ov', '{' + ','.join(tag_conditions) + '}')
            if discount_filter == 'discounted':
                tags_query = tags_query.not_.is_('discounted_price', 'null')
            elif discount_filter == 'non-discounted':
                tags_query = tags_query.is_('discounted_price', 'null')
                
            tags_query = tags_query.filter('tags', 'cs', '{' + search + '}').execute()
            all_results.extend(tags_query.data)
            
            # Tekrar eden sonuçları kaldır
            unique_results = {course['id']: course for course in all_results}.values()
            
            # URL'leri düzelt
            response_data = convert_keys_to_camel_case(list(unique_results))
            for course in response_data:
                if 'image' in course and not course['image'].startswith('http'):
                    course['image'] = f"{SUPABASE_URL}/storage/v1/object/public/images/{course['image'].split('/')[-1]}"
                if 'downloadUrl' in course and not course['downloadUrl'].startswith('http'):
                    course['downloadUrl'] = f"{SUPABASE_URL}/storage/v1/object/public/downloads/{course['downloadUrl'].split('/')[-1]}"
            
            return jsonify(response_data)
            
        # Normal sorgu devam ediyor
        result = query.execute()
        
        # Yanıtı camelCase'e çevir ve URL'leri düzelt
        response_data = convert_keys_to_camel_case(result.data)
        for course in response_data:
            if 'image' in course and not course['image'].startswith('http'):
                course['image'] = f"{SUPABASE_URL}/storage/v1/object/public/images/{course['image'].split('/')[-1]}"
            if 'downloadUrl' in course and not course['downloadUrl'].startswith('http'):
                course['downloadUrl'] = f"{SUPABASE_URL}/storage/v1/object/public/downloads/{course['downloadUrl'].split('/')[-1]}"
        
        return jsonify(response_data)
        
    except Exception as e:
        print(f"Error getting courses: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/categories', methods=['GET'])
@handle_supabase_error
def get_categories():
    try:
        result = public_supabase.table('courses').select('category').execute()
        categories = sorted(list(set(course['category'] for course in result.data)))
        categories.insert(0, 'all')
        return jsonify(categories)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/tags', methods=['GET'])
@handle_supabase_error
def get_tags():
    try:
        result = public_supabase.table('courses').select('tags').execute()
        tags = sorted(list(set(tag for course in result.data for tag in course['tags'])))
        return jsonify(tags)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/courses/<int:course_id>', methods=['GET'])
@handle_supabase_error
def get_course(course_id):
    try:
        result = public_supabase.table('courses').select('*').eq('id', course_id).execute()
        if result.data:
            # Yanıtı camelCase'e çevir
            response_data = convert_keys_to_camel_case(result.data[0])
            return jsonify(response_data)
        return jsonify({'error': 'Kurs bulunamadı'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/download/<int:course_id>', methods=['GET'])
@handle_supabase_error
def download_course_file(course_id):
    try:
        # Kursu bul
        result = public_supabase.table('courses').select('*').eq('id', course_id).execute()
        if not result.data:
            return jsonify({'error': 'Kurs bulunamadı'}), 404

        course = result.data[0]
        download_url = course.get('download_url')
        
        if not download_url:
            return jsonify({'error': 'Bu kurs için indirilebilir dosya bulunmuyor'}), 404

        # Supabase Storage URL'sini doğrula
        if not download_url.startswith(SUPABASE_URL):
            # Tam URL'yi oluştur
            bucket_name = 'downloads'
            file_path = download_url.split('/')[-1]  # URL'den dosya adını al
            download_url = f"{SUPABASE_URL}/storage/v1/object/public/{bucket_name}/{file_path}"

        return jsonify({'download_url': download_url})
        
    except Exception as e:
        print(f"Dosya indirme hatası: {str(e)}")
        return jsonify({'error': 'Dosya indirilemedi'}), 500

if __name__ == '__main__':
    app.run(debug=True)