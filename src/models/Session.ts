import { Typegoose, Ref, prop } from 'typegoose';
import { User } from './User';

export class Session extends Typegoose {
  @prop({ ref: User, required: true })
  user: Ref<User>;
}

export const SessionModel = new Session().getModelForClass(Session);
