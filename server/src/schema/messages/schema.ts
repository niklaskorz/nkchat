import { gql } from 'apollo-server';

export default gql`
  enum EmbedType {
    YOUTUBE
    ALUGHA
    IMAGE
  }

  type Embed {
    type: EmbedType!
    src: String!
  }

  type Message {
    id: ID!
    createdAt: DateTime!
    content: String!
    author: User!
    viewerIsAuthor: Boolean!
    room: Room!
    embeds: [Embed!]!
  }

  input SendMessageInput {
    roomId: ID!
    content: String!
  }

  extend type Mutation {
    # Sends a message to a specific room and returns the sent message
    sendMessage(input: SendMessageInput!): Message!
  }

  extend type Subscription {
    # Notifies when a message has been sent to the specified room and returns the sent message
    messageWasSent(roomId: ID!): Message!
  }
`;
