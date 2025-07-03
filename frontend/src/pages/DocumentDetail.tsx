import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_DOCUMENT } from '../graphql/queries';
import ReactMarkdown from 'react-markdown';
import { toast } from 'react-hot-toast';
import { useEffect } from 'react';

export default function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, loading, error } = useQuery(GET_DOCUMENT, {
    variables: { id },
    skip: !id,
  });

  useEffect(() => {
    if (error) {
      toast.error('Impossible de charger le document');
    }
  }, [error]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white">
        <div className="text-white/80">Chargement...</div>
      </div>
    );
  }

  if (error || !data?.getDocumentById) {
    return null;
  }

  const doc = data.getDocumentById;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white">
      <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Détail du document
        </h2>
        <div className="mb-4">
          <div className="mb-2">
            <span className="font-semibold">Titre :</span> {doc.title}
          </div>
          <div className="mb-2">
            <span className="font-semibold">Description :</span>{' '}
            {doc.description || (
              <span className="italic text-white/60">Aucune description</span>
            )}
          </div>
          {doc.fileUrl && (
            <div className="mb-2">
              <span className="font-semibold block mb-1">Contenu :</span>
              <div className="border border-white/20 bg-white/10 backdrop-blur-sm rounded p-4 max-h-[400px] overflow-auto prose prose-invert">
                <ReactMarkdown>{doc.fileUrl}</ReactMarkdown>
              </div>
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
