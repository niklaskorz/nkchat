import { InstanceType, User, UserModel } from '../../../models';

interface RegisterInput {
  name: string;
  password: string;
}

interface RegisterPayload {
  user: InstanceType<User>;
}

export default {
  async register(
    root: any,
    { input }: { input: RegisterInput },
  ): Promise<RegisterPayload> {
    return {
      user: await UserModel.create({
        name: input.name,
      }),
    };
  },
};
