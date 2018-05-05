import { ObjectID } from 'mongodb';
import {
  InstanceType,
  User,
  Room,
  Message,
  MessageModel,
  userIsMemberOfRoom,
} from '../../../models';
import Context from '../../../Context';

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

    return userIsMemberOfRoom(viewer, room);
  },
  async messages(
    room: InstanceType<Room>,
    data: any,
    ctx: Context,
  ): Promise<Message[]> {
    const viewer = ctx.state.viewer;
    if (!viewer) {
      throw new Error('Authentication required');
    }

    const viewerIsMember = userIsMemberOfRoom(viewer, room);
    if (!viewerIsMember) {
      throw new Error("Only members of a room can read the room's messages");
    }

    return await MessageModel.find({ room: room.id }).exec();
  },
};
