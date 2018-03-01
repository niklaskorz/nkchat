import winston from 'winston';
import { makeExecutableSchema } from 'graphql-tools';
import {
  InstanceType,
  User,
  Room,
  UserModel,
  RoomModel,
  UserInRoomModel,
} from '../models';

const typeDefs = `
  type User {
    id: String!
    name: String!
  }

  type Room {
    id: String!
    name: String!
    owner: User!
  }

  type Query {
    users: [User!]!
    rooms: [Room!]!
  }

  type Mutation {
    createUser(name: String!): User!
    createRoom(name: String!, ownerId: String!): Room!
  }
`;

const resolvers = {
  Query: {
    async users() {
      return await UserModel.find().exec();
    },
    async rooms() {
      return await RoomModel.find().exec();
    },
  },
  User: {
    id: (user: InstanceType<User>) => user._id,
  },
  Room: {},
  Mutation: {
    async createUser(root: any, { name }: { name: string }) {
      const user = new UserModel({
        name,
      });
      return await user.save();
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

      return room;
    },
  },
};

export default makeExecutableSchema({
  typeDefs,
  resolvers,
});
