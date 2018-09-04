import { InstanceType, Session, User } from './models';

export interface State {
  session?: InstanceType<Session>;
  viewer?: InstanceType<User>;
}

export default interface Context {
  state: State;
}
