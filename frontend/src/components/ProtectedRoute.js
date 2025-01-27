import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { get } from '../utils/api';

export const ProtectedRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await get('/api/admin/check-auth');
        if (!response.authenticated) {
          navigate('/admin/login', { 
            replace: true,
            state: { from: location.pathname }
          });
          return;
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Yetkilendirme hatası:', error);
        if (error.message.includes('401')) {
          navigate('/admin/login', { 
            replace: true,
            state: { from: location.pathname }
          });
        }
      }
    };

    if (location.pathname !== '/admin/login') {
      checkAuth();
    }

    return () => {
      setIsLoading(false);
    };
  }, [navigate, location]);

  if (isLoading && location.pathname !== '/admin/login') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-600">Yükleniyor...</div>
      </div>
    );
  }

  return children;
}; 