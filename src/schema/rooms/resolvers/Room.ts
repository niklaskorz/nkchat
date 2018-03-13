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

    const ownerId: ObjectID = room.populated('owner')
      ? (room.owner as InstanceType<User>)._id
      : (room.owner as ObjectID);

    return ownerId.equals(viewer._id);
  },
  async members(room: InstanceType<Room>): Promise<User[]> {
    if (!room.populated('members')) {
      room = await room.populate('members').execPopulate();
    }
    return room.members as User[];
  },
  viewerIsMember(room: InstanceType<Room>, data: any, ctx: Context): boolean {
    const viewer = ctx.state.viewer;
    if (!viewer) {
      return false;
    }

    const memberIds: ObjectID[] = room.populated('members')
      ? (room.members as Array<InstanceType<User>>).map(user => user._id)
      : (room.members as ObjectID[]);

    for (const id of memberIds) {
      if (id.equals(viewer._id)) {
        return true;
      }
    }
    return false;
  },
  async messages(room: InstanceType<Room>): Promise<Message[]> {
    return await MessageModel.find({ room: room.id }).exec();
  },
};
