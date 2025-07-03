import { useQuery, useMutation } from '@apollo/client';
import { GET_DOCUMENTS_BY_USER } from '../graphql/queries';
import { DELETE_DOCUMENT } from '../graphql/mutation';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';


export default function Documents() {
  const token = localStorage.getItem('token');
  let userId = '';
  if (token) {
    try {
      const decoded: any = jwtDecode(token);
      userId = decoded.sub;
    } catch (e) {
      // Token invalide
    }
  }

  const { data, loading, error, refetch } = useQuery(GET_DOCUMENTS_BY_USER, {
    variables: { userId },
    skip: !userId,
    fetchPolicy: 'network-only',
  });

  const [deleteDocument, { loading: loadingDelete }] = useMutation(DELETE_DOCUMENT);
  const navigate = useNavigate();

  const handleDelete = async (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce document ?')) {
      await deleteDocument({ variables: { id } });
      refetch();
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><span className="text-gray-500">Chargement...</span></div>;
  if (error) return (
    <div className="max-w-2xl mx-auto mt-10">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-center">
        Erreur lors du chargement des documents : {error.message}
      </div>
    </div>
  );

  const documents = data?.getDocumentsByUser || [];

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 relative min-h-[80vh]">
      <h2 className="text-3xl font-bold mb-8 text-center">Mes documents</h2>
      {documents.length === 0 ? (
        <div className="text-center text-gray-500 mt-16">Vous n'avez pas encore de document.<br/>Cliquez sur <span className="font-bold text-blue-600">+</span> pour en créer un !</div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc: any) => (
            <div
              key={doc.id}
              className="bg-white rounded-lg shadow-md p-6 flex flex-col hover:shadow-xl transition group border border-gray-100"
            >
              <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-700 transition">{doc.title}</h3>
              <p className="text-gray-600 mb-4 line-clamp-3">{doc.description || <span className='italic text-gray-400'>Aucune description</span>}</p>
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
