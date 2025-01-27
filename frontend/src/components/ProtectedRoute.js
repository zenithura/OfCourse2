import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { get } from '../utils/api';

export const ProtectedRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await get('/api/admin/check-auth');
        if (!response.authenticated) {
          navigate('/admin/login', { replace: true });
          return;
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Yetkilendirme hatası:', error);
        navigate('/admin/login', { replace: true });
      }
    };

    checkAuth();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-600">Yükleniyor...</div>
      </div>
    );
  }

  return children;
}; 