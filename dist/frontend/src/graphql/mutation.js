"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UPDATE_DOCUMENT = exports.DELETE_DOCUMENT = exports.CREATE_DOCUMENT = exports.CREATE_USER = void 0;
const client_1 = require("@apollo/client");
exports.CREATE_USER = (0, client_1.gql) `
  mutation($input: CreateUserInput!) {
    createUser(createUserInput: $input) {
      id
      email
      username
      role
    }
  }
`;
exports.CREATE_DOCUMENT = (0, client_1.gql) `
  mutation($input: CreateDocumentInput!) {
    createDocument(createDocumentInput: $input) {
      id
      title
      description
      fileUrl
      userId
    }
  }
`;
exports.DELETE_DOCUMENT = (0, client_1.gql) `
  mutation($id: String!) {
    deleteDocument(id: $id)
  }
`;
exports.UPDATE_DOCUMENT = (0, client_1.gql) `
  mutation($id: String!, $input: UpdateDocumentInput!) {
    updateDocument(id: $id, updateDocumentInput: $input) {
      id
      title
      description
    }
  }
`;
//# sourceMappingURL=mutation.js.map