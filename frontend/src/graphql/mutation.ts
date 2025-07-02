import { gql } from '@apollo/client';

export const CREATE_USER = gql`
  mutation($input: CreateUserInput!) {
    createUser(createUserInput: $input) {
      id
      email
      username
      role
    }
  }
`;

export const CREATE_DOCUMENT = gql`
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

export const DELETE_DOCUMENT = gql`
  mutation($id: String!) {
    deleteDocument(id: $id)
  }
`;

export const UPDATE_DOCUMENT = gql`
  mutation($id: String!, $input: UpdateDocumentInput!) {
    updateDocument(id: $id, updateDocumentInput: $input) {
      id
      title
      description
    }
  }
`;
