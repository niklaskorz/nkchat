import fs from 'fs';
import path from 'path';
import Message from './resolvers/Message';
import Mutation from './resolvers/Mutation';
import Subscription from './resolvers/Subscription';

export const schema = fs.readFileSync(path.join(__dirname, 'schema.graphql'), {
  encoding: 'utf8',
});

export const resolvers = {
  Message,
  Mutation,
  Subscription,
};
