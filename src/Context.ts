import { IRouterContext } from 'koa-router';
import { InstanceType, Session } from './models';

export interface State {
  session?: InstanceType<Session>;
}

export default interface Context extends IRouterContext {
  state: State;
};
