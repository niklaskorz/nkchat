import { Typegoose, Ref, prop } from 'typegoose';
import User from './User';

export default class Room extends Typegoose {
  @prop() name: string;

  @prop({ ref: User })
  owner: Ref<User>;
}

export const RoomModel = new Room().getModelForClass(Room);
