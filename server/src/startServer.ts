import { GraphQLServer } from 'graphql-yoga';
import { getMongoRepository } from 'typeorm';
import { User, Session } from './models';
import getSchema from './schema';
import Context from './Context';
import { ContextParameters } from 'graphql-yoga/dist/types';

const startServer = async () => {
  const server = new GraphQLServer({
    schema: await getSchema(),
    async context({
      request,
      connection,
    }: ContextParameters): Promise<Context> {
      const ctx: Context = { state: {} };

      let sessionId: string | null = null;
      if (request && request.cookies && request.cookies.session) {
        sessionId = request.cookies.session;
      } else if (
        connection &&
        connection.variables &&
        connection.variables.session
      ) {
        sessionId = connection.variables.session;
      }

      if (sessionId) {
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
  });
  return await server.start({
    /*subscriptions: {
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
    },*/
  });
};

export default startServer;
