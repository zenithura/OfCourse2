import { useRouteError, Link } from 'react-router-dom';

export const ErrorPage = () => {
  const error = useRouteError();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-blue-600">
            {error.status || '404'}
          </h1>
          <h2 className="text-2xl font-semibold text-gray-900">
            {error.statusText || 'Sayfa Bulunamadı'}
          </h2>
          <p className="text-gray-600">
            {error.message || 'Üzgünüz, aradığınız sayfaya ulaşılamıyor.'}
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </div>
  );
}; 