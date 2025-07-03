/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from '@apollo/client';
import { GET_USERS } from '../graphql/queries';

export default function AdminUsers() {
  const { data, loading, error } = useQuery(GET_USERS, {
    fetchPolicy: 'network-only',
  });

  if (loading) return <div className="flex justify-center items-center h-64"><span className="text-gray-500">Chargement...</span></div>;
  if (error) return (
    <div className="max-w-2xl mx-auto mt-10">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-center">
        Erreur lors du chargement des utilisateurs : {error.message}
      </div>
    </div>
  );

  const users = data?.users || [];

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 relative min-h-[80vh]">
      <h2 className="text-3xl font-bold mb-8 text-center">Tous les utilisateurs (Admin)</h2>
      {users.length === 0 ? (
        <div className="text-center text-gray-500 mt-16">Aucun utilisateur trouvé.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow-md">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Nom d'utilisateur</th>
                <th className="px-4 py-2 text-left">Rôle</th>
                <th className="px-4 py-2 text-left">Créé le</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user: any) => (
                <tr key={user.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-700">{user.id}</td>
                  <td className="px-4 py-2 text-sm">{user.email}</td>
                  <td className="px-4 py-2 text-sm">{user.username}</td>
                  <td className="px-4 py-2 text-sm">{user.role}</td>
                  <td className="px-4 py-2 text-sm">{new Date(user.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 