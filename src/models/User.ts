import { ObjectID } from 'mongodb';
import { Typegoose, prop } from 'typegoose';

export class User extends Typegoose {
  @prop() _id: ObjectID;

  @prop()
  get createdAt(): Date {
    return this._id.getTimestamp();
  }

  @prop({ required: true })
  name: string;
}

export const UserModel = new User().getModelForClass(User);
