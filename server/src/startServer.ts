import { getMongoRepository } from 'typeorm';
import { ApolloServer } from 'apollo-server-koa';
import { User, Session } from './models';
import getSchema from './schema';
import Context from './Context';
import Cookies from 'cookies';
import { ServerResponse } from 'http';
import Koa from 'koa';

const loadState = async (sessionId?: string | null) => {
  if (!sessionId) {
    return {};
  }

  const session = await getMongoRepository(Session).findOne(sessionId);
  if (!session) {
    return {};
  }

  return {
    session,
    viewer: await getMongoRepository(User).findOneOrFail(session.userId),
  };
};

type ContextParameters =
  | { ctx: Context; connection: undefined }
  | { ctx: undefined; connection: { context: Context } };

const startServer = async () => {
  const app = new Koa();

  app.proxy = true;

  app.use(async (ctx, next) => {
    const sessionId = ctx.cookies.get('sessionId');
    ctx.state = await loadState(sessionId);
    await next();
  });

  const server = new ApolloServer({
    schema: await getSchema(),
    context: async (params: ContextParameters): Promise<Context> => {
      return params.ctx || params.connection.context;
    },
    subscriptions: {
      onConnect: async (
        connectionParams,
        webSocket,
        connectionContext,
      ): Promise<Context> => {
        const cookies = new Cookies(
          connectionContext.request,
          new ServerResponse(connectionContext.request), // Dummy object
        );
        const sessionId = cookies.get('sessionId');
        return {
          state: await loadState(sessionId),
        };
      },
    },
  });

  server.applyMiddleware({
    app,
    cors: false,
  });

  return await new Promise(resolve => app.listen(4000, resolve));
};

export default startServer;
