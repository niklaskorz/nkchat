import { ObjectID } from 'mongodb';
import { Typegoose, Ref, prop, arrayProp } from 'typegoose';
import { User } from './User';

export class Room extends Typegoose {
  @prop() _id: ObjectID;

  @prop()
  get createdAt(): Date {
    return this._id.getTimestamp();
  }

  @prop({ required: true })
  name: string;

  @prop({ ref: User, required: true })
  owner: Ref<User>;

  @arrayProp({ itemsRef: User, index: true })
  members: Ref<User>[];
}

export const RoomModel = new Room().getModelForClass(Room);
