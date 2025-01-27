import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Root } from './components/Root';
import { Home } from './components/Home';
import { AdminPanel } from './AdminPanel';
import { AdminLogin } from './AdminLogin';
import { EditCourse } from './EditCourse';
import { CreateCourse } from './CreateCourse';
import { NotFound } from './components/NotFound';
import { ProtectedRoute } from './components/ProtectedRoute';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: "admin",
        children: [
          {
            index: true,
            element: <ProtectedRoute><AdminPanel /></ProtectedRoute>
          },
          {
            path: "login",
            element: <AdminLogin />
          },
          {
            path: "edit/:id",
            element: <ProtectedRoute><EditCourse /></ProtectedRoute>
          },
          {
            path: "new-course",
            element: <ProtectedRoute><CreateCourse /></ProtectedRoute>
          }
        ]
      }
    ]
  }
], {
  future: {
    v7_relativeSplatPath: true,
    v7_startTransition: true
  }
});

export const App = () => {
  return (
    <RouterProvider router={router} />
  );
}; 