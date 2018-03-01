import { Typegoose, prop } from 'typegoose';

export default class User extends Typegoose {
  @prop() name: string;
}

export const UserModel = new User().getModelForClass(User);
