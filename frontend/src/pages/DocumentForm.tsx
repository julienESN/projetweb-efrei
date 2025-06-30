export default function DocumentForm() {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Créer / Modifier un document</h2>
      <form className="flex flex-col gap-4 max-w-md">
        <input className="border p-2 rounded" placeholder="Titre" />
        <textarea className="border p-2 rounded" placeholder="Description" />
        <input className="border p-2 rounded" placeholder="URL du fichier" />
        <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">
          Enregistrer
        </button>
      </form>
    </div>
  );
}
