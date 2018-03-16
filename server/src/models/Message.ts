import { Typegoose, prop } from 'typegoose';
import Ref from './Ref';
import { User } from './User';
import { Room } from './Room';

enum EmbedType {
  Youtube = 'YOUTUBE',
  Alugha = 'ALUGHA',
  Image = 'IMAGE',
}

class Embed {
  @prop({ required: true })
  type: EmbedType;

  @prop({ required: true })
  src: string;
}

export class Message extends Typegoose {
  @prop({ required: true })
  content: string;

  @prop({ ref: User, required: true })
  author: Ref<User>;

  @prop({ ref: Room, required: true })
  room: Ref<Room>;

  @prop({ required: true })
  embeds: Embed[];
}

export const MessageModel = new Message().getModelForClass(Message);
