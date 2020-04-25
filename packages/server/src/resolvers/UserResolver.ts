import * as bcrypt from 'bcrypt';
import { ObjectID } from 'mongodb';
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Mutation,
  Query,
  Resolver,
  Root,
} from 'type-graphql';
import { MongoRepository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { SESSION_EXPIRY_MILLISECONDS } from '../constants';
import Context from '../Context';
import { Message, Room, User } from '../models';
import { createSession, removeSession } from '../sessions';

@InputType()
class RegisterInput {
  @Field()
  name: string;
  @Field()
  password: string;
}

@InputType()
class LoginInput {
  @Field()
  name: string;
  @Field()
  password: string;
}

@Resolver(of => User)
export class UserResolver {
  constructor(
    @InjectRepository(Message)
    private messageRepository: MongoRepository<Message>,
    @InjectRepository(Room)
    private roomRepository: MongoRepository<Room>,
    @InjectRepository(User)
    private userRepository: MongoRepository<User>,
  ) {}

  @FieldResolver(type => [Room])
  // @OneToMany(type => Room, room => room.owner)
  async ownedRooms(@Root() user: User): Promise<Room[]> {
    return await this.roomRepository.find({ ownerId: user.id });
  }

  @FieldResolver(type => [Room])
  // @ManyToMany(type => Room)
  // @JoinTable()
  async rooms(@Root() user: User): Promise<Room[]> {
    return await this.roomRepository.find({ where: { memberIds: user.id } });
  }

  @FieldResolver(type => [Message])
  // @OneToMany(type => Message, message => message.room)
  async messages(@Root() user: User): Promise<Message[]> {
    return await this.messageRepository.find({ authorId: user.id });
  }

  @FieldResolver()
  isViewer(@Root() user: User, @Ctx() ctx: Context): boolean {
    const viewer = ctx.state.viewer;
    if (!viewer) {
      return false;
    }

    return user.id.equals(viewer.id);
  }

  @Query(returns => User, {
    description:
      'Returns the authenticated user if the querying user is authenticated, null otherwise',
    nullable: true,
  })
  viewer(@Ctx() ctx: Context): User | null {
    return ctx.state.viewer || null;
  }

  @Mutation(returns => User, {
    description:
      'Creates a new user and returns a login session for the created user',
  })
  async register(
    @Arg('input') input: RegisterInput,
    @Ctx() ctx: Context,
  ): Promise<User> {
    const user = new User();
    user.name = input.name;
    user.password = await bcrypt.hash(input.password, 10);

    await this.userRepository.save(user);

    const sessionId = await createSession(user.id);

    ctx.state.sessionId = sessionId;
    ctx.state.viewer = user;
    if (ctx.cookies) {
      ctx.cookies.set('session', sessionId, {
        overwrite: true,
        maxAge: SESSION_EXPIRY_MILLISECONDS,
      });
    }

    return user;
  }

  @Mutation(returns => User, {
    description: 'Creates and returns a login session for the specified user',
  })
  async login(
    @Arg('input') input: LoginInput,
    @Ctx() ctx: Context,
  ): Promise<User> {
    const user = await this.userRepository.findOne({ name: input.name });
    if (!user) {
      throw new Error('User not found');
    }

    const isPasswordCorrect = await bcrypt.compare(
      input.password,
      user.password,
    );
    if (!isPasswordCorrect) {
      throw new Error('Password is incorrect');
    }

    const sessionId = await createSession(user.id);

    ctx.state.sessionId = sessionId;
    ctx.state.viewer = user;
    if (ctx.cookies) {
      ctx.cookies.set('session', sessionId, {
        overwrite: true,
        maxAge: SESSION_EXPIRY_MILLISECONDS,
      });
    }

    return user;
  }

  @Mutation(returns => ObjectID, {
    description:
      'Invalidates the active user session and returns the session id',
  })
  async logout(@Ctx() ctx: Context): Promise<string> {
    const sessionId = ctx.state.sessionId;
    if (!sessionId) {
      throw new Error('Authentication required');
    }

    await removeSession(sessionId);

    ctx.state.sessionId = undefined;
    ctx.state.viewer = undefined;
    if (ctx.cookies) {
      ctx.cookies.set('session', undefined, { overwrite: true }); // Clear session
    }

    return sessionId;
  }
}
