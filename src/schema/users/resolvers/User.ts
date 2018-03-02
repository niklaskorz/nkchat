import { ObjectID } from 'mongodb';
import { InstanceType, User, Room, RoomModel } from 'models';
import Context from 'Context';

export default {
  createdAt(user: InstanceType<User>): Date {
    return (user._id as ObjectID).getTimestamp();
  },
  isViewer(user: InstanceType<User>, data: any, ctx: Context): boolean {
    const viewer = ctx.state.viewer;
    if (!viewer) {
      return false;
    }

    return viewer.id === user.id;
  },
  async rooms(user: InstanceType<User>): Promise<InstanceType<Room>[]> {
    return await RoomModel.find({
      members: user.id,
    }).exec();
  },
};
