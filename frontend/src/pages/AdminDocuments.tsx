import { useQuery } from '@apollo/client';
import { GET_DOCUMENTS } from '../graphql/queries';

export default function AdminDocuments() {
  const { data, loading, error } = useQuery(GET_DOCUMENTS, {
    fetchPolicy: 'network-only',
  });

  if (loading) return <div className="flex justify-center items-center h-64"><span className="text-gray-500">Chargement...</span></div>;
  if (error) return (
    <div className="max-w-2xl mx-auto mt-10">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-center">
        Erreur lors du chargement des documents : {error.message}
      </div>
    </div>
  );

  const documents = data?.documents || [];

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 relative min-h-[80vh]">
      <h2 className="text-3xl font-bold mb-8 text-center">Tous les documents (Admin)</h2>
      {documents.length === 0 ? (
        <div className="text-center text-gray-500 mt-16">Aucun document trouvé.</div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc: any) => (
            <div
              key={doc.id}
              className="bg-white rounded-lg shadow-md p-6 flex flex-col hover:shadow-xl transition group border border-gray-100"
            >
              <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-700 transition">{doc.title}</h3>
              <p className="text-gray-600 mb-4 line-clamp-3">{doc.description || <span className='italic text-gray-400'>Aucune description</span>}</p>
              <div className="text-sm text-gray-500 mb-2">ID: {doc.id}</div>
              <div className="text-sm text-gray-500 mb-2">User ID: {doc.userId}</div>
              {doc.fileUrl && (
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  Voir le fichier
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 