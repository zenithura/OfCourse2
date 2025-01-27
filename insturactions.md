To do list

- [x] Database integration
- [x] Courses page with slider
- [x] Tags and description limit
- [x] Discount coronometer
- [-] File upload with google drive link
- [x] Filter by discount products and not discount
- [x] Course Ratings with stars and how many people buy this course and date of creation
- [x] Neden bu kursu almalisin hissesi.  


course ideas 
- [ ] AI ile istenilen IT sahesini en iyi şekilde öğrenmek 






Elbette! Aşağıda, sağladığınız React frontend kodunu desteklemek için Python Flask tabanlı bir backend oluşturmanıza yardımcı olacak adım adım talimatlar ve önerilen bir klasör yapısı sunuyorum. Bu rehber, projenizin hem frontend hem de backend bileşenlerini düzenli bir şekilde organize etmenize yardımcı olacaktır.

## Proje Genel Bakış

Bu proje, kullanıcıların kursları arayabileceği, kategorilere göre filtreleyebileceği ve etiketlerle sınıflandırabileceği bir eğitim platformu oluşturmayı amaçlamaktadır. Frontend kısmı React ile, backend kısmı ise Python Flask ile geliştirilecektir. Backend, kurs verilerini sağlayacak API uç noktalarını sunacak ve frontend bu verileri dinamik olarak görüntüleyecektir.

## Ön Koşullar

Projeyi başlatmadan önce aşağıdaki araçların sisteminizde kurulu olması gerekmektedir:

- **Python 3.8+**: [Python İndir](https://www.python.org/downloads/)
- **Node.js ve npm**: [Node.js İndir](https://nodejs.org/)
- **Git**: [Git İndir](https://git-scm.com/downloads) (isteğe bağlı)
- **Virtualenv**: Python için sanal ortam oluşturmak üzere (pip ile kurulabilir)

## Proje Klasör Yapısı

Projeyi düzenli bir şekilde organize etmek için aşağıdaki klasör yapısını kullanabilirsiniz:

```
project_root/
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   ├── courses.json
│   ├── __init__.py
│   └── ... (diğer backend dosyaları)
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── App.js
│   │   ├── index.js
│   │   └── ... (diğer frontend dosyaları)
│   ├── package.json
│   └── ... (diğer frontend dosyaları)
├── .gitignore
└── README.md
```

## Adım 1: Proje Klasörünü Oluşturma

Öncelikle proje için ana klasörü oluşturun ve içine `backend` ve `frontend` klasörlerini ekleyin.

```bash
mkdir project_root
cd project_root
mkdir backend frontend
```

## Adım 2: Backend (Flask) Kurulumu

### 2.1. Sanal Ortam Oluşturma ve Aktifleştirme

Backend için bir sanal ortam oluşturmak, bağımlılıkları yönetmek açısından faydalıdır.

```bash
cd backend
python -m venv venv
```

- **Windows:**

  ```bash
  venv\Scripts\activate
  ```

- **macOS/Linux:**

  ```bash
  source venv/bin/activate
  ```

### 2.2. Gerekli Bağımlılıkları Yükleme

`requirements.txt` dosyasını oluşturun ve aşağıdaki bağımlılıkları ekleyin:

```txt
Flask==2.2.5
Flask-Cors==3.0.10
```

Bağımlılıkları yüklemek için:

```bash
pip install -r requirements.txt
```

### 2.3. API Veri Kaynağı Oluşturma

Kurs verilerini saklamak için `courses.json` adında bir dosya oluşturun ve React bileşeninizdeki kurs verilerini buraya taşıyın.

```json
[
  {
    "id": 1,
    "title": "Complete Web Development Course",
    "description": "Learn full-stack web development from scratch with modern tools and frameworks",
    "freeSample": "intro-to-html.pdf",
    "category": "programming",
    "tags": ["javascript", "react", "nodejs", "frontend"],
    "level": "Intermediate",
    "duration": "12 weeks",
    "topics": [
      "HTML & CSS Fundamentals",
      "JavaScript Essentials",
      "Backend Development",
      "Database Management",
      "Deployment & DevOps"
    ]
  },
  {
    "id": 2,
    "title": "Mobile App Development",
    "description": "Master mobile app development with React Native and build cross-platform apps",
    "freeSample": "react-native-basics.pdf",
    "category": "programming",
    "tags": ["react-native", "mobile", "ios", "android"],
    "level": "Advanced",
    "duration": "10 weeks",
    "topics": [
      "React Native Fundamentals",
      "State Management",
      "Native APIs",
      "App Publishing",
      "Performance Optimization"
    ]
  },
  {
    "id": 3,
    "title": "Digital Marketing Fundamentals",
    "description": "Master the basics of digital marketing and grow your online presence",
    "freeSample": "marketing-intro.pdf",
    "category": "marketing",
    "tags": ["seo", "social-media", "content-marketing"],
    "level": "Beginner",
    "duration": "8 weeks",
    "topics": [
      "SEO Fundamentals",
      "Social Media Marketing",
      "Content Strategy",
      "Analytics",
      "Email Marketing"
    ]
  }
]
```

### 2.4. Flask Uygulamasını Yazma

`app.py` dosyasını oluşturun ve aşağıdaki kodu ekleyin:

```python
from flask import Flask, jsonify, request
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)  # CORS'u tüm rotalar için etkinleştirir

# Veri Kaynağını Yükleme
with open('courses.json', 'r') as f:
    courses = json.load(f)

@app.route('/api/courses', methods=['GET'])
def get_courses():
    search_query = request.args.get('search', '').lower()
    selected_category = request.args.get('category', 'all').lower()
    selected_tags = request.args.getlist('tags')

    filtered = []
    for course in courses:
        matches_search = search_query in course['title'].lower() or search_query in course['description'].lower()
        matches_category = selected_category == 'all' or course['category'].lower() == selected_category
        matches_tags = not selected_tags or any(tag in course['tags'] for tag in selected_tags)

        if matches_search and matches_category and matches_tags:
            filtered.append(course)

    return jsonify(filtered)

@app.route('/api/categories', methods=['GET'])
def get_categories():
    categories = sorted(list(set(course['category'] for course in courses)))
    categories.insert(0, 'all')
    return jsonify(categories)

@app.route('/api/tags', methods=['GET'])
def get_tags():
    tags = sorted(list(set(tag for course in courses for tag in course['tags'])))
    return jsonify(tags)

@app.route('/api/courses/<int:course_id>', methods=['GET'])
def get_course(course_id):
    course = next((course for course in courses if course['id'] == course_id), None)
    if course:
        return jsonify(course)
    else:
        return jsonify({"error": "Course not found"}), 404

if __name__ == '__main__':
    app.run(debug=True)
```

### 2.5. Flask Sunucusunu Çalıştırma

Sanal ortamın aktifleştirildiğinden emin olun ve ardından Flask sunucusunu başlatın:

```bash
python app.py
```

Flask sunucusu varsayılan olarak `http://127.0.0.1:5000/` adresinde çalışacaktır.

## Adım 3: Frontend (React) Kurulumu

Frontend kısmının zaten React ile oluşturulduğunu varsayıyorum. Ancak, Flask backend ile entegrasyonu sağlamak için bazı ayarlamalar yapmanız gerekecek.

### 3.1. Frontend Klasörüne Geçiş

Ana proje klasörünüzde iken frontend klasörüne geçin:

```bash
cd ../frontend
```

### 3.2. Gerekli Bağımlılıkları Yükleme

Eğer henüz yapılmadıysa, gerekli npm paketlerini yükleyin:

```bash
npm install
```

### 3.3. API İsteklerini Ayarlama

React bileşeninizdeki kurs verilerini statik olarak değil, Flask backend'den dinamik olarak alacak şekilde güncelleyin. Aşağıda, `CourseLandingPage` bileşenini API'den veri çekecek şekilde nasıl güncelleyebileceğinizi gösteriyorum.

#### 3.3.1. Axios Kurulumu

API istekleri için `axios` kullanmak işinizi kolaylaştırabilir. `axios`'u yüklemek için:

```bash
npm install axios
```

#### 3.3.2. Bileşeni Güncelleme

`CourseLandingPage` bileşenini aşağıdaki gibi güncelleyin:

```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, MessageCircle, Search, Sparkles } from 'lucide-react';

const CourseLandingPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTags, setSelectedTags] = useState([]);
  const [categories, setCategories] = useState(['all']);
  const [allTags, setAllTags] = useState([]);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetchCategories();
    fetchTags();
    fetchCourses();
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [searchQuery, selectedCategory, selectedTags]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/tags');
      setAllTags(response.data);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const params = {
        search: searchQuery,
        category: selectedCategory,
        tags: selectedTags
      };
      const response = await axios.get('http://127.0.0.1:5000/api/courses', { params });
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold mb-6">Level Up Your Skills</h1>
            <p className="text-xl text-blue-100 mb-8">Discover expert-led courses designed to help you master new technologies and advance your career.</p>
            
            {/* Search Bar */}
            <div className="relative w-full max-w-xl backdrop-blur-lg bg-white/10 rounded-lg border border-white/20">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-4 pl-12 bg-transparent placeholder-blue-200 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <Search className="absolute left-4 top-4 text-blue-200" size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Filters Section */}
        <div className="mb-12 space-y-6 bg-white p-6 rounded-xl shadow-sm">
          {/* Categories */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-700">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className={`capitalize transition-all ${
                    selectedCategory === category 
                      ? 'shadow-md' 
                      : 'hover:shadow-sm'
                  }`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-700">Popular Tags</h3>
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <Button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  size="sm"
                  className={`capitalize transition-all ${
                    selectedTags.includes(tag)
                      ? 'shadow-md'
                      : 'hover:shadow-sm'
                  }`}
                >
                  #{tag}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className="overflow-hidden transition-all hover:shadow-lg">
              <div className="relative">
                <img
                  src={`/api/placeholder/800/400`}  {/* Bu endpoint'i kendinize göre güncelleyin */}
                  alt={course.title}
                  className="object-cover w-full h-48 transition-transform hover:scale-105"
                />
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 text-sm font-medium bg-white/90 text-blue-600 rounded-full">
                    {course.duration}
                  </span>
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                    {course.category}
                  </span>
                  <span className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-600 rounded-full flex items-center gap-1">
                    <Sparkles size={14} />
                    {course.level}
                  </span>
                </div>

                <h2 className="text-xl font-bold mb-3 text-gray-900">{course.title}</h2>
                <p className="text-gray-600 mb-6 line-clamp-2">{course.description}</p>

                <div className="mb-6 flex flex-wrap gap-2">
                  {course.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 text-sm bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 cursor-pointer transition-colors">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold mb-3 text-gray-800">What you'll learn:</h3>
                  <ul className="space-y-2">
                    {course.topics.slice(0, 3).map((topic, index) => (
                      <li key={index} className="flex items-center text-gray-600">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                        {topic}
                      </li>
                    ))}
                    {course.topics.length > 3 && (
                      <li className="text-sm text-blue-600 cursor-pointer hover:underline">
                        + {course.topics.length - 3} more topics
                      </li>
                    )}
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all"
                  >
                    <Download size={18} />
                    Free Sample
                  </Button>
                  <Button 
                    variant="outline"
                    className="flex-1 flex items-center justify-center gap-2 border-2 hover:bg-gray-50 transition-all"
                  >
                    <MessageCircle size={18} />
                    Contact
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseLandingPage;
```

### 3.4. CORS Ayarları

Backend tarafında `Flask-CORS` kullanarak CORS (Cross-Origin Resource Sharing) izinlerini ayarladık. Bu sayede frontend, backend API'lerine sorunsuz bir şekilde istek gönderebilir.

## Adım 4: Projeyi Çalıştırma

### 4.1. Backend Sunucusunu Başlatma

Backend klasöründe sanal ortamın aktifleştirildiğinden emin olun ve Flask sunucusunu başlatın:

```bash
cd backend
source venv/bin/activate  # macOS/Linux
# veya
venv\Scripts\activate  # Windows

python app.py
```

Flask sunucusu `http://127.0.0.1:5000/` adresinde çalışacaktır.

### 4.2. Frontend Sunucusunu Başlatma

Yeni bir terminal penceresi açın veya mevcut terminali kullanarak frontend klasörüne geçin ve React uygulamasını başlatın:

```bash
cd frontend
npm start
```

React uygulaması varsayılan olarak `http://localhost:3000/` adresinde çalışacaktır.

## Adım 5: Ek Özellikler ve İyileştirmeler

### 5.1. Veri Tabanı Entegrasyonu

Şu anda kurs verileri statik bir JSON dosyasında saklanmaktadır. Projeyi daha dinamik hale getirmek için bir veritabanı (örneğin, SQLite, PostgreSQL) entegrasyonu yapabilirsiniz.

### 5.2. Kullanıcı Kimlik Doğrulaması

Kullanıcıların kayıt olması, giriş yapması ve kişisel kurs listeleri oluşturması gibi özellikler ekleyebilirsiniz. Bunun için `Flask-Login` veya `Flask-JWT-Extended` gibi kütüphaneler kullanabilirsiniz.

### 5.3. API Geliştirmeleri

Daha fazla API uç noktası ekleyebilir, örneğin:

- Kurs ekleme, güncelleme ve silme işlemleri (CRUD)
- Kategoriler ve etiketler için yönetim paneli
- Kullanıcı yorumları ve değerlendirmeleri

### 5.4. Güvenlik İyileştirmeleri

API güvenliğini artırmak için kimlik doğrulama ve yetkilendirme ekleyebilir, veri doğrulaması yapabilir ve güvenlik duvarları kullanabilirsiniz.

## Özet

Bu rehberde, React frontend'inizi desteklemek için Python Flask backend oluşturma sürecini adım adım ele aldık. Flask, API uç noktaları sağlayarak frontend ile etkileşim kurmanıza olanak tanır. Proje klasör yapısını düzenli bir şekilde oluşturarak hem frontend hem de backend bileşenlerini yönetilebilir hale getirdik. İhtiyaçlarınıza göre bu yapıyı daha da genişletebilir ve özelleştirebilirsiniz.

Herhangi bir sorunuz olursa veya ek yardıma ihtiyaç duyarsanız, lütfen bana bildirin!

Download Button
---------------------------------------------------------------------------------------
PDF dosyanızı Google Drive veya Dropbox’a yükleyin.
Dosya paylaşım linkini alın.
Web sitenizde indirme linki olarak kullanın: <a href="https://drive.google.com/uc?export=download&id=dosya_id" download>PDF İndir</a>



Contact Purchase Button
--------------------------------------------------------------------------------------- 
**URL Encode Edilmiş Mesaj:**
```
Merhaba%2C%20PDF%20indirmek%20istiyorum.
```

Bunu manuel olarak yapmak yerine, [URL Encode Aracı](https://www.urlencoder.org/) kullanabilirsiniz.

**Bağlantıyı Oluşturmak**

Hazırladığınız telefon numarası ve URL Encode edilmiş mesaj ile bağlantınızı oluşturun.

**Örnek:**
```
https://wa.me/905551234567?text=Merhaba%2C%20PDF%20indirmek%20istiyorum.
```

**HTML Kodu ile Entegre Etmek**

Oluşturduğunuz WhatsApp bağlantısını web sitenize eklemek için aşağıdaki HTML kodunu kullanabilirsiniz:

```html
<a href="https://wa.me/905551234567?text=Merhaba%2C%20PDF%20indirmek%20istiyorum." target="_blank">
  <img src="whatsapp-icon.png" alt="WhatsApp ile İletişime Geçin" style="width:50px;height:50px;">
</a>
```

**Açıklamalar:**

- `href`: Oluşturduğunuz WhatsApp bağlantısı.
- `target="_blank"`: Bağlantının yeni bir sekmede açılmasını sağlar.
- `<img>`: WhatsApp simgesi eklemek için kullanılır. Kendi simgenizi kullanabilir veya metin bağlantısı olarak da ekleyebilirsiniz.
- `alt`: Resim yüklenemediğinde gösterilecek alternatif metin.
- `style`: İsteğe bağlı olarak simgenin boyutunu ayarlayabilirsiniz.

### 6. **Örnek Tam Bağlantı**

İşte tamamlanmış bir örnek:

```html
<a href="https://wa.me/905551234567?text=Merhaba%2C%20PDF%20indirmek%20istiyorum." target="_blank">
  WhatsApp ile İletişime Geçin
</a>
```

**Veya Görsel Kullanarak:**

```html
<a href="https://wa.me/905551234567?text=Merhaba%2C%20PDF%20indirmek%20istiyorum." target="_blank">
  <img src="https://example.com/whatsapp-icon.png" alt="WhatsApp ile İletişime Geçin" style="width:50px;height:50px;">
</a>
```

### 7. **Mobil ve Masaüstü Uyumluluğu**

- **Mobil Cihazlar:** Kullanıcı mobil cihazda bu bağlantıya tıkladığında, WhatsApp uygulaması otomatik olarak açılır ve mesaj alanı doldurulur.
- **Masaüstü:** Masaüstü kullanıcıları için WhatsApp Web açılır ve mesaj alanı doldurulur. Ancak, kullanıcının WhatsApp Web hesabına bağlı olması gerekmektedir.
