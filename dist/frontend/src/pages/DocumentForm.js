"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DocumentForm;
const client_1 = require("@apollo/client");
const mutation_1 = require("../graphql/mutation");
const react_1 = require("react");
function DocumentForm() {
    const [createDocument] = (0, client_1.useMutation)(mutation_1.CREATE_DOCUMENT);
    const [form, setForm] = (0, react_1.useState)({ title: '', description: '', fileUrl: '', userId: '' });
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        await createDocument({ variables: { input: form } });
    };
    return (<form onSubmit={handleSubmit}>
      <input name="title" value={form.title} onChange={handleChange} placeholder="Titre"/>
      <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description"/>
      <input name="fileUrl" value={form.fileUrl} onChange={handleChange} placeholder="URL du fichier"/>
      <input name="userId" value={form.userId} onChange={handleChange} placeholder="ID utilisateur"/>
      <button type="submit">Créer</button>
    </form>);
}
//# sourceMappingURL=DocumentForm.js.map