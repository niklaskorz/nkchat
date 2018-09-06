import winston from 'winston';
import { createConnection } from 'typeorm';
import * as config from './config';
import createServer from './createServer';

const createDatabaseConnection = () =>
  createConnection({
    type: 'mongodb',
    url: `mongodb://${config.mongodbHost}/nkchat`,
  });

createDatabaseConnection()
  .then(() => createServer())
  .then(server => server.listen())
  .then(({ url, subscriptionsUrl }) => {
    winston.info(`GraphQL API at ${url}`);
    winston.info(`GraphQL subscriptions at ${subscriptionsUrl}`);
  });
