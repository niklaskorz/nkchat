import {
  MessageResolver,
  RoomResolver,
  SessionResolver,
  UserResolver,
} from './resolvers';
import { buildSchema } from 'type-graphql';
import { pubSub } from './subscriptions';

const getSchema = () =>
  buildSchema({
    resolvers: [MessageResolver, RoomResolver, SessionResolver, UserResolver],
    pubSub,
  });

export default getSchema;
