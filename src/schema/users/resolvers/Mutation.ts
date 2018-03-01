import { IRouterContext } from 'koa-router';
import * as bcrypt from 'bcrypt';
import {
  InstanceType,
  User,
  UserModel,
  Session,
  SessionModel,
} from '../../../models';

interface RegisterInput {
  name: string;
  password: string;
}

interface LoginInput {
  name: string;
  password: string;
}

export default {
  async register(
    root: any,
    { input }: { input: RegisterInput },
    ctx: IRouterContext,
  ): Promise<InstanceType<Session>> {
    const user = await UserModel.create({
      name: input.name,
      password: await bcrypt.hash(input.password, 10),
    });

    const session = await SessionModel.create({
      user: user.id,
    });
    ctx.cookies.set('session', session.id, {
      path: '/graphql',
      httpOnly: true,
    });
    ctx.state.session = user;

    return session;
  },
  async login(
    root: any,
    { input }: { input: LoginInput },
    ctx: IRouterContext,
  ): Promise<InstanceType<Session>> {
    const user = await UserModel.findOne({ name: input.name }).exec();
    if (!user) {
      throw new Error('User not found');
    }

    const isPasswordCorrect = await bcrypt.compare(
      input.password,
      user.password,
    );
    if (!isPasswordCorrect) {
      throw new Error('Password is incorrect');
    }

    const session = await SessionModel.create({
      user: user.id,
    });
    ctx.cookies.set('session', session.id, {
      path: '/graphql',
      httpOnly: true,
    });
    ctx.state.session = user;

    return session;
  },
  async logout(root: any, data: any, ctx: IRouterContext) {
    const session = ctx.state.session as InstanceType<Session> | undefined;
    if (!session) {
      throw new Error('Authentication required');
    }

    await session.remove();
    ctx.cookies.set('session', undefined);
    ctx.state.session = undefined;

    return session.id;
  },
};
