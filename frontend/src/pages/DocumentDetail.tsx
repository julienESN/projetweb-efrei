import { useParams } from "react-router-dom";

export default function DocumentDetail() {
  const { id } = useParams();
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Détail du document</h2>
      <p>ID du document : {id}</p>
    </div>
  );
}
