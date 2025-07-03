/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from '@apollo/client';
import { GET_DOCUMENTS } from '../graphql/queries';

export default function Documents() {
  const { data, loading, error } = useQuery(GET_DOCUMENTS);

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>Erreur : {error.message}</p>;

  return (
    <div>
      <h2>Mes documents</h2>
      <ul>
        {data.documents.map((doc: any) => (
          <li key={doc.id}>{doc.title}</li>
        ))}
      </ul>
    </div>
  );
}
