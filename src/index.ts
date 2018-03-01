import winston from 'winston';
import mongoose from 'mongoose';
import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import { graphqlKoa, graphiqlKoa } from 'apollo-server-koa';
import { SessionModel } from './models';
import schema from './schema';

mongoose.connect('mongodb://localhost/webengineering2');

const app = new Koa();
const router = new Router();

const withSession: Router.IMiddleware = async (ctx, next) => {
  const sessionId = ctx.cookies.get('session');
  if (sessionId) {
    ctx.state.session = await SessionModel.findById(sessionId)
      .populate('user')
      .exec();
  }
  await next();
};

router.post(
  '/graphql',
  withSession,
  bodyParser(),
  graphqlKoa(context => ({
    schema,
    context,
  })),
);
router.get(
  '/graphql',
  withSession,
  graphqlKoa(context => ({
    schema,
    context,
  })),
);
router.get('/graphiql', graphiqlKoa({ endpointURL: '/graphql' }));

router.get('/*', async ctx => {
  winston.info(ctx.url);
  ctx.body = decodeURI(ctx.url);
});

app.use(router.routes());
app.listen(3000);
