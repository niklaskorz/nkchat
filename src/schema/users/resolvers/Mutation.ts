import * as bcrypt from 'bcrypt';
import Context from 'Context';
import { InstanceType, UserModel, Session, SessionModel } from 'models';

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
    ctx: Context,
  ): Promise<InstanceType<Session>> {
    const user = await UserModel.create({
      name: input.name,
      password: await bcrypt.hash(input.password, 10),
    });

    const session = await SessionModel.create({
      user: user.id,
    });
    ctx.state.session = session;
    ctx.state.viewer = user;

    return session;
  },
  async login(
    root: any,
    { input }: { input: LoginInput },
    ctx: Context,
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
    ctx.state.session = session;
    ctx.state.viewer = user;

    return session;
  },
  async logout(root: any, data: any, ctx: Context) {
    const session = ctx.state.session;
    if (!session) {
      throw new Error('Authentication required');
    }

    await session.remove();
    ctx.state.session = undefined;
    ctx.state.viewer = undefined;

    return session.id;
  },
};
