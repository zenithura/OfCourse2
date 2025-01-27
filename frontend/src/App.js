import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Root } from './components/Root';
import { Home } from './components/Home';
import { AdminPanel } from './AdminPanel';
import { EditCourse } from './EditCourse';
import { CreateCourse } from './CreateCourse';
import { NotFound } from './components/NotFound';

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
        element: <AdminPanel />
      },
      {
        path: "admin/edit/:id",
        element: <EditCourse />
      },
      {
        path: "admin/new-course",
        element: <CreateCourse />
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