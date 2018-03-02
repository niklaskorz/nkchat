import { InstanceType, Session, User } from 'models';
import Context from 'Context';

export default {
  viewer(root: any, data: any, ctx: Context): InstanceType<User> | null {
    return ctx.state.viewer || null;
  },
  session(root: any, data: any, ctx: Context): InstanceType<Session> | null {
    return ctx.state.session || null;
  },
};
