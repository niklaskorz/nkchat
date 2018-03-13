import { Typegoose, prop, arrayProp } from 'typegoose';
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
