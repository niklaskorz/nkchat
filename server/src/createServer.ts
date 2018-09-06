import { Request } from 'express';
import { ApolloServer } from 'apollo-server';
import { getMongoRepository } from 'typeorm';
import { User, Session } from './models';
import getSchema from './schema';
import Context from './Context';

const createServer = async () =>
  new ApolloServer({
    schema: await getSchema(),
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
        const session = await getMongoRepository(Session).findOne(sessionId);
        if (session) {
          ctx.state.session = session;
          ctx.state.viewer = await getMongoRepository(User).findOneOrFail(
            session.userId,
          );
        }
      }

      return ctx;
    },
    subscriptions: {
      async onConnect(connectionParams: {
        session?: string;
      }): Promise<Context> {
        if (!connectionParams.session) {
          throw new Error('Authentication required');
        }

        const session = await getMongoRepository(Session).findOne(
          connectionParams.session,
        );
        if (!session) {
          throw new Error('Invalid session');
        }

        return {
          state: {
            session,
            viewer: await getMongoRepository(User).findOneOrFail(
              session.userId,
            ),
          },
        };
      },
    },
  });

export default createServer;
