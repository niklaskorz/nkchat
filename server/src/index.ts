import winston from 'winston';
import mongoose from 'mongoose';
import { Request } from 'express';
import { ApolloServer } from 'apollo-server';
import { SessionModel, InstanceType, User } from './models';
import { typeDefs, resolvers } from './schema';
import Context from './Context';
import * as config from './config';

mongoose.connect(`mongodb://${config.mongodbHost}/nkchat`);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }: { req?: Request }): Promise<Context> => {
    const ctx: Context = { state: {} };

    if (!req) {
      return ctx;
    }

    // Check if Authentication with Bearer token is passed
    // Also see https://swagger.io/docs/specification/authentication/bearer-authentication/
    const auth = req.cookies.Authentication;
    if (auth) {
      const [authType, ...parts] = auth.split(' ');
      if (authType !== 'Bearer') {
        throw new Error('Unsupported authentication type: ' + authType);
      }
      if (parts.length > 1) {
        throw new Error('Malformed authentication header');
      }

      const sessionId = parts[0];
      const session = await SessionModel.findById(sessionId)
        .populate('user')
        .exec();
      if (session) {
        ctx.state.session = session;
        ctx.state.viewer = session.user as InstanceType<User>;
      }
    }

    return ctx;
  },
  subscriptions: {
    async onConnect(connectionParams: { session?: string }): Promise<Context> {
      if (!connectionParams.session) {
        throw new Error('Authentication required');
      }

      const session = await SessionModel.findById(connectionParams.session)
        .populate('user')
        .exec();
      if (!session) {
        throw new Error('Invalid session');
      }

      return {
        state: {
          session,
          viewer: session.user as InstanceType<User>,
        },
      };
    },
  },
});

server.listen().then(({ url, subscriptionsUrl }) => {
  winston.info(`GraphQL API at ${url}`);
  winston.info(`GraphQL subscriptions at ${subscriptionsUrl}`);
});
