import { useMutation } from '@apollo/client';
import { CREATE_DOCUMENT } from '../graphql/mutation';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { toast } from 'react-hot-toast';
import MDEditor from '@uiw/react-md-editor';

export default function DocumentForm() {
  const [createDocument, { loading }] = useMutation(CREATE_DOCUMENT);
  const [form, setForm] = useState({ title: '', description: '', content: '' });
  const [touched, setTouched] = useState<
    Partial<Record<keyof typeof form, boolean>>
  >({});
  const navigate = useNavigate();

  // Modèles prédéfinis
  const presets = [
    {
      label: 'Clause de confidentialité',
      title: 'Clause de confidentialité',
      description: 'Conditions de non-divulgation des informations sensibles.',
      content:
        '## Clause de confidentialité\n\nToutes les informations contenues dans ce document sont strictement confidentielles et ne peuvent être divulguées sans autorisation écrite préalable.',
    },
    {
      label: 'Procédure RGPD – Droit à l’oubli',
      title: 'Procédure RGPD – Droit à l’oubli',
      description:
        'Étapes pour répondre au droit à l’oubli conformément au RGPD.',
      content:
        '### Droit à l’oubli\n\n1. Réception de la demande\n2. Vérification de l’identité\n3. Suppression des données dans un délai de 30 jours',
    },
    {
      label: 'NDA (Accord de non-divulgation)',
      title: 'Accord de non-divulgation (NDA)',
      description:
        'Document légal encadrant le partage d’informations confidentielles.',
      content:
        '***\n**Non-Disclosure Agreement**\n\nLes parties conviennent de ne pas divulguer les informations confidentielles échangées dans le cadre de ce projet.',
    },
    {
      label: 'Politique de sauvegarde',
      title: 'Politique de sauvegarde des données',
      description: 'Règles internes de sauvegarde et de rétention des données.',
      content:
        '- Sauvegarde quotidienne automatique\n- Stockage chiffré AES-256\n- Rétention : 90 jours',
    },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setTouched({ ...touched, [e.target.name as keyof typeof form]: true });
  };

  // Validation helpers
  const getFieldError = (name: keyof typeof form) => {
    if (!touched[name]) return '';
    const value = form[name].trim();
    if (!value) return 'Ce champ est requis';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createDocument({
        variables: {
          input: {
            title: form.title,
            description: form.description,
            fileUrl: form.content,
          },
        },
      });
      toast.success('Document sauvegardé');
      setTimeout(() => navigate('/documents'), 1200);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Création impossible';
      console.error(e);
      toast.error(`Erreur : ${message}`);
    }
  };

  const isFormValid =
    form.title.trim() && form.description.trim() && form.content.trim();

  return (
    <section className="min-h-screen flex items-start justify-center bg-gradient-to-br from-blue-600 to-purple-600 px-4 py-10">
      <div className="w-full max-w-2xl bg-white/10 backdrop-blur-sm rounded-xl shadow-2xl p-10">
        <h2 className="text-2xl font-bold mb-6">Créer un document</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block mb-1 font-medium">
              Titre <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Titre"
              className={`w-full border rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                getFieldError('title') ? 'border-red-500' : ''
              }`}
              required
            />
            {getFieldError('title') && (
              <p className="text-sm text-red-600 mt-1">
                {getFieldError('title')}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="description" className="block mb-1 font-medium">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Description"
              className={`w-full border rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                getFieldError('description') ? 'border-red-500' : ''
              }`}
              required
              rows={4}
            />
            {getFieldError('description') && (
              <p className="text-sm text-red-600 mt-1">
                {getFieldError('description')}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="content" className="block mb-1 font-medium">
              Contenu <span className="text-red-500">*</span>
            </label>
            {/* Sélecteur de modèles */}
            <select
              onChange={(e) => {
                const selected = presets.find(
                  (p) => p.label === e.target.value
                );
                if (selected) {
                  setForm({
                    title: selected.title,
                    description: selected.description,
                    content: selected.content,
                  });
                  toast.success(`Modèle “${selected.label}” appliqué`);
                  e.target.value = '';
                }
              }}
              className="preset-select border rounded px-3 py-2 mb-3 bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Insérer un modèle…</option>
              {presets.map((p) => (
                <option key={p.label} value={p.label}>
                  {p.label}
                </option>
              ))}
            </select>
            <div data-color-mode="light">
              <MDEditor
                value={form.content}
                onChange={(v) => setForm({ ...form, content: v || '' })}
                previewOptions={{
                  components: {
                    code: ({ children }) => (
                      <code className="text-red-500">{children}</code>
                    ),
                  },
                }}
                className="border rounded"
              />
            </div>
            {getFieldError('content') && (
              <p className="text-sm text-red-600 mt-1">
                {getFieldError('content')}
              </p>
            )}
          </div>
          {/* Aperçu markdown en temps réel */}
          {form.content.trim() && (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded mt-4 text-white">
              <h4 className="font-semibold mb-2">Aperçu</h4>
              <ReactMarkdown className="prose max-w-none">
                {form.content}
              </ReactMarkdown>
            </div>
          )}
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={loading || !isFormValid}
            >
              {loading && (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              )}
              {loading ? 'Création...' : 'Créer'}
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 bg-gray-200 text-gray-800 py-2 rounded font-semibold hover:bg-gray-300 transition disabled:opacity-50"
              disabled={loading}
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
