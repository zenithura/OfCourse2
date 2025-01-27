import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-6 text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Sayfa Bulunamadı
          </h2>
          <p className="text-gray-600 mb-8">
            Üzgünüz, aradığınız sayfaya ulaşılamıyor. Sayfa kaldırılmış, adı değiştirilmiş veya geçici olarak kullanım dışı olabilir.
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="flex-1 max-w-[200px]"
            >
              Geri Dön
            </Button>
            <Button
              onClick={() => navigate('/')}
              className="flex-1 max-w-[200px]"
            >
              Ana Sayfa
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 