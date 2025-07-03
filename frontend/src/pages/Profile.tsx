import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useQuery } from '@apollo/client';
import { GET_USER } from '../graphql/queries';

export default function Profile() {
  let userId = '';
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');
  }, [navigate]);

  // Extraire l'id utilisateur du JWT
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const decoded: any = jwtDecode(token);
      userId = decoded.sub;
    } catch (e) {
      userId = '';
    }
  }

  const { data, loading, error } = useQuery(GET_USER, {
    variables: { id: userId },
    skip: !userId,
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return (
      <section className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="w-full max-w-md text-center">
          <h2 className="text-3xl font-bold mb-6">Mon profil</h2>
          <p className="text-gray-500 mb-8">Chargement...</p>
        </div>
      </section>
    );
  }

  if (error || !data?.user) {
    return (
      <section className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="w-full max-w-md text-center">
          <h2 className="text-3xl font-bold mb-6">Mon profil</h2>
          <p className="text-red-600 mb-8">Impossible de charger les informations utilisateur.</p>
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition font-semibold"
          >
            Se déconnecter
          </button>
        </div>
      </section>
    );
  }

  const user = data.user;

  return (
    <section className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md">
        <h2 className="text-3xl font-bold mb-8 text-center">Mon profil</h2>
        <div className="space-y-4 mb-8 text-lg">
          <div><span className="font-semibold">Email :</span> {user.email || 'Non renseigné'}</div>
          <div><span className="font-semibold">Nom d'utilisateur :</span> {user.username || 'Non renseigné'}</div>
          <div><span className="font-semibold">Rôle :</span> {user.role || 'Non renseigné'}</div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition font-semibold"
        >
          Se déconnecter
        </button>
      </div>
    </section>
  );
}
