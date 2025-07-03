import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import FloatingCreateButton from './components/FloatingCreateButton';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import Documents from './pages/Documents';
import DocumentDetail from './pages/DocumentDetail';
import DocumentForm from './pages/DocumentForm';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDocuments from './pages/AdminDocuments';
import AdminUsers from './pages/AdminUsers';
import AdminRoute from './components/AdminRoute';

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const hideNavbar =
    location.pathname === '/login' || location.pathname === '/register';
  return (
    <>
      {!hideNavbar && <Navbar />}
      {children}
      {/* Floating create button visible sur toutes les pages protégées */}
      <FloatingCreateButton />
    </>
  );
}

const protectedRoutes = [
  { path: '/', element: <Home /> },
  { path: '/documents', element: <Documents /> },
  { path: '/documents/new', element: <DocumentForm /> },
  { path: '/documents/:id', element: <DocumentDetail /> },
  { path: '/documents/:id/edit', element: <DocumentForm /> },
  { path: '/profile', element: <Profile /> },
];

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Toaster
          position="bottom-left"
          toastOptions={{
            style: {
              background: 'linear-gradient(135deg,#2563EB 0%,#7C3AED 100%)',
              color: '#fff',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#0000',
            },
          }}
        />
        <Routes>
          {/* Routes publiques */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Routes protégées */}
          {protectedRoutes.map(({ path, element }) => (
            <Route
              key={path}
              path={path}
              element={<ProtectedRoute>{element}</ProtectedRoute>}
            />
          ))}

          {/* Routes admin protégées */}
          <Route
            path="/admin/documents"
            element={
              <AdminRoute>
                <AdminDocuments />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            }
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
