"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Navbar;
const react_router_dom_1 = require("react-router-dom");
function Navbar() {
    return (<nav className="bg-gray-800 text-white px-6 py-4 flex justify-between items-center">
      <react_router_dom_1.Link to="/" className="font-bold text-xl">Secure Docs</react_router_dom_1.Link>
      <div className="flex gap-4">
        <react_router_dom_1.Link to="/dashboard" className="hover:underline">Dashboard</react_router_dom_1.Link>
        <react_router_dom_1.Link to="/documents" className="hover:underline">Documents</react_router_dom_1.Link>
        <react_router_dom_1.Link to="/profile" className="hover:underline">Profil</react_router_dom_1.Link>
      </div>
    </nav>);
}
//# sourceMappingURL=Navbar.js.map