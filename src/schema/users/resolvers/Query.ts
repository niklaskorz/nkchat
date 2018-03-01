import { IRouterContext } from 'koa-router';
import { InstanceType, Session, User } from 'models';

export default {
  async viewer(
    root: any,
    data: any,
    ctx: IRouterContext,
  ): Promise<InstanceType<User> | null> {
    let session = ctx.state.session as InstanceType<Session> | undefined;
    if (!session) {
      return null;
    }
    if (!session.populated('user')) {
      session = await session.populate('user').execPopulate();
    }
    return session.user as InstanceType<User>;
  },
  session(
    root: any,
    data: any,
    ctx: IRouterContext,
  ): InstanceType<Session> | null {
    return ctx.state.session || null;
  },
};
