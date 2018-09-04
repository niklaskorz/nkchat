import schema from './schema';
import Message from './resolvers/Message';
import Mutation from './resolvers/Mutation';
import Subscription from './resolvers/Subscription';

const resolvers = {
  Message,
  Mutation,
  Subscription,
};

export { schema, resolvers };
