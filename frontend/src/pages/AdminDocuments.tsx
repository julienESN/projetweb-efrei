/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation } from '@apollo/client';
import { GET_DOCUMENTS } from '../graphql/queries';
import { DELETE_DOCUMENT } from '../graphql/mutation';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function AdminDocuments() {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useQuery(GET_DOCUMENTS, {
    fetchPolicy: 'network-only',
  });

  const [deleteDocument] = useMutation(DELETE_DOCUMENT, {
    onCompleted: () => {
      refetch();
      toast.success('Document supprimé');
    },
    onError: () => {
      toast.error('Erreur lors de la suppression');
    },
  });

  const handleDeleteDocument = async (
    documentId: string,
    documentTitle: string
  ) => {
    toast(
      (t) => (
        <span className="flex gap-3 items-center">
          Supprimer «{documentTitle}»&nbsp;?
          <button
            className="bg-red-600 text-white px-3 py-1 rounded text-sm"
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await deleteDocument({ variables: { id: documentId } });
              } catch (err) {
                console.error(err);
              }
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

  if (loading) return null;
  if (error) {
    toast.error('Erreur lors du chargement des documents');
    return null;
  }

  const documents = data?.documents || [];

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 relative min-h-[80vh]">
      <h2 className="text-3xl font-bold mb-8 text-center">
        Tous les documents (Admin)
      </h2>
      {documents.length === 0 ? (
        <div className="text-center text-gray-500 mt-16">
          Aucun document trouvé.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc: any) => (
            <div
              key={doc.id}
              className="bg-white/10 backdrop-blur-sm rounded-lg shadow-md p-6 flex flex-col hover:shadow-xl transition group border border-gray-100 relative"
            >
              {/* Bouton de suppression */}
              <button
                onClick={() => handleDeleteDocument(doc.id, doc.title)}
                className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors group/delete"
                title="Supprimer le document"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-700 transition pr-10">
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
              <div className="text-sm text-white/80 mb-2">
                User ID: {doc.userId}
              </div>
              <button
                onClick={() => navigate(`/documents/${doc.id}`)}
                className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm font-medium mt-auto"
              >
                Voir détail
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
