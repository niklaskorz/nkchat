import schema from './schema';
import Mutation from './resolvers/Mutation';
import Query from './resolvers/Query';
import Room from './resolvers/Room';
import Subscription from './resolvers/Subscription';

const resolvers = {
  Mutation,
  Query,
  Room,
  Subscription,
};

export { schema, resolvers };
