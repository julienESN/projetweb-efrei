import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { BsFileEarmarkText, BsPlusCircle } from 'react-icons/bs';

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 px-4 text-white">
      <div className="max-w-2xl text-center">
        <BsFileEarmarkText size={80} className="mx-auto mb-6 drop-shadow-lg" />
        <h1 className="text-5xl font-extrabold mb-4 tracking-tight">
          Secure <span className="text-yellow-300">Docs</span>
        </h1>
        <p className="text-xl md:text-2xl mb-8 opacity-90">
          Gérez et organisez vos documents en toute sécurité, simplement.
        </p>

        {isLogged ? (
          <button
            onClick={() => navigate('/documents')}
            className="inline-flex items-center gap-2 bg-white text-blue-700 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition shadow-lg"
          >
            <BsPlusCircle size={22} /> Commencer
          </button>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/login')}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-white text-blue-700 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition shadow"
            >
              Se connecter
            </button>
            <button
              onClick={() => navigate('/register')}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-white/20 border border-white px-6 py-3 rounded-full font-semibold hover:bg-white/30 transition"
            >
              S'inscrire
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
