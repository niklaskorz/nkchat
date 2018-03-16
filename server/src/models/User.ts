import { Typegoose, prop } from 'typegoose';

export class User extends Typegoose {
  @prop({ required: true, unique: true, index: true })
  name: string;

  @prop({ required: true })
  password: string;
}

export const UserModel = new User().getModelForClass(User);
