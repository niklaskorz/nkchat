import { Typegoose, Ref, prop } from 'typegoose';
import { User } from './User';
import { Room } from './Room';

export class UserInRoom extends Typegoose {
  @prop({ ref: User, required: true, index: true })
  user: Ref<User>;

  @prop({ ref: Room, required: true, index: true })
  room: Ref<Room>;
}

export const UserInRoomModel = new UserInRoom().getModelForClass(UserInRoom);
