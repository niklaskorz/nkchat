import { ObjectID } from 'mongodb';
import { buildSchema } from 'type-graphql';
import { MessageResolver, RoomResolver, UserResolver } from './resolvers';
import { ObjectIDScalar } from './scalars';
import { pubSub } from './subscriptions';

const getSchema = () =>
  buildSchema({
    resolvers: [MessageResolver, RoomResolver, UserResolver],
    scalarsMap: [{ type: ObjectID, scalar: ObjectIDScalar }],
    pubSub,
  });

export default getSchema;
