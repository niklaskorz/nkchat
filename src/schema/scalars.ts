import { GraphQLDate, GraphQLDateTime, GraphQLTime } from 'graphql-iso-date';

export const schema = `
  scalar Date
  scalar DateTime
  scalar Time
`;

export const resolvers = {
  Date: GraphQLDate,
  DateTime: GraphQLDateTime,
  Time: GraphQLTime,
};
