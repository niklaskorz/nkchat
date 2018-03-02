import { ObjectID } from 'mongodb';
import { InstanceType, User, Session } from 'models';

export default {
  createdAt(session: InstanceType<Session>): Date {
    return (session._id as ObjectID).getTimestamp();
  },
  async user(session: InstanceType<Session>): Promise<User> {
    if (!session.populated('user')) {
      session = await session.populate('user').execPopulate();
    }
    return session.user as User;
  },
};
