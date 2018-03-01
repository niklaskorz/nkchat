import { makeExecutableSchema } from 'graphql-tools';
import { UserModel, RoomModel, UserInRoomModel } from '../models';

const typeDefs = `
  type Query {
    users: [User!]!
    rooms: [Room!]!
  }

  type User {
    id: String!
    name: String!
  }

  type Room {
    id: String!
    name: String!
    owner: User!
  }
`;

const resolvers = {
  Query: {
    async users() {
      return await UserModel.find().exec();
    },
    async rooms() {
      return await RoomModel.find().exec();
    }
  },
  Room: {
    async owner() {
      return await UserInRoomModel.findOne();
    }
  }
};

export default makeExecutableSchema({
  typeDefs,
  resolvers
});
