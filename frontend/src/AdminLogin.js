import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from './components/ui/card';
import { Button } from './components/ui/button';
import { post, get } from './utils/api';

export const AdminLogin = () => {
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await get('/api/admin/check-auth');
        if (response.authenticated) {
          navigate('/admin', { replace: true });
        }
      } catch (error) {
        console.error('Auth check error:', error);
      }
    };
    checkAuth();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await post('/api/admin/login', loginData);
      if (response.message === 'Login successful' || response.authenticated) {
        navigate('/admin', { replace: true });
      } else {
        alert('Giriş başarısız!');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Giriş başarısız!');
    }
  };

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
}; 