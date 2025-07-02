"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET_DOCUMENT = exports.GET_DOCUMENTS = exports.GET_USER = exports.GET_USERS = void 0;
const client_1 = require("@apollo/client");
exports.GET_USERS = (0, client_1.gql) `
  query {
    users {
      id
      email
      username
      role
      createdAt
    }
  }
`;
exports.GET_USER = (0, client_1.gql) `
  query($id: String!) {
    user(id: $id) {
      id
      email
      username
      role
    }
  }
`;
exports.GET_DOCUMENTS = (0, client_1.gql) `
  query {
    documents {
      id
      title
      description
      fileUrl
      userId
    }
  }
`;
exports.GET_DOCUMENT = (0, client_1.gql) `
  query($id: String!) {
    getDocumentById(id: $id) {
      id
      title
      description
      fileUrl
      userId
    }
  }
`;
//# sourceMappingURL=queries.js.map