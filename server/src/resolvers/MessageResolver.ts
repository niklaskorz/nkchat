import getUrls from 'get-urls';
import { ObjectID } from 'mongodb';
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Mutation,
  Publisher,
  PubSub,
  Resolver,
  Root,
  Subscription,
} from 'type-graphql';
import { MongoRepository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { URL } from 'url';
import Context from '../Context';
import {
  Embed,
  EmbedType,
  Message,
  Room,
  User,
  userIsMemberOfRoom,
} from '../models';
import { SubscriptionType } from '../subscriptions';

type EmbedParser = (url: URL) => Embed | null;

const embedHosts = new Map<string, EmbedParser>([
  [
    'youtube.com',
    url => {
      const videoId = url.searchParams.get('v');
      if (!videoId || url.pathname !== '/watch') {
        return null;
      }

      const embed = new Embed();
      embed.type = EmbedType.Youtube;
      embed.src = videoId;

      return embed;
    },
  ],
  [
    'youtu.be',
    url => {
      const videoId = url.pathname.slice(1);
      const embed = new Embed();
      embed.type = EmbedType.Youtube;
      embed.src = videoId;
      return embed;
    },
  ],
  [
    'alugha.com',
    url => {
      if (!url.pathname.startsWith('/videos/')) {
        return null;
      }
      const videoId = url.pathname.slice('/videos/'.length);

      const embed = new Embed();
      embed.type = EmbedType.Alugha;
      embed.src = videoId;
      return embed;
    },
  ],
]);

const imageEmbedParser: EmbedParser = url => {
  if (
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.bmp') ||
    url.pathname.endsWith('.tga')
  ) {
    const embed = new Embed();
    embed.type = EmbedType.Image;
    embed.src = url.href;
    return embed;
  }

  return null;
};

const getEmbeds = (text: string): Embed[] => {
  const embeds = [];
  for (const urlString of getUrls(text)) {
    const url = new URL(urlString);
    const parser = embedHosts.get(url.hostname);
    const embed = (parser && parser(url)) || imageEmbedParser(url);
    if (embed) {
      embeds.push(embed);
    }
  }
  return embeds;
};

@InputType()
class SendMessageInput {
  @Field(type => ObjectID)
  roomId: ObjectID;
  @Field()
  content: string;
}

interface MessageWasSentPayload {
  roomId: ObjectID;
  message: Message;
}

@Resolver(of => Message)
export class MessageResolver {
  constructor(
    @InjectRepository(Message)
    private messageRepository: MongoRepository<Message>,
    @InjectRepository(Room) private roomRepository: MongoRepository<Room>,
    @InjectRepository(User) private userRepository: MongoRepository<User>,
  ) {}

  @FieldResolver(type => Room)
  // @ManyToOne(type => Room, room => room.messages)
  async room(@Root() message: Message): Promise<Room> {
    return await this.roomRepository.findOneOrFail(message.roomId);
  }

  @FieldResolver(type => User)
  // @ManyToOne(type => User, user => user.messages)
  async author(@Root() message: Message): Promise<User> {
    return await this.userRepository.findOneOrFail(message.authorId);
  }

  @FieldResolver()
  viewerIsAuthor(@Root() message: Message, @Ctx() ctx: Context): boolean {
    const viewer = ctx.state.viewer;
    if (!viewer) {
      return false;
    }

    return message.authorId.equals(viewer.id);
  }

  @Mutation(returns => Message, {
    description:
      'Sends a message to a specific room and returns the sent message',
  })
  async sendMessage(
    @Arg('input') input: SendMessageInput,
    @Ctx() ctx: Context,
    @PubSub(SubscriptionType.MessageWasSent)
    publish: Publisher<MessageWasSentPayload>,
  ): Promise<Message> {
    const viewer = ctx.state.viewer;
    if (!viewer) {
      throw new Error('Authentication required');
    }

    const room = await this.roomRepository.findOne(input.roomId);
    if (!room) {
      throw new Error('Room could not be found');
    }

    const viewerIsMember = userIsMemberOfRoom(viewer, room);
    if (!viewerIsMember) {
      throw new Error('Only members of a room can send messages to the room');
    }

    const message = new Message();
    message.content = input.content;
    message.authorId = viewer.id;
    message.roomId = input.roomId;
    message.embeds = getEmbeds(input.content);

    await this.messageRepository.save(message);

    publish({
      roomId: input.roomId,
      message,
    });

    return message;
  }

  @Subscription(returns => Message, {
    description:
      'Notifies when a message has been sent to the specified room and returns the sent message',
    topics: SubscriptionType.MessageWasSent,
    filter: ({ payload, args }) => payload.roomId.equals(args.roomId),
  })
  messageWasSent(
    @Root() payload: MessageWasSentPayload,
    @Arg('roomId', type => ObjectID) roomId: ObjectID,
  ): Message {
    return payload.message;
  }
}
