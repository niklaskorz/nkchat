import fs from 'fs';
import path from 'path';
import Mutation from './resolvers/Mutation';
import Query from './resolvers/Query';
import Session from './resolvers/Session';
import User from './resolvers/User';

export const schema = fs.readFileSync(path.join(__dirname, 'schema.graphql'), {
  encoding: 'utf8',
});

export const resolvers = {
  Mutation,
  Query,
  Session,
  User,
};
