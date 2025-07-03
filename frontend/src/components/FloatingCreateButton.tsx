import { BsPlusCircle } from 'react-icons/bs';
import { useLocation, useNavigate } from 'react-router-dom';

export default function FloatingCreateButton() {
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem('token');
  const hiddenPaths = ['/login', '/register', '/documents/new'];

  if (!token || hiddenPaths.includes(location.pathname)) return null;

  return (
    <button
      onClick={() => navigate('/documents/new')}
      className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-blue-600 shadow-xl flex items-center justify-center text-white hover:bg-blue-700 transition"
      aria-label="Créer un document"
      title="Créer un document"
    >
      <BsPlusCircle size={32} />
    </button>
  );
}
