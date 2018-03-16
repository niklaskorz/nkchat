import winston from 'winston';
import mongoose from 'mongoose';
import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import { graphqlKoa, graphiqlKoa } from 'apollo-server-koa';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { execute, subscribe } from 'graphql';
import { SessionModel, InstanceType, User } from './models';
import schema from './schema';
import Context from './Context';
import * as config from './config';

mongoose.connect(`mongodb://${config.mongodbHost}/webengineering2`);

const app = new Koa();
app.use(cors());

const router = new Router();

const withSession: Router.IMiddleware = async (ctx: Context, next) => {
  const sessionId = ctx.get('X-Session-ID');
  if (sessionId) {
    const session = await SessionModel.findById(sessionId)
      .populate('user')
      .exec();
    if (session) {
      ctx.state.session = session;
      ctx.state.viewer = session.user as InstanceType<User>;
    }
  }
  await next();
};

const graphqlHandler = graphqlKoa(ctx => ({
  schema,
  context: ctx,
}));

router.post('/graphql', withSession, bodyParser(), graphqlHandler);
router.get('/graphql', withSession, graphqlHandler);
router.get(
  '/graphiql',
  graphiqlKoa(ctx => ({
    endpointURL: '/graphql',
    subscriptionsEndpoint: 'ws://localhost:3000/subscriptions',
    websocketConnectionParams: {
      session: ctx.cookies.get('session'),
    },
  })),
);

app.use(router.routes());

const server = app.listen(config.port, () => {
  winston.info(`Listening on port ${config.port}`);

  SubscriptionServer.create(
    {
      execute,
      subscribe,
      schema,
      async onConnect(connectionParams: { session?: string }) {
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
            viewer: session.user,
          },
        };
      },
    },
    {
      server,
      path: '/subscriptions',
    },
  );
});
