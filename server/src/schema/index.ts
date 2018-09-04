import { gql } from 'apollo-server';
import { merge } from 'lodash';
import {
  schema as scalarSchema,
  resolvers as scalarResolvers,
} from './scalars';
import {
  schema as messagesSchema,
  resolvers as messagesResolvers,
} from './messages';
import { schema as roomsSchema, resolvers as roomsResolvers } from './rooms';
import { schema as usersSchema, resolvers as usersResolvers } from './users';

const typeDefs = gql`
  # The root type for querying data
  type Query
  # The root type for mutating data
  type Mutation
  # The root type for subscribing to data changes
  type Subscription

  ${scalarSchema}
  ${messagesSchema}
  ${roomsSchema}
  ${usersSchema}
`;

const resolvers = merge(
  {},
  scalarResolvers,
  messagesResolvers,
  roomsResolvers,
  usersResolvers,
);

export { typeDefs, resolvers };
