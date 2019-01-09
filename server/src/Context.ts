import Cookies from 'cookies';
import { Session, User } from './models';

export interface State {
  session?: Session;
  viewer?: User;
}

export default interface Context {
  cookies?: Cookies;
  state: State;
}
