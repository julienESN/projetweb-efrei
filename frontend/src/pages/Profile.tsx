/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useQuery } from '@apollo/client';
import { GET_USER } from '../graphql/queries';
import { BsEnvelope, BsPerson, BsShieldLock } from 'react-icons/bs';
import { toast } from 'react-hot-toast';

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

  // Toast sur erreur de requête
  useEffect(() => {
    if (error) toast.error('Erreur de chargement du profil');
  }, [error]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Déconnexion réussie');
    navigate('/login');
  };

  if (loading) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-lg p-8 w-full max-w-md animate-pulse" />
      </section>
    );
  }

  if (error || !data?.user) {
    return null;
  }

  const user = data.user;

  // Avatar initiale
  const initial = user.username?.charAt(0)?.toUpperCase() || '?';

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 px-4">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-2xl p-10 w-full max-w-md text-white">
        <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center text-4xl font-extrabold mb-6">
          {initial}
        </div>
        <h2 className="text-3xl font-bold mb-6 text-center">Mon profil</h2>

        <div className="space-y-4 mb-8 text-lg">
          <div className="flex items-center gap-3">
            <BsEnvelope className="text-blue-600" />{' '}
            <span className="font-semibold">Email :</span>{' '}
            {user.email || 'Non renseigné'}
          </div>
          <div className="flex items-center gap-3">
            <BsPerson className="text-blue-600" />{' '}
            <span className="font-semibold">Nom :</span>{' '}
            {user.username || 'Non renseigné'}
          </div>
          <div className="flex items-center gap-3">
            <BsShieldLock className="text-blue-600" />{' '}
            <span className="font-semibold">Rôle :</span>{' '}
            {user.role || 'Non renseigné'}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-red-600 text-white py-3 rounded-full font-semibold hover:bg-red-700 transition"
        >
          Se déconnecter
        </button>
      </div>
    </section>
  );
}
