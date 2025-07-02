"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DocumentDetail;
const react_router_dom_1 = require("react-router-dom");
function DocumentDetail() {
    const { id } = (0, react_router_dom_1.useParams)();
    return (<div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Détail du document</h2>
      <p>ID du document : {id}</p>
    </div>);
}
//# sourceMappingURL=DocumentDetail.js.map