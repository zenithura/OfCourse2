import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { get } from '../utils/api';

export const ProtectedRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const response = await get('/api/admin/check-auth');
        if (!isMounted) return;

        if (!response.authenticated) {
          navigate('/admin/login', { 
            replace: true,
            state: { from: location.pathname }
          });
          return;
        }
        setIsLoading(false);
      } catch (error) {
        if (!isMounted) return;
        console.error('Yetkilendirme hatası:', error);
        navigate('/admin/login', { 
          replace: true,
          state: { from: location.pathname }
        });
      }
    };

    checkAuth();
    return () => {
      isMounted = false;
    };
  }, [navigate, location]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-600">Yükleniyor...</div>
      </div>
    );
  }

  return children;
}; 