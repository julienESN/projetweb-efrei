"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_router_dom_1 = require("react-router-dom");
const Navbar_1 = require("./components/Navbar");
const Home_1 = require("./pages/Home");
const Dashboard_1 = require("./pages/Dashboard");
const Documents_1 = require("./pages/Documents");
const DocumentDetail_1 = require("./pages/DocumentDetail");
const DocumentForm_1 = require("./pages/DocumentForm");
const Profile_1 = require("./pages/Profile");
const NotFound_1 = require("./pages/NotFound");
function App() {
    return (<react_router_dom_1.BrowserRouter>
      <Navbar_1.default />
      <react_router_dom_1.Routes>
        <react_router_dom_1.Route path="/" element={<Home_1.default />}/>
        <react_router_dom_1.Route path="/dashboard" element={<Dashboard_1.default />}/>
        <react_router_dom_1.Route path="/documents" element={<Documents_1.default />}/>
        <react_router_dom_1.Route path="/documents/new" element={<DocumentForm_1.default />}/>
        <react_router_dom_1.Route path="/documents/:id" element={<DocumentDetail_1.default />}/>
        <react_router_dom_1.Route path="/documents/:id/edit" element={<DocumentForm_1.default />}/>
        <react_router_dom_1.Route path="/profile" element={<Profile_1.default />}/>
        <react_router_dom_1.Route path="*" element={<NotFound_1.default />}/>
      </react_router_dom_1.Routes>
    </react_router_dom_1.BrowserRouter>);
}
exports.default = App;
//# sourceMappingURL=App.js.map