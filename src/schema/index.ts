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
  Room: {
    async owner(room: InstanceType<Room>) {
      const userInRoom = await UserInRoomModel.findOne({
        room: room.id,
      });
      if (!userInRoom) {
        throw new Error('Nope');
      }
      return userInRoom.user as InstanceType<User>;
    },
  },
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
      const user = UserModel.findById(ownerId).exec();
      if (!user) {
        throw new Error('User not found');
      }
      const room = await RoomModel.create({
        name,
        owner: ownerId,
      });
      await UserInRoomModel.create({
        user: user.id,
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
