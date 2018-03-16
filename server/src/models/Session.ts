import { Typegoose, prop } from 'typegoose';
import Ref from './Ref';
import { User } from './User';

export class Session extends Typegoose {
  @prop({ ref: User, required: true })
  user: Ref<User>;
}

export const SessionModel = new Session().getModelForClass(Session);
