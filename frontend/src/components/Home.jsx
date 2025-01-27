import React, { useState, useEffect, useCallback } from 'react'; 
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Download, MessageCircle, Search, Star, BookOpen, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import CountdownTimer from './CountdownTimer';

export const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState(['all']);
  const [selectedLevels, setSelectedLevels] = useState(['all']);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedDiscountFilter, setSelectedDiscountFilter] = useState('all');
  const [categories, setCategories] = useState(['all']);
  const levels = ['all', 'beginner', 'intermediate', 'advanced'];
  const [allTags, setAllTags] = useState([]);
  const [courses, setCourses] = useState([]);
  const [expandedCourseTopics, setExpandedCourseTopics] = useState({});
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [visibleCourses, setVisibleCourses] = useState([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 3;
  const [isPageSliding, setIsPageSliding] = useState(false);

  // Pagination hesaplamaları
  const totalPages = Math.ceil(courses.length / coursesPerPage);

  // Yukarı kaydırma fonksiyonu
  const scrollToFilters = () => {
    const filtersSection = document.querySelector('.filters-section');
    const startPosition = window.pageYOffset;
    const targetPosition = filtersSection.offsetTop - 20;
    const distance = targetPosition - startPosition;
    const duration = 1000; // 1 saniye
    let start = null;

    const animation = currentTime => {
      if (!start) start = currentTime;
      const progress = currentTime - start;
      const easeInOutCubic = t => t < 0.5 
        ? 4 * t * t * t 
        : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
      
      const run = easeInOutCubic(Math.min(progress / duration, 1));
      window.scrollTo(0, startPosition + distance * run);

      if (progress < duration) {
        requestAnimationFrame(animation);
      }
    };

    requestAnimationFrame(animation);
  };

  // API'den veri çekme fonksiyonları
  const fetchCategories = useCallback(async () => {
    try {
      const response = await axios.get('https://ayxanmammadov.pythonanywhere.com/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Kategoriler yüklenirken hata:', error);
    }
  }, []);

  const fetchTags = useCallback(async () => {
    try {
      const response = await axios.get('https://ayxanmammadov.pythonanywhere.com/api/tags');
      setAllTags(response.data);
    } catch (error) {
      console.error('Etiketler yüklenirken hata:', error);
    }
  }, []);

  const fetchCourses = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      params.append('search', searchQuery);
      
      // Kategori parametreleri
      if (!selectedCategories.includes('all')) {
        selectedCategories.forEach(category => params.append('category', category));
      }
      
      // Seviye parametreleri
      if (!selectedLevels.includes('all')) {
        selectedLevels.forEach(level => params.append('level', level));
      }
      
      // Etiket parametreleri
      selectedTags.forEach(tag => params.append('tags', tag));

      // İndirim filtresi parametresi
      if (selectedDiscountFilter !== 'all') {
        params.append('discount', selectedDiscountFilter);
      }
      
      const response = await axios.get('https://ayxanmammadov.pythonanywhere.com/api/courses', { params });
      setCourses(response.data);
    } catch (error) {
      console.error('Kurslar yüklenirken hata:', error);
    }
  }, [searchQuery, selectedCategories, selectedLevels, selectedTags, selectedDiscountFilter]);

  // Sayfa yüklendiğinde verileri çek
  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, [fetchCategories, fetchTags]);

  // Filtreler değiştiğinde kursları yeniden çek ve ilk sayfaya dön
  useEffect(() => {
    setCurrentPage(1); // Filtre değiştiğinde ilk sayfaya dön
    const timer = setTimeout(() => {
      fetchCourses();
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [fetchCourses, searchQuery, selectedCategories, selectedLevels, selectedTags, selectedDiscountFilter]);

  // Sayfa değiştirme fonksiyonu
  const handlePageChange = (pageNumber) => {
    if (pageNumber === currentPage) return;
    
    setIsTransitioning(true);
    setIsPageSliding(true);
    
    // Önce mevcut kursları görünmez yap
    setVisibleCourses(prevCourses => 
      prevCourses.map(course => ({
        ...course,
        isVisible: false,
        animationDelay: '0ms'
      }))
    );

    // Sayfayı değiştir ve yukarı kaydır
    setCurrentPage(pageNumber);
    scrollToFilters();

    // Yeni kursları göster
    const showNewCourses = setTimeout(() => {
      const coursesToShow = courses.slice(
        (pageNumber - 1) * coursesPerPage,
        pageNumber * coursesPerPage
      );

      setVisibleCourses(
        coursesToShow.map(course => ({
          ...course,
          isVisible: false,
          animationDelay: '0ms'
        }))
      );

      // Kursları görünür yap
      const showTimeout = setTimeout(() => {
        setVisibleCourses(prevCourses => 
          prevCourses.map(course => ({
            ...course,
            isVisible: true
          }))
        );
        setIsPageSliding(false);
      }, 50);

      return () => clearTimeout(showTimeout);
    }, 400);

    // Animasyon bitiminde transitioning durumunu kaldır
    const transitionEndTimeout = setTimeout(() => {
      setIsTransitioning(false);
    }, 800);

    return () => {
      clearTimeout(showNewCourses);
      clearTimeout(transitionEndTimeout);
    };
  };

  // Kursları güncellerken animasyon kontrolü
  useEffect(() => {
    if (!courses.length) {
      setVisibleCourses([]);
      return;
    }

    setIsTransitioning(true);
    
    // Önce mevcut kursları görünmez yap
    setVisibleCourses(prevCourses => 
      prevCourses.map(course => ({
        ...course,
        isVisible: false,
        animationDelay: '0ms'
      }))
    );

    // Eski kursların kaybolmasını bekle ve sonra yeni kursları göster
    const showNewCourses = setTimeout(() => {
      const coursesToShow = courses.slice(
        (currentPage - 1) * coursesPerPage,
        currentPage * coursesPerPage
      );

      setVisibleCourses(
        coursesToShow.map(course => ({
          ...course,
          isVisible: false,
          animationDelay: '0ms'
        }))
      );

      // Kursları görünür yap
      const showTimeout = setTimeout(() => {
        setVisibleCourses(prevCourses => 
          prevCourses.map(course => ({
            ...course,
            isVisible: true
          }))
        );
      }, 50);

      return () => clearTimeout(showTimeout);
    }, 400);

    // Animasyon bitiminde transitioning durumunu kaldır
    const transitionEndTimeout = setTimeout(() => {
      setIsTransitioning(false);
    }, 800);

    return () => {
      clearTimeout(showNewCourses);
      clearTimeout(transitionEndTimeout);
    };
  }, [courses, currentPage, coursesPerPage]);

  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev => {
      if (category === 'all') {
        return ['all'];
      }
      const newSelection = prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev.filter(c => c !== 'all'), category];
      return newSelection.length === 0 ? ['all'] : newSelection;
    });
  };

  const handleLevelToggle = (level) => {
    setSelectedLevels(prev => {
      if (level === 'all') {
        return ['all'];
      }
      const newSelection = prev.includes(level)
        ? prev.filter(l => l !== level)
        : [...prev.filter(l => l !== 'all'), level];
      return newSelection.length === 0 ? ['all'] : newSelection;
    });
  };

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleDownload = async (courseId) => {
    try {
      const response = await axios.get(`https://ayxanmammadov.pythonanywhere.com/api/download/${courseId}`);
      
      if (!response.data.download_url) {
        throw new Error('İndirilebilir dosya bulunamadı');
      }

      // Dosyayı yeni sekmede aç
      window.open(response.data.download_url, '_blank');
    } catch (error) {
      console.error('İndirme hatası:', error);
      alert('Dosya indirilemedi!');
    }
  };

  const handleContact = (contact) => {
    const { whatsapp, whatsappMessage } = contact;
    const message = encodeURIComponent(whatsappMessage);
    window.open(`https://wa.me/${whatsapp}?text=${message}`, '_blank');
  };

  const toggleTopics = (courseId) => {
    setExpandedCourseTopics(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));
  };

  const toggleDescription = (courseId) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));
  };

  const handleDiscountFilter = (filter) => {
    setSelectedDiscountFilter(filter);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <>
      {/* Hero Section */}
      <div className={`bg-gradient-to-r from-blue-600 to-indigo-600 text-white transition-all duration-500 transform ${
        isPageSliding ? 'opacity-80 scale-[0.99]' : 'opacity-100 scale-100'
      }`}>
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold mb-6">Level Up Your Skills</h1>
            <p className="text-xl text-blue-100 mb-8">Discover expert-led courses designed to help you master new technologies and advance your career.</p>
            
            {/* Search Bar */}
            <div className="relative w-full max-w-xl backdrop-blur-lg bg-white/10 rounded-lg border border-white/20">
              <input
                type="text"
                id="courseSearch"
                name="courseSearch"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full p-4 pl-12 bg-transparent placeholder-blue-200 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <Search className="absolute left-4 top-4 text-blue-200" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Countdown Timer Section */}
      <CountdownTimer />

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Filters Section */}
        <div className={`mb-12 space-y-6 bg-white p-6 rounded-xl shadow-sm filters-section transition-all duration-500 transform ${
          isPageSliding ? 'opacity-80 scale-[0.99] translate-y-2' : 'opacity-100 scale-100 translate-y-0'
        }`}>
          {/* Categories */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-700">Kategoriler</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Button
                  key={category}
                  onClick={() => handleCategoryToggle(category)}
                  variant={selectedCategories.includes(category) ? "default" : "outline"}
                  className={`capitalize transition-all ${
                    selectedCategories.includes(category)
                      ? 'shadow-md' 
                      : 'hover:shadow-sm'
                  }`}
                >
                  {category === 'all' ? 'Tümü' : category}
                </Button>
              ))}
            </div>
          </div>

          {/* Levels */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-700">Seviyeler</h3>
            <div className="flex flex-wrap gap-2">
              {levels.map(level => (
                <Button
                  key={level}
                  onClick={() => handleLevelToggle(level)}
                  variant={selectedLevels.includes(level) ? "default" : "outline"}
                  className={`capitalize transition-all ${
                    selectedLevels.includes(level)
                      ? 'shadow-md' 
                      : 'hover:shadow-sm'
                  }`}
                >
                  {level === 'all' ? 'Tümü' :
                   level === 'beginner' ? 'Başlangıç' :
                   level === 'intermediate' ? 'Orta' :
                   level === 'advanced' ? 'İleri' : level}
                </Button>
              ))}
            </div>
          </div>

          {/* Discount Filter */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-700">İndirim Durumu</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => handleDiscountFilter('all')}
                variant={selectedDiscountFilter === 'all' ? "default" : "outline"}
                className={`transition-all ${
                  selectedDiscountFilter === 'all'
                    ? 'shadow-md' 
                    : 'hover:shadow-sm'
                }`}
              >
                Tümü
              </Button>
              <Button
                onClick={() => handleDiscountFilter('discounted')}
                variant={selectedDiscountFilter === 'discounted' ? "default" : "outline"}
                className={`transition-all ${
                  selectedDiscountFilter === 'discounted'
                    ? 'shadow-md' 
                    : 'hover:shadow-sm'
                }`}
              >
                İndirimli
              </Button>
              <Button
                onClick={() => handleDiscountFilter('non-discounted')}
                variant={selectedDiscountFilter === 'non-discounted' ? "default" : "outline"}
                className={`transition-all ${
                  selectedDiscountFilter === 'non-discounted'
                    ? 'shadow-md' 
                    : 'hover:shadow-sm'
                }`}
              >
                İndirimsiz
              </Button>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-700">Etiketler</h3>
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
        <div className={`grid gap-8 md:grid-cols-2 lg:grid-cols-3 ${
          isTransitioning ? 'pointer-events-none' : ''
        }`}>
          {visibleCourses.map((course) => (
            <Card 
              key={course.id} 
              style={{ 
                transitionDelay: course.animationDelay,
                transitionProperty: 'opacity',
                transitionTimingFunction: 'ease-in-out',
                transitionDuration: '350ms'
              }}
              className={`overflow-hidden hover:shadow-lg flex flex-col ${
                course.isVisible 
                  ? 'opacity-100' 
                  : 'opacity-0'
              } ${isTransitioning ? 'cursor-default' : ''}`}
            >
              <div className="relative overflow-hidden">
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
                  <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                    <span className="px-3 py-1 text-sm font-medium bg-white/90 text-blue-600 rounded-full">
                      {course.duration}
                    </span>
                    {course.discountedPrice ? (
                      <div className="px-3 py-2 bg-white/90 rounded-full flex flex-col items-center">
                        <span className="text-xs text-gray-500 line-through">${course.price}</span>
                        <span className="text-base font-bold text-green-600">${course.discountedPrice}</span>
                        <span className="text-xs font-medium text-green-700">
                          {Math.round(((course.price - course.discountedPrice) / course.price) * 100)}% OFF
                        </span>
                      </div>
                    ) : (
                      <div className="px-3 py-2 bg-white/90 rounded-full flex flex-col items-center">
                        <span className="text-base font-bold text-gray-900">${course.price}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent backdrop-blur-[2px] p-4 z-20">
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-4">
                      {course.rating && (
                        <div className="flex items-center gap-1">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => {
                              const isFullStar = star <= Math.floor(course.rating);
                              const isHalfStar = !isFullStar && star === Math.ceil(course.rating) && course.rating % 1 >= 0.3;
                              
                              return (
                                <div key={star} className="relative">
                                  <Star
                                    size={16}
                                    className={isFullStar ? "text-yellow-400 fill-yellow-400" : "text-gray-400"}
                                  />
                                  {isHalfStar && (
                                    <div className="absolute inset-0 overflow-hidden w-[50%]">
                                      <Star
                                        size={16}
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
                      {course.purchaseCount && (
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
                      {course.createdAt && (
                        <span className="text-sm flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          {new Date(course.createdAt).toLocaleDateString('tr-TR', { 
                            year: 'numeric',
                            month: 'short'
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-6 flex-1 flex flex-col">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
                      {course.category}
                    </span>
                    <span className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-600 rounded-full flex items-center gap-1">
                      <Star size={14} />
                      {course.level}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold mb-3 text-gray-900">{course.title}</h2>
                  
                  <div className="relative mb-6">
                    <div 
                      className={`overflow-hidden transition-all duration-700 ease-in-out`}
                      style={{
                        maxHeight: expandedDescriptions[course.id] ? '500px' : '48px',
                        transform: expandedDescriptions[course.id] ? 'translateY(0)' : 'translateY(0)',
                        opacity: expandedDescriptions[course.id] ? '1' : '0.8'
                      }}
                    >
                      <p className="text-gray-600">
                        {course.description}
                      </p>
                    </div>
                    {course.description.length > 100 && (
                      <div className="relative h-6 mt-1">
                        <div 
                          className={`absolute right-0 transition-all duration-700 ease-in-out ${
                            !expandedDescriptions[course.id] 
                              ? 'bg-gradient-to-l from-white via-white to-transparent w-24' 
                              : 'w-full'
                          }`}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleDescription(course.id)}
                            className={`text-blue-600 hover:text-blue-700 h-6 px-2 py-0 transition-all duration-300 hover:bg-blue-50 float-right`}
                          >
                            <span className="flex items-center">
                              {expandedDescriptions[course.id] ? (
                                <>
                                  Daha Az Göster
                                  <ChevronUp size={16} className={`ml-1 transform transition-transform duration-700`} />
                                </>
                              ) : (
                                <>
                                  Devamını Oku
                                  <ChevronDown size={16} className={`ml-1 transform transition-transform duration-700`} />
                                </>
                              )}
                            </span>
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mb-6 flex flex-wrap gap-2">
                    {course.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 text-sm bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 cursor-pointer transition-colors">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                        <BookOpen size={18} className="text-blue-600" />
                        Öğrenecekleriniz:
                      </h3>
                      {course.topics.length > 4 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleTopics(course.id)}
                          className="text-blue-600 hover:text-blue-700 transition-all duration-300 hover:bg-blue-50"
                        >
                          <span className="flex items-center">
                            {expandedCourseTopics[course.id] ? (
                              <>
                                Daha Az Göster
                                <ChevronUp size={16} className="ml-1 transform transition-transform duration-700" />
                              </>
                            ) : (
                              <>
                                Tümünü Göster
                                <ChevronDown size={16} className="ml-1 transform transition-transform duration-700" />
                              </>
                            )}
                          </span>
                        </Button>
                      )}
                    </div>
                    <div 
                      className={`grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-hidden transition-all duration-700 ease-in-out`}
                      style={{
                        maxHeight: expandedCourseTopics[course.id] ? '800px' : '96px',
                        transform: expandedCourseTopics[course.id] ? 'translateY(0)' : 'translateY(0)',
                        opacity: expandedCourseTopics[course.id] ? '1' : '0.8'
                      }}
                    >
                      {course.topics.map((topic, index) => (
                        <div
                          key={index}
                          className={`flex items-start p-2 rounded-lg hover:bg-gray-50 transition-all duration-300 group transform ${
                            expandedCourseTopics[course.id] ? 'translate-y-0' : index > 3 ? 'translate-y-2' : ''
                          }`}
                          style={{
                            transitionDelay: `${index * 50}ms`
                          }}
                        >
                          <div className="w-1.5 h-1.5 mt-[0.6rem] rounded-full bg-blue-500 group-hover:bg-blue-600 transition-colors mr-2 flex-shrink-0"></div>
                          <span className="text-gray-600 text-sm group-hover:text-gray-900 transition-colors">{topic}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-auto pt-6 border-t">
                  <Button 
                    onClick={() => handleDownload(course.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all"
                  >
                    <Download size={18} />
                    Free Sample
                  </Button>
                  <Button 
                    onClick={() => handleContact(course.contact)}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center gap-2">
            <Button
              variant="outline"
              size="lg"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isTransitioning}
              className="px-4 py-2 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            {[...Array(totalPages)].map((_, index) => {
              const pageNumber = index + 1;
              const isActive = pageNumber === currentPage;

              return (
                <Button
                  key={pageNumber}
                  variant={isActive ? "default" : "outline"}
                  size="lg"
                  onClick={() => handlePageChange(pageNumber)}
                  disabled={isTransitioning}
                  className={`px-4 py-2 min-w-[40px] transition-all ${
                    isActive 
                      ? 'shadow-md bg-gradient-to-r from-blue-600 to-indigo-600' 
                      : 'hover:shadow-sm'
                  }`}
                >
                  {pageNumber}
                </Button>
              );
            })}

            <Button
              variant="outline"
              size="lg"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isTransitioning}
              className="px-4 py-2 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>

      {/* Neden Bu Kursu Satın Almalısın Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Neden Bu Kursu Satın Almalısın?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 bg-white/10 rounded-lg backdrop-blur-sm">
              <BookOpen className="w-12 h-12 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Kapsamlı İçerik</h3>
              <p className="text-blue-100">Detaylı ve güncel eğitim materyalleri ile kariyerinizde bir adım öne geçin.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-white/10 rounded-lg backdrop-blur-sm">
              <Star className="w-12 h-12 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Uzman Eğitmenler</h3>
              <p className="text-blue-100">Alanında uzman eğitmenlerden birebir öğrenme fırsatı yakalayın.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-white/10 rounded-lg backdrop-blur-sm">
              <MessageCircle className="w-12 h-12 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Sürekli Destek</h3>
              <p className="text-blue-100">Öğrenme sürecinizde ihtiyaç duyduğunuz her an destek alın.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
