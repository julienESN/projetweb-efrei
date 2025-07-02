"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@apollo/client");
const context_1 = require("@apollo/client/link/context");
const client_2 = require("react-dom/client");
require("./index.css");
const App_tsx_1 = require("./App.tsx");
const apiUrl = import.meta.env.VITE_API_URL;
const httpLink = (0, client_1.createHttpLink)({
    uri: apiUrl,
});
const authLink = (0, context_1.setContext)((_, { headers }) => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : "",
        }
    };
});
const client = new client_1.ApolloClient({
    link: authLink.concat(httpLink),
    cache: new client_1.InMemoryCache(),
});
(0, client_2.createRoot)(document.getElementById('root')).render(<client_1.ApolloProvider client={client}>
    <App_tsx_1.default />
  </client_1.ApolloProvider>);
//# sourceMappingURL=main.js.map