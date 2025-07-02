import { useMutation } from '@apollo/client';
import { CREATE_DOCUMENT } from '../graphql/mutation';
import { useState } from 'react';

export default function DocumentForm() {
  const [createDocument] = useMutation(CREATE_DOCUMENT);
  const [form, setForm] = useState({ title: '', description: '', fileUrl: '', userId: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createDocument({ variables: { input: form } });
    // Redirige ou affiche un message
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" value={form.title} onChange={handleChange} placeholder="Titre" />
      <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" />
      <input name="fileUrl" value={form.fileUrl} onChange={handleChange} placeholder="URL du fichier" />
      <input name="userId" value={form.userId} onChange={handleChange} placeholder="ID utilisateur" />
      <button type="submit">Créer</button>
    </form>
  );
}