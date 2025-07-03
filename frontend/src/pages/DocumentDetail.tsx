import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from '@apollo/client';
import { GET_DOCUMENT } from '../graphql/queries';

export default function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, loading, error } = useQuery(GET_DOCUMENT, {
    variables: { id },
    skip: !id,
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  if (error || !data?.getDocumentById) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Détail du document</h2>
          <p className="text-red-600 mb-4">Impossible de charger le document.</p>
          <button
            onClick={() => navigate('/documents')}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  const doc = data.getDocumentById;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Détail du document</h2>
        <div className="mb-4">
          <div className="mb-2"><span className="font-semibold">Titre :</span> {doc.title}</div>
          <div className="mb-2"><span className="font-semibold">Description :</span> {doc.description || <span className='italic text-gray-400'>Aucune description</span>}</div>
          {doc.fileUrl && (
            <div className="mb-2">
              <span className="font-semibold">Fichier :</span> <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Ouvrir</a>
            </div>
          )}
        </div>
        <button
          onClick={() => navigate('/documents')}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition mt-4"
        >
          Retour à la liste
        </button>
      </div>
    </div>
  );
}
