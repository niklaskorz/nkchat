import { ApolloServer } from 'apollo-server-koa';
import Cookies from 'cookies';
import { createServer, ServerResponse } from 'http';
import Koa from 'koa';
import { SESSION_EXPIRY_MILLISECONDS } from './constants';
import Context, { State } from './Context';
import getSchema from './schema';
import { loadSession } from './sessions';

const loadState = async (sessionId?: string | null): Promise<State> => {
  if (!sessionId) {
    return {};
  }

  const viewer = await loadSession(sessionId);
  if (!viewer) {
    return {};
  }

  return { sessionId, viewer };
};

type ContextParameters =
  | { ctx: Context; connection: undefined }
  | { ctx: undefined; connection: { context: Context } };

const startServer = async (port: number) => {
  const app = new Koa();

  app.proxy = true;

  app.use(async (ctx, next) => {
    const sessionId = ctx.cookies.get('session');
    const state = await loadState(sessionId);
    if (state.viewer) {
      // Refresh cookie
      ctx.cookies.set('session', sessionId, {
        overwrite: true,
        maxAge: SESSION_EXPIRY_MILLISECONDS,
      });
    }
    ctx.state = state;
    await next();
  });

  const apolloServer = new ApolloServer({
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

  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  const server = createServer(app.callback());
  apolloServer.installSubscriptionHandlers(server);

  return await new Promise(resolve => server.listen(port, resolve));
};

export default startServer;
