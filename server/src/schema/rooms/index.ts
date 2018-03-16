import fs from 'fs';
import path from 'path';
import Mutation from './resolvers/Mutation';
import Query from './resolvers/Query';
import Room from './resolvers/Room';
import Subscription from './resolvers/Subscription';

export const schema = fs.readFileSync(path.join(__dirname, 'schema.graphql'), {
  encoding: 'utf8',
});

export const resolvers = {
  Mutation,
  Query,
  Room,
  Subscription,
};
