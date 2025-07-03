import { gql } from '@apollo/client';

export const GET_USERS = gql`
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

export const GET_USER = gql`
  query($id: String!) {
    user(id: $id) {
      id
      email
      username
      role
    }
  }
`;

export const GET_DOCUMENTS = gql`
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

export const GET_DOCUMENT = gql`
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

export const GET_DOCUMENTS_BY_USER = gql`
  query($userId: String!) {
    getDocumentsByUser(userId: $userId) {
      id
      title
      description
      fileUrl
      userId
    }
  }
`;