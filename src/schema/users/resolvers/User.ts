import { InstanceType, User, Room, RoomModel } from '../../../models';

export default {
  async rooms(user: InstanceType<User>): Promise<InstanceType<Room>[]> {
    return await RoomModel.find({
      members: user.id,
    }).exec();
  },
};
