import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { LOGIN_MUTATION } from '../graphql/mutation';
import { toast } from 'react-hot-toast';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [login, { loading, error }] = useMutation(LOGIN_MUTATION);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await login({
        variables: {
          loginInput: { email, password },
        },
      });
      if (data?.login?.access_token) {
        localStorage.setItem('token', data.login.access_token);
        toast.success('Connexion réussie');
        window.location.href = '/'; // Redirection après login
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (error) {
      toast.error('Erreur de connexion');
    }
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="bg-white/10 backdrop-blur-sm p-8 rounded-xl shadow-xl w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Connexion</h2>
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          className="w-full mb-4 p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
        {/* Erreurs gérées par toast */}
      </form>
      <div className="mt-4 text-center">
        <span>Pas encore de compte ? </span>
        <Link to="/register" className="text-blue-600 hover:underline">
          S'inscrire
        </Link>
      </div>
    </div>
  );
};

export default Login;
