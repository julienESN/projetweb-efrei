import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { REGISTER_MUTATION } from '../graphql/mutation';
import { toast } from 'react-hot-toast';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const role = 'USER';
  const [register, { loading, error }] = useMutation(REGISTER_MUTATION);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await register({
        variables: {
          registerInput: { email, username, password, role },
        },
      });
      if (data?.register?.access_token) {
        toast.success('Inscription réussie');
        window.location.href = '/login';
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (error) {
      toast.error("Erreur d'inscription");
    }
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="bg-white/10 backdrop-blur-sm p-8 rounded-xl shadow-xl w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Inscription</h2>
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Nom d'utilisateur"
          className="w-full mb-4 p-2 border rounded"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          disabled={loading}
        >
          {loading ? 'Inscription...' : "S'inscrire"}
        </button>
        {/* erreurs via toast */}
      </form>
      <div className="mt-4 text-center">
        <span>Déjà un compte ? </span>
        <Link to="/login" className="text-blue-600 hover:underline">
          Se connecter
        </Link>
      </div>
    </div>
  );
};

export default Register;
