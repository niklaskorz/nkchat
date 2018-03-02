import { ObjectID } from 'mongodb';
import { InstanceType, User, Room, Message, MessageModel } from 'models';
import Context from 'Context';

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
  viewerIsOwner(room: InstanceType<Room>, data: any, ctx: Context): boolean {
    const viewer = ctx.state.viewer;
    if (!viewer) {
      return false;
    }

    const ownerId = room.populated('owner')
      ? (room.owner as InstanceType<User>).id
      : (room.owner as string);

    return viewer.id === ownerId.toString();
  },
  async members(room: InstanceType<Room>): Promise<User[]> {
    if (!room.populated('members')) {
      room = await room.populate('members').execPopulate();
    }
    return room.members as User[];
  },
  async messages(room: InstanceType<Room>): Promise<Message[]> {
    return await MessageModel.find({ room: room.id }).exec();
  },
};
