import winston from 'winston';
import mongoose from 'mongoose';
import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import { graphqlKoa, graphiqlKoa } from 'apollo-server-koa';
import schema from './schema';

mongoose.connect('mongodb://localhost/webengineering2');

const app = new Koa();
const router = new Router();

router.get('/', async ctx => {
  ctx.body = 'Hello world!';
});

router.get(encodeURI('/🤔😂🦄'), async ctx => {
  ctx.body = `It's the magic emoji combination from ${ctx.ip}`;
});

router.post('/graphql', bodyParser(), graphqlKoa({ schema }));
router.get('/graphql', graphqlKoa({ schema }));
router.get('/graphiql', graphiqlKoa({ endpointURL: '/graphql' }));

router.get('/*', async ctx => {
  winston.info(ctx.url);
  ctx.body = decodeURI(ctx.url);
});

app.use(router.routes());
app.listen(3000);
