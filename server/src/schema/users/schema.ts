import { gql } from 'apollo-server';

export default gql`
  # A user is a user, not much left to say here
  type User {
    id: ID!
    createdAt: DateTime!
    name: String!
    isViewer: Boolean!
    rooms: [Room!]!
  }

  # A login session for authenticating user requests
  type Session {
    id: ID!
    createdAt: DateTime!
    user: User!
  }

  extend type Query {
    # Returns the authenticated user if the querying user is authenticated, null otherwise
    viewer: User
    # Returns the active session if the querying user is authenticated, null otherwise
    session: Session
  }

  input RegisterInput {
    name: String!
    password: String!
  }

  input LoginInput {
    name: String!
    password: String!
  }

  extend type Mutation {
    # Creates a new user and returns a login session for the created user
    register(input: RegisterInput!): Session!
    # Creates and returns a login session for the specified user
    login(input: LoginInput!): Session!
    # Invalidates the active user session and returns the session id
    logout: ID!
  }
`;
