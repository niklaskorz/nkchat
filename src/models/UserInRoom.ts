import { Typegoose, Ref, prop } from 'typegoose';
import User from './User';
import Room from './Room';

export default class UserInRoom extends Typegoose {
  @prop({ ref: User })
  user: Ref<User>;

  @prop({ ref: Room })
  room: Ref<Room>;
}

export const UserInRoomModel = new UserInRoom().getModelForClass(UserInRoom);
