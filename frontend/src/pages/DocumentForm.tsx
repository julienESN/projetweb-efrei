import { useMutation } from '@apollo/client';
import { CREATE_DOCUMENT } from '../graphql/mutation';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DocumentForm() {
  const [createDocument, { loading, error }] = useMutation(CREATE_DOCUMENT);
  const [form, setForm] = useState({ title: '', description: '', fileUrl: '' });
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createDocument({
        variables: { input: form },
      });
      setSuccess(true);
      setTimeout(() => navigate('/documents'), 1200);
    } catch (e) {
      console.error(e);
    }
  };

  const isFormValid =
    form.title.trim() && form.description.trim() && form.fileUrl.trim();

  return (
    <div className="max-w-lg mx-auto mt-10 p-8 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6">Créer un document</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-2 text-center">
            Erreur lors de la création : {error.message}
          </div>
        )}
        <div>
          <label className="block mb-1 font-medium">Titre *</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Titre"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Description *</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            rows={4}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">URL du fichier *</label>
          <input
            name="fileUrl"
            value={form.fileUrl}
            onChange={handleChange}
            placeholder="https://..."
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            type="url"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          disabled={loading || !isFormValid}
        >
          {loading ? 'Création...' : 'Créer'}
        </button>
        {success && (
          <p className="text-green-600 text-center mt-2">Document créé !</p>
        )}
      </form>
    </div>
  );
}
