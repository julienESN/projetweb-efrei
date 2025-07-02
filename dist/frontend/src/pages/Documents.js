"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Documents;
const client_1 = require("@apollo/client");
const queries_1 = require("../graphql/queries");
function Documents() {
    const { data, loading, error } = (0, client_1.useQuery)(queries_1.GET_DOCUMENTS);
    if (loading)
        return <p>Chargement...</p>;
    if (error)
        return <p>Erreur : {error.message}</p>;
    return (<div>
      <h2>Mes documents</h2>
      <ul>
        {data.documents.map((doc) => (<li key={doc.id}>{doc.title}</li>))}
      </ul>
    </div>);
}
//# sourceMappingURL=Documents.js.map