import { Typegoose, prop } from 'typegoose';

export class User extends Typegoose {
  @prop({ required: true })
  name: string;
}

export const UserModel = new User().getModelForClass(User);
