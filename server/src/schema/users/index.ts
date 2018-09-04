import schema from './schema';
import Mutation from './resolvers/Mutation';
import Query from './resolvers/Query';
import Session from './resolvers/Session';
import User from './resolvers/User';

const resolvers = {
  Mutation,
  Query,
  Session,
  User,
};

export { schema, resolvers };
