import { ObjectID } from 'mongodb';
import { InstanceType, User, Room, RoomModel } from '../../../models';

export default {
  createdAt(user: InstanceType<User>): Date {
    return (user._id as ObjectID).getTimestamp();
  },
  async rooms(user: InstanceType<User>): Promise<InstanceType<Room>[]> {
    return await RoomModel.find({
      members: user.id,
    }).exec();
  },
};
