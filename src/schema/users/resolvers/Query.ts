import { InstanceType, Session, User } from 'models';
import Context from 'Context';

export default {
  async viewer(
    root: any,
    data: any,
    ctx: Context,
  ): Promise<InstanceType<User> | null> {
    let session = ctx.state.session;
    if (!session) {
      return null;
    }
    if (!session.populated('user')) {
      session = await session.populate('user').execPopulate();
    }
    return session.user as InstanceType<User>;
  },
  session(root: any, data: any, ctx: Context): InstanceType<Session> | null {
    return ctx.state.session || null;
  },
};
