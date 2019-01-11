import Cookies from 'cookies';
import { User } from './models';

export interface State {
  sessionId?: string;
  viewer?: User;
}

export default interface Context {
  cookies?: Cookies;
  state: State;
}
