import { gql } from 'apollo-server';

export default gql`
  # A room contains information about the messages sent into the room and the
  # users participating in the room's conversation
  type Room {
    id: ID!
    createdAt: DateTime!
    name: String!
    owner: User!
    viewerIsOwner: Boolean!
    members: [User!]!
    viewerIsMember: Boolean!
    messages: [Message!]!
  }

  extend type Query {
    # Queries a room by id, returns the room if found, null otherwise
    room(id: ID!): Room
  }

  input CreateRoomInput {
    name: String!
  }

  input UpdateRoomInput {
    roomId: ID!
    name: String!
  }

  input JoinRoomInput {
    roomId: ID!
  }

  extend type Mutation {
    # Creates a new room and returns the created room
    createRoom(input: CreateRoomInput!): Room!
    # Updates a room and returns the updated room
    updateRoom(input: UpdateRoomInput!): Room!
    # Makes the active user join a room and returns the joined room
    joinRoom(input: JoinRoomInput!): Room!
  }

  extend type Subscription {
    # Notifies when the specified room has been updated and returns the updated room
    roomWasUpdated(roomId: ID!): Room!
    # Notifies when a user has joined the specified room and returns the joined user
    userJoinedRoom(roomId: ID!): User!
  }
`;
