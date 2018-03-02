import { ObjectID } from 'mongodb';
import { InstanceType, User, Room } from 'models';

export default {
  createdAt(room: InstanceType<Room>): Date {
    return (room._id as ObjectID).getTimestamp();
  },
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
