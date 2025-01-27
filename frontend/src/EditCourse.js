import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from './components/ui/card';
import { Button } from './components/ui/button';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { get } from './utils/api';

export const EditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState({
    title: '',
    description: '',
    category: '',
    level: '',
    duration: '',
    price: '',
    discountedPrice: '',
    topics: [],
    tags: [],
    contact: {
      whatsapp: '',
      whatsappMessage: ''
    },
    image: '',
    downloadUrl: '',
    rating: 0,
    purchaseCount: 0,
    createdAt: new Date().toISOString().split('T')[0]
  });
  const [isLoading, setIsLoading] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [downloadFile, setDownloadFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authResponse = await get('/api/admin/check-auth');
        if (!authResponse.authenticated) {
          navigate('/admin');
          return;
        }
        fetchCourse();
      } catch (error) {
        console.error('Yetkilendirme hatası:', error);
        navigate('/admin');
      }
    };

    const fetchCourse = async () => {
      try {
        const response = await get(`/api/courses/${id}`);
        if (!response) {
          throw new Error('Kurs bulunamadı');
        }
        setCourse(response);
        if (response.image) {
          setImagePreview(response.image);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Kurs yüklenirken hata:', error);
        alert('Kurs yüklenemedi!');
        navigate('/admin');
      }
    };

    checkAuth();
  }, [id, navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownloadFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDownloadFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      
      if (imageFile) {
        formData.append('image', imageFile);
      }
      if (downloadFile) {
        formData.append('downloadFile', downloadFile);
      }
      
      const courseDataForSubmit = {
        ...course,
        image: undefined,
        downloadUrl: undefined
      };

      Object.keys(courseDataForSubmit).forEach(key => {
        if (courseDataForSubmit[key] === undefined) {
          delete courseDataForSubmit[key];
        }
      });

      formData.append('courseData', JSON.stringify(courseDataForSubmit));

      const response = await get(`/api/admin/courses/${id}`, formData);
      
      if (response.message) {
        if (response.course) {
          setCourse(response.course);
          if (response.course.image) {
            setImagePreview(response.course.image);
          }
        }
        alert('Kurs başarıyla güncellendi!');
        navigate('/admin');
      } else {
        throw new Error(response.error || 'Güncelleme başarısız');
      }
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      alert(error.message || 'Kurs güncellenemedi!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-600">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold mb-6">Kurs Düzenle</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Başlık
                </label>
                <input
                  type="text"
                  value={course.title}
                  onChange={(e) => setCourse({ ...course, title: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama
                </label>
                <div className="relative">
                  <textarea
                    value={course.description}
                    onChange={(e) => {
                      if (e.target.value.length <= 500) {
                        setCourse({ ...course, description: e.target.value });
                      }
                    }}
                    className="w-full p-2 border rounded-md"
                    rows={4}
                    maxLength={500}
                    required
                  />
                  <div className="absolute bottom-2 right-2 text-sm text-gray-500">
                    {course.description.length}/500
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori
                  </label>
                  <input
                    type="text"
                    value={course.category}
                    onChange={(e) => setCourse({ ...course, category: e.target.value })}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Seviye
                  </label>
                  <select
                    value={course.level}
                    onChange={(e) => setCourse({ ...course, level: e.target.value })}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">Seçiniz</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Süre
                  </label>
                  <input
                    type="text"
                    value={course.duration}
                    onChange={(e) => setCourse({ ...course, duration: e.target.value })}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fiyat
                  </label>
                  <input
                    type="number"
                    value={course.price}
                    onChange={(e) => setCourse({ ...course, price: e.target.value })}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  İndirimli Fiyat (opsiyonel)
                </label>
                <input
                  type="number"
                  value={course.discountedPrice || ''}
                  onChange={(e) => setCourse({ ...course, discountedPrice: e.target.value })}
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Konular
                </label>
                {course.topics.map((topic, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => {
                        const newTopics = [...course.topics];
                        newTopics[index] = e.target.value;
                        setCourse({ ...course, topics: newTopics });
                      }}
                      className="flex-1 p-2 border rounded-md"
                      required
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        const newTopics = course.topics.filter((_, i) => i !== index);
                        setCourse({ ...course, topics: newTopics });
                      }}
                      variant="destructive"
                    >
                      Sil
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={() => setCourse({ ...course, topics: [...course.topics, ''] })}
                  variant="outline"
                  className="mt-2"
                >
                  Konu Ekle
                </Button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Etiketler
                </label>
                {course.tags.map((tag, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => {
                        const newTags = [...course.tags];
                        newTags[index] = e.target.value;
                        setCourse({ ...course, tags: newTags });
                      }}
                      className="flex-1 p-2 border rounded-md"
                      required
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        const newTags = course.tags.filter((_, i) => i !== index);
                        setCourse({ ...course, tags: newTags });
                      }}
                      variant="destructive"
                    >
                      Sil
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={() => {
                    if (course.tags.length >= 7) {
                      alert('En fazla 7 etiket ekleyebilirsiniz!');
                      return;
                    }
                    setCourse({ ...course, tags: [...course.tags, ''] })
                  }}
                  variant="outline"
                  className="mt-2"
                >
                  Etiket Ekle
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    WhatsApp Numarası
                  </label>
                  <input
                    type="text"
                    value={course.contact.whatsapp}
                    onChange={(e) => setCourse({
                      ...course,
                      contact: { ...course.contact, whatsapp: e.target.value }
                    })}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    WhatsApp Mesajı
                  </label>
                  <input
                    type="text"
                    value={course.contact.whatsappMessage}
                    onChange={(e) => setCourse({
                      ...course,
                      contact: { ...course.contact, whatsappMessage: e.target.value }
                    })}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kurs Görseli
                  </label>
                  <div className="space-y-2">
                    {(imagePreview || course.image) && (
                      <img
                        src={imagePreview || course.image}
                        alt="Kurs görseli"
                        className="w-full h-40 object-cover rounded-md"
                        onError={(e) => {
                          console.error('Görsel yükleme hatası:', e);
                          e.target.src = '/images/default.jpg';
                        }}
                      />
                    )}
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="imageInput"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('imageInput').click()}
                        className="w-full"
                      >
                        <ImageIcon size={20} className="mr-2" />
                        Görsel Seç
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kurs Dosyası
                  </label>
                  <div className="space-y-2">
                    {course.downloadUrl && (
                      <div className="text-sm text-gray-500 mb-2">
                        Mevcut dosya: {course.downloadUrl.split('/').pop()}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.zip,.rar"
                        onChange={handleDownloadFileChange}
                        className="hidden"
                        id="downloadInput"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('downloadInput').click()}
                        className="w-full"
                      >
                        <Upload size={20} className="mr-2" />
                        Dosya Seç
                      </Button>
                    </div>
                    {downloadFile && (
                      <div className="text-sm text-gray-600">
                        Yeni seçilen dosya: {downloadFile.name}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Değerlendirme (0-5)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={course.rating || 0}
                    onChange={(e) => setCourse({ ...course, rating: parseFloat(e.target.value) })}
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Satın Alan Öğrenci Sayısı
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={course.purchaseCount || 0}
                    onChange={(e) => setCourse({ ...course, purchaseCount: parseInt(e.target.value) })}
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Oluşturulma Tarihi
                  </label>
                  <input
                    type="date"
                    value={course.createdAt ? course.createdAt.split('T')[0] : ''}
                    onChange={(e) => setCourse({ ...course, createdAt: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1">
                  Kaydet
                </Button>
                <Button
                  type="button"
                  onClick={() => navigate('/admin')}
                  variant="outline"
                  className="flex-1"
                >
                  İptal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 