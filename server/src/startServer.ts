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
      if (request && request.headers.authorization) {
        sessionId = request.headers.authorization;
      } else if (
        connection &&
        connection.context &&
        connection.context.session
      ) {
        sessionId = connection.context.session;
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
  return await server.start();
};

export default startServer;
