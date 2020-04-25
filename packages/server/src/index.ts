import 'reflect-metadata';

import * as typegraphql from 'type-graphql';
import { Container } from 'typedi';
import * as typeorm from 'typeorm';
import winston from 'winston';
import * as config from './config';
import { Message, Room, User } from './models';
import startServer from './startServer';

typeorm.useContainer(Container);
typegraphql.useContainer(Container);

const console = new winston.transports.Console({
  format: winston.format.simple(),
});
winston.add(console);

const createDatabaseConnection = () =>
  typeorm.createConnection({
    type: 'mongodb',
    url: `mongodb://${config.mongodbHost}/nkchat`,
    entities: [Message, Room, User],
    synchronize: true,
    useNewUrlParser: true,
  });

createDatabaseConnection()
  .then(() => startServer(config.port))
  .then(() => {
    winston.info(`GraphQL API at http://localhost:${config.port}/graphql`);
  })
  .catch(err => winston.error(err.stack));
