import { Outlet } from 'react-router-dom';

export const Root = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Outlet />
    </div>
  );
}; 