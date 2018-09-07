import {
  Resolver,
  Query,
  Arg,
  Mutation,
  Ctx,
  FieldResolver,
  Root,
  InputType,
  Subscription,
  PubSub,
  Publisher,
} from 'type-graphql';
import { Room, User, userIsMemberOfRoom, Message } from '../models';
import { ObjectID, MongoRepository } from 'typeorm';
import Context from '../Context';
import { SubscriptionType } from '../subscriptions';
import { InjectRepository } from 'typeorm-typedi-extensions';

@InputType()
class CreateRoomInput {
  name: string;
}

@InputType()
class UpdateRoomInput {
  roomId: ObjectID;
  name: string;
}

@InputType()
class JoinRoomInput {
  roomId: ObjectID;
}

interface RoomWasUpdatedPayload {
  room: Room;
}

interface UserJoinedRoomPayload {
  roomId: ObjectID;
  user: User;
}

@Resolver(of => Room)
export class RoomResolver {
  constructor(
    @InjectRepository(Message)
    private messageRepository: MongoRepository<Message>,
    @InjectRepository(Room) private roomRepository: MongoRepository<Room>,
    @InjectRepository(User) private userRepository: MongoRepository<User>,
  ) {}

  @FieldResolver(type => User)
  // @ManyToOne(type => User, user => user.ownedRooms)
  async owner(@Root() room: Room): Promise<User> {
    return this.userRepository.findOneOrFail(room.ownerId);
  }

  @FieldResolver(type => [User])
  // @Index()
  // @ManyToMany(type => User, user => user.rooms)
  // @JoinTable()
  async members(@Root() room: Room): Promise<User[]> {
    return await this.userRepository.findByIds(room.memberIds);
  }

  @FieldResolver(type => [Message])
  // @OneToMany(type => Message, message => message.room)
  async messages(@Root() room: Room, @Ctx() ctx: Context): Promise<Message[]> {
    const viewer = ctx.state.viewer;
    if (!viewer) {
      throw new Error('Authentication required');
    }

    const viewerIsMember = userIsMemberOfRoom(viewer, room);
    if (!viewerIsMember) {
      throw new Error("Only members of a room can read the room's messages");
    }

    return await this.messageRepository.find({ roomId: room.id });
  }

  @FieldResolver()
  viewerIsOwner(@Root() room: Room, @Ctx() ctx: Context): boolean {
    const viewer = ctx.state.viewer;
    if (!viewer) {
      return false;
    }

    return room.ownerId.equals(viewer.id);
  }

  @FieldResolver()
  viewerIsMember(@Root() room: Room, @Ctx() ctx: Context): boolean {
    const viewer = ctx.state.viewer;
    if (!viewer) {
      return false;
    }

    return userIsMemberOfRoom(viewer, room);
  }

  @Query(returns => Room, {
    description:
      'Queries a room by id, returns the room if found, null otherwise',
    nullable: true,
  })
  async room(@Arg('id') id: ObjectID): Promise<Room | null> {
    return (await this.roomRepository.findOne(id)) || null;
  }

  @Mutation(returns => Room, {
    description: 'Creates a new room and returns the created room',
  })
  async createRoom(
    @Arg('input') input: CreateRoomInput,
    @Ctx() ctx: Context,
  ): Promise<Room> {
    const viewer = ctx.state.viewer;
    if (!viewer) {
      throw new Error('Authentication required');
    }

    return await this.roomRepository.create({
      name: input.name,
      ownerId: viewer.id,
      memberIds: [viewer.id],
    });
  }

  @Mutation(returns => Room, {
    description: 'Updates a room and returns the updated room',
  })
  async updateRoom(
    @Arg('input') input: UpdateRoomInput,
    @Ctx() ctx: Context,
    @PubSub(SubscriptionType.RoomWasUpdated)
    publish: Publisher<RoomWasUpdatedPayload>,
  ): Promise<Room> {
    const viewer = ctx.state.viewer;
    if (!viewer) {
      throw new Error('Authentication required');
    }

    const room = await this.roomRepository.findOne(input.roomId);
    if (!room) {
      throw new Error('Room could not be found');
    }
    if (!room.ownerId.equals(viewer.id)) {
      throw new Error("Only a room's owner can update a room");
    }

    room.name = input.name;
    await this.roomRepository.save(room);

    publish({ room });

    return room;
  }

  @Mutation(returns => Room, {
    description:
      'Makes the active user join a room and returns the joined room',
  })
  async joinRoom(
    @Arg('input') input: JoinRoomInput,
    @Ctx() ctx: Context,
    @PubSub(SubscriptionType.UserJoinedRoom)
    publish: Publisher<UserJoinedRoomPayload>,
  ): Promise<Room> {
    const viewer = ctx.state.viewer;
    if (!viewer) {
      throw new Error('Authentication required');
    }

    const result = await this.roomRepository.findOneAndUpdate(input.roomId, {
      $addToSet: {
        members: viewer.id,
      },
    });
    if (result.ok !== 1) {
      throw new Error('Room could not be updated');
    }

    const room = result.value as Room;
    if (!room) {
      throw new Error('Room could not be found');
    }

    publish({
      roomId: room.id,
      user: viewer,
    });

    return room;
  }

  @Subscription({
    description:
      'Notifies when the specified room has been updated and returns the updated room',
    topics: SubscriptionType.RoomWasUpdated,
    filter: ({ payload, args }) => payload.room.id.equals(args.roomId),
  })
  roomWasUpdated(
    @Root() payload: RoomWasUpdatedPayload,
    @Arg('roomId') roomId: ObjectID,
  ): Room {
    return payload.room;
  }

  @Subscription({
    description:
      'Notifies when a user has joined the specified room and returns the joined user',
    topics: SubscriptionType.UserJoinedRoom,
    filter: ({ payload, args }) => payload.roomId.equals(args.roomId),
  })
  userJoinedRoom(
    @Root() payload: UserJoinedRoomPayload,
    @Arg('roomId') roomId: ObjectID,
  ): User {
    return payload.user;
  }
}
