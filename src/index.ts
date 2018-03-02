import winston from 'winston';
import mongoose from 'mongoose';
import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import { graphqlKoa, graphiqlKoa } from 'apollo-server-koa';
import { SessionModel, InstanceType, User } from './models';
import schema from './schema';
import Context from './Context';

mongoose.connect('mongodb://localhost/webengineering2');

const app = new Koa();
const router = new Router();

const withSession: Router.IMiddleware = async (ctx: Context, next) => {
  const sessionId = ctx.cookies.get('session');
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
router.get('/graphiql', graphiqlKoa({ endpointURL: '/graphql' }));

router.get('/*', async ctx => {
  winston.info(ctx.url);
  ctx.body = decodeURI(ctx.url);
});

app.use(router.routes());

const PORT = 3000;
app.listen(PORT, () => {
  winston.info(`Listening on port ${PORT}`);
});
