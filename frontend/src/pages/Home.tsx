import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export default function Home() {
  const [isLogged, setIsLogged] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        jwtDecode(token);
        setIsLogged(true);
      } catch {
        setIsLogged(false);
      }
    } else {
      setIsLogged(false);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-10 rounded shadow-md w-full max-w-lg text-center">
        <h1 className="text-3xl font-bold mb-4">Bienvenue sur <span className="text-blue-600">Secure Docs</span></h1>
        <p className="text-lg mb-8 text-gray-700">
          La plateforme sécurisée pour gérer, créer et organiser vos documents en toute simplicité.
        </p>
        {isLogged ? (
          <button
            onClick={() => navigate('/documents')}
            className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 transition"
          >
            Accéder à mes documents
          </button>
        ) : (
          <div className="flex flex-col gap-3 items-center">
            <button
              onClick={() => navigate('/login')}
              className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 transition w-full"
            >
              Se connecter
            </button>
            <button
              onClick={() => navigate('/register')}
              className="bg-gray-200 text-gray-800 px-6 py-2 rounded font-semibold hover:bg-gray-300 transition w-full"
            >
              S'inscrire
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
