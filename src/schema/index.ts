import winston from 'winston';
import { makeExecutableSchema } from 'graphql-tools';
import { schema as scalarSchema, resolvers as scalarRevolers } from './scalars';
import {
  InstanceType,
  User,
  Room,
  UserModel,
  RoomModel,
  UserInRoomModel,
} from '../models';

const typeDefs = `
  ${scalarSchema}

  type User {
    id: String!
    createdAt: String!
    name: String!
    rooms: [Room!]!
  }

  type Room {
    id: String!
    createdAt: String!
    name: String!
    owner: User!
    viewerIsOwner: Boolean!
    members: [User!]!
    messages: [Message!]!
  }

  type Message {
    id: String!
    createdAt: String!
    content: String!
    author: User!
    viewerIsAuthor: Boolean!
    room: Room!
  }

  type Query {
    viewer: User!
  }

  type RegisterInput {
    name: String!
    password: String!
  }

  type RegisterPayload {
    user: User!
  }

  type LoginInput {
    name: String!
    password: String!
  }

  type LoginPayload {
    user: User!
  }

  type CreateRoomInput {
    name: String!
  }

  type CreateRoomPayload {
    room: Room!
  }

  type UpdateRoomInput {
    name: String
  }

  type UpdateRoomPayload {
    room: Room!
  }

  type SendMessageInput {
    roomId: String!
    content: String!
  }

  type SendMessagePayload {
    message: Message!
  }

  type Mutation {
    register(input: RegisterInput!): RegisterPayload
    login(input: LoginInput!): LoginPayload
    createRoom(input: CreateRoomInput!): CreateRoomPayload
    updateRoom(input: UpdateRoomInput!): UpdateRoomPayload
    sendMessage(input: SendMessageInput!): SendMessagePayload
  }
`;

const resolvers = {
  ...scalarRevolers,
  Query: {
    async viewer() {
      return await UserModel.findOne().exec();
    },
  },
  Mutation: {
    async register(
      root: any,
      { payload }: { payload: { name: string; password: string } },
    ) {
      const user = new UserModel({
        name: payload.name,
      });
      return { user: await user.save() };
    },
    async createRoom(
      root: any,
      { name, ownerId }: { name: string; ownerId: string },
    ) {
      const user = await UserModel.findById(ownerId).exec();
      if (!user) {
        throw new Error('User not found');
      }

      const room = await RoomModel.create({
        name,
        owner: ownerId,
      });
      room.owner = user;

      await UserInRoomModel.create({
        user: ownerId,
        room: room.id,
      });

      return { room };
    },
  },
};

export default makeExecutableSchema({
  typeDefs,
  resolvers,
});
