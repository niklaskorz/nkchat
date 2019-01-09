import 'reflect-metadata';
import winston from 'winston';
import * as typeorm from 'typeorm';
import * as typegraphql from 'type-graphql';
import { Container } from 'typedi';
import * as config from './config';
import startServer from './startServer';
import { Message, Room, Session, User } from './models';

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
    entities: [Message, Room, Session, User],
    synchronize: true,
    useNewUrlParser: true,
  });

createDatabaseConnection()
  .then(() => startServer())
  .then(() => {
    winston.info(`GraphQL API at http://localhost:4000/graphql`);
  })
  .catch(err => winston.error(err.stack));
