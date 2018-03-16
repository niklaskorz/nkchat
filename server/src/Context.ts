import { IRouterContext } from 'koa-router';
import { InstanceType, Session, User } from './models';

export interface State {
  session?: InstanceType<Session>;
  viewer?: InstanceType<User>;
}

export default interface Context extends IRouterContext {
  state: State;
};
