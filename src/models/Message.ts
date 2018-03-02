import { Typegoose, Ref, prop } from 'typegoose';
import { User } from './User';
import { Room } from './Room';

export class Message extends Typegoose {
  @prop({ required: true })
  content: string;

  @prop({ ref: User, required: true })
  author: Ref<User>;

  @prop({ ref: Room, required: true })
  room: Ref<Room>;
}

export const MessageModel = new Message().getModelForClass(Message);
