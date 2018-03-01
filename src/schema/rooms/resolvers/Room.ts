import { InstanceType, User, Room } from '../../../models';

export default {
  async owner(room: InstanceType<Room>): Promise<User> {
    if (!room.populated('owner')) {
      room = await room.populate('owner').execPopulate();
    }
    return room.owner as User;
  },
  async members(room: InstanceType<Room>): Promise<User[]> {
    if (!room.populated('members')) {
      room = await room.populate('members').execPopulate();
    }
    return room.members as User[];
  },
};
