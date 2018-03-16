import { ObjectID } from 'mongodb';
import { Message, InstanceType, User, Room } from '../../../models';
import Context from '../../../Context';

export default {
  createdAt(message: InstanceType<Message>): Date {
    return (message._id as ObjectID).getTimestamp();
  },
  async author(message: InstanceType<Message>): Promise<User> {
    if (!message.populated('author')) {
      message = await message.populate('author').execPopulate();
    }
    return message.author as User;
  },
  viewerIsAuthor(
    message: InstanceType<Message>,
    data: any,
    ctx: Context,
  ): boolean {
    const viewer = ctx.state.viewer;
    if (!viewer) {
      return false;
    }

    const authorId: ObjectID = message.populated('author')
      ? (message.author as InstanceType<User>)._id
      : (message.author as ObjectID);

    return authorId.equals(viewer._id);
  },
  async room(message: InstanceType<Message>): Promise<Room> {
    if (!message.populated('room')) {
      message = await message.populate('room').execPopulate();
    }
    return message.room as Room;
  },
};
