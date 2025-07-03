/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation } from '@apollo/client';
import { GET_DOCUMENTS_BY_USER } from '../graphql/queries';
import { DELETE_DOCUMENT } from '../graphql/mutation';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useEffect } from 'react';
import { BsFileEarmarkText } from 'react-icons/bs';

export default function Documents() {
  const token = localStorage.getItem('token');
  let userId = '';
  if (token) {
    try {
      const decoded: any = jwtDecode(token);
      userId = decoded.sub;
    } catch (e) {
      console.error(e);
    }
  }

  const { data, loading, error, refetch } = useQuery(GET_DOCUMENTS_BY_USER, {
    variables: { userId },
    skip: !userId,
    fetchPolicy: 'network-only',
  });

  const [deleteDocument, { loading: loadingDelete }] =
    useMutation(DELETE_DOCUMENT);
  const navigate = useNavigate();

  const handleDelete = async (id: string) => {
    toast(
      (t) => (
        <span className="flex gap-3 items-center">
          Supprimer ce document&nbsp;?
          <button
            className="bg-red-600 text-white px-3 py-1 rounded text-sm"
            onClick={async () => {
              toast.dismiss(t.id);
              await deleteDocument({ variables: { id } });
              toast.success('Document supprimé');
              refetch();
            }}
          >
            Oui
          </button>
          <button
            className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm"
            onClick={() => toast.dismiss(t.id)}
          >
            Non
          </button>
        </span>
      ),
      { duration: 8000 }
    );
  };

  useEffect(() => {
    if (error) {
      toast.error('Erreur lors du chargement des documents');
    }
  }, [error]);

  if (loading)
    return (
      <div className="max-w-5xl mx-auto py-10 px-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div
            key={idx}
            className="animate-pulse bg-white/10 backdrop-blur-sm rounded-lg shadow-md p-6 flex flex-col gap-4 border border-gray-100"
          >
            <div className="h-6 bg-gray-300 rounded w-3/4" />
            <div className="h-4 bg-gray-300 rounded w-full" />
            <div className="h-4 bg-gray-300 rounded w-5/6" />
            <div className="mt-auto flex gap-2">
              <div className="h-8 bg-gray-300 rounded w-20" />
              <div className="h-8 bg-gray-300 rounded w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  if (error) return null;

  const documents = data?.getDocumentsByUser || [];

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 relative min-h-[80vh]">
      <h2 className="text-3xl font-bold mb-8 text-center">Mes documents</h2>
      {documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20 text-white/80 gap-3">
          <BsFileEarmarkText size={64} className="text-blue-600" />
          <p className="text-lg">Aucun document pour le moment</p>
          <p className="text-sm">Cliquez sur le bouton + pour en créer un !</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc: any) => (
            <div
              key={doc.id}
              className="bg-white/10 backdrop-blur-sm rounded-lg shadow-md p-6 flex flex-col hover:shadow-xl transition group border border-gray-100"
            >
              <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-700 transition">
                {doc.title}
              </h3>
              <p className="text-white/90 mb-4 line-clamp-3">
                {doc.description || (
                  <span className="italic text-gray-400">
                    Aucune description
                  </span>
                )}
              </p>
              <div className="text-sm text-white/80 mb-2">ID: {doc.id}</div>
              <div className="mt-auto flex gap-2">
                <button
                  onClick={() => navigate(`/documents/${doc.id}`)}
                  className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm font-medium"
                >
                  Voir détail
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm font-medium"
                  disabled={loadingDelete}
                >
                  {loadingDelete ? 'Suppression...' : 'Supprimer'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Bouton flottant pour créer un document */}
      <button
        onClick={() => navigate('/documents/new')}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-blue-600 text-white text-3xl shadow-lg flex items-center justify-center hover:bg-blue-700 transition"
        aria-label="Créer un document"
        title="Créer un document"
      >
        +
      </button>
    </div>
  );
}
