import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from './components/ui/card';
import { Button } from './components/ui/button';
import { Edit, Trash2, Plus, LogOut, Star, Tag } from 'lucide-react';
import { get, post, deleteRequest } from './utils/api';


export const AdminPanel = () => {
  const [courses, setCourses] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [selectedCourses, setSelectedCourses] = useState([]);
  const navigate = useNavigate();

  const fetchCourses = useCallback(async () => {
    try {
      const response = await get('/api/courses');
      setCourses(response);
    } catch (error) {
      console.error('Kurslar yüklenirken hata:', error);
    }
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const response = await get('/api/admin/check-auth');
      setIsAuthenticated(response.authenticated);
      if (response.authenticated) {
        fetchCourses();
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
    }
  }, [fetchCourses]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogin = useCallback(async (e) => {
    e.preventDefault();
    try {
      await post('/api/admin/login', loginData);
      setIsAuthenticated(true);
      fetchCourses();
    } catch (error) {
      alert('Giriş başarısız!');
    }
  }, [loginData, fetchCourses]);

  const handleLogout = async () => {
    try {
      await post('/api/admin/logout', {});
      setIsAuthenticated(false);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleDelete = useCallback(async (courseId) => {
    if (window.confirm('Bu kursu silmek istediğinizden emin misiniz?')) {
      try {
        await deleteRequest(`/api/admin/courses/${courseId}`);
        fetchCourses();
      } catch (error) {
        console.error('Silme hatası:', error);
        alert('Kurs silinemedi!');
      }
    }
  }, [fetchCourses]);

  const handleRemoveDiscounts = async () => {
    if (selectedCourses.length === 0) {
      alert('Lütfen en az bir kurs seçin!');
      return;
    }

    if (window.confirm('Seçili kursların indirimlerini kaldırmak istediğinizden emin misiniz?')) {
      try {
        const response = await get('/api/admin/check-auth');
        if (!response.authenticated) {
          navigate('/admin/login');
          return;
        }

        await post('/api/admin/remove-discounts', { courseIds: selectedCourses });
        await fetchCourses();
        setSelectedCourses([]);
        alert('İndirimler başarıyla kaldırıldı!');
      } catch (error) {
        console.error('İndirim kaldırma hatası:', error);
        if (error.message.includes('401')) {
          navigate('/admin/login');
        } else {
          alert('İndirimler kaldırılırken bir hata oluştu!');
        }
      }
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedCourses(courses.map(course => course.id));
    } else {
      setSelectedCourses([]);
    }
  };

  const handleSelectCourse = (courseId) => {
    setSelectedCourses(prev => {
      if (prev.includes(courseId)) {
        return prev.filter(id => id !== courseId);
      } else {
        return [...prev, courseId];
      }
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-center">Admin Girişi</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kullanıcı Adı
                </label>
                <input
                  type="text"
                  value={loginData.username}
                  onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Şifre
                </label>
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Giriş Yap
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Kurs Yönetimi</h1>
          <div className="flex gap-3">
            <Button onClick={() => navigate('/admin/new-course')} className="flex items-center gap-2">
              <Plus size={20} />
              Yeni Kurs
            </Button>
            <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
              <LogOut size={20} />
              Çıkış Yap
            </Button>
          </div>
        </div>

        {courses.length > 0 && (
          <div className="mb-6 flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                onChange={handleSelectAll}
                checked={selectedCourses.length === courses.length}
                className="w-4 h-4"
              />
              Tümünü Seç
            </label>
            <Button
              onClick={handleRemoveDiscounts}
              variant="outline"
              className="flex items-center gap-2"
              disabled={selectedCourses.length === 0}
            >
              <Tag size={16} />
              Seçili İndirimleri Kaldır
            </Button>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className="overflow-hidden">
              <div className="relative overflow-hidden">
                <div className="absolute top-2 left-2 z-10">
                  <input
                    type="checkbox"
                    checked={selectedCourses.includes(course.id)}
                    onChange={() => handleSelectCourse(course.id)}
                    className="w-4 h-4"
                  />
                </div>
                <div className="relative h-48">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/images/default.jpg";
                    }}
                  />
                  <div className="absolute top-2 right-2 flex gap-2 z-10">
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-white"
                      onClick={() => navigate(`/admin/edit/${course.id}`)}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-white text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(course.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent backdrop-blur-[2px] p-4 z-20">
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-4">
                      {course.rating !== undefined && (
                        <div className="flex items-center gap-1">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => {
                              const isFullStar = star <= Math.floor(course.rating);
                              const isHalfStar = !isFullStar && star === Math.ceil(course.rating) && course.rating % 1 >= 0.3;
                              
                              return (
                                <div key={star} className="relative">
                                  <Star
                                    size={14}
                                    className={isFullStar ? "text-yellow-400 fill-yellow-400" : "text-gray-400"}
                                  />
                                  {isHalfStar && (
                                    <div className="absolute inset-0 overflow-hidden w-[50%]">
                                      <Star
                                        size={14}
                                        className="text-yellow-400 fill-yellow-400"
                                      />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          <span className="text-sm">({course.rating})</span>
                        </div>
                      )}
                      {course.purchaseCount !== undefined && (
                        <span className="text-sm flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                          </svg>
                          {course.purchaseCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold text-lg mb-2">{course.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{course.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {course.category}
                  </span>
                  <div className="text-right">
                    {course.discountedPrice ? (
                      <>
                        <div className="text-sm text-gray-500 line-through">
                          ${course.price}
                        </div>
                        <div className="font-bold text-lg text-green-600">
                          ${course.discountedPrice}
                        </div>
                      </>
                    ) : (
                      <div className="font-bold text-lg">
                        ${course.price}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}; 
