import { ObjectID } from 'mongodb';
import { InstanceType, Typegoose, prop, arrayProp } from 'typegoose';
import Ref from './Ref';
import { User } from './User';

export class Room extends Typegoose {
  @prop({ required: true })
  name: string;

  @prop({ ref: User, required: true })
  owner: Ref<User>;

  @arrayProp({ itemsRef: User, required: true, index: true })
  members: Ref<User>[];
}

export const RoomModel = new Room().getModelForClass(Room);

export const userIsMemberOfRoom = (
  user: InstanceType<User>,
  room: InstanceType<Room>,
) => {
  const memberIds: ObjectID[] = room.populated('members')
    ? (room.members as Array<InstanceType<User>>).map(u => u._id)
    : (room.members as ObjectID[]);

  for (const id of memberIds) {
    if (id.equals(user._id)) {
      return true;
    }
  }
  return false;
};
