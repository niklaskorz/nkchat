import {
  Resolver,
  Query,
  Ctx,
  Mutation,
  InputType,
  Arg,
  FieldResolver,
  Root,
  Field,
} from 'type-graphql';
import * as bcrypt from 'bcrypt';
import Context from '../Context';
import { User, Session, Room, Message } from '../models';
import { MongoRepository } from 'typeorm';
import { ObjectID } from 'mongodb';
import { InjectRepository } from 'typeorm-typedi-extensions';
import winston from 'winston';

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
    @InjectRepository(Room) private roomRepository: MongoRepository<Room>,
    @InjectRepository(Session)
    private sessionRepository: MongoRepository<Session>,
    @InjectRepository(User) private userRepository: MongoRepository<User>,
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
    return await this.roomRepository.find({ memberIds: [user.id] });
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

  @Mutation(returns => Session, {
    description:
      'Creates a new user and returns a login session for the created user',
  })
  async register(
    @Arg('input') input: RegisterInput,
    @Ctx() ctx: Context,
  ): Promise<Session> {
    const user = new User();
    user.name = input.name;
    user.password = await bcrypt.hash(input.password, 10);

    await this.userRepository.save(user);

    const session = new Session();
    session.userId = user.id;

    await this.sessionRepository.save(session);

    ctx.state.session = session;
    ctx.state.viewer = user;
    if (ctx.cookies) {
      ctx.cookies.set('sessionId', session.id.toHexString(), {
        overwrite: true,
        maxAge: 1209600000, // 2 weeks
      });
    }

    return session;
  }

  @Mutation(returns => Session, {
    description: 'Creates and returns a login session for the specified user',
  })
  async login(
    @Arg('input') input: LoginInput,
    @Ctx() ctx: Context,
  ): Promise<Session> {
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

    const session = new Session();
    session.userId = user.id;

    await this.sessionRepository.save(session);

    ctx.state.session = session;
    ctx.state.viewer = user;
    if (ctx.cookies) {
      winston.info('Setting cookie to ' + session.id.toHexString());
      ctx.cookies.set('sessionId', session.id.toHexString(), {
        overwrite: true,
        maxAge: 1209600000, // 2 weeks
      });
      winston.info('Cookie set');
    }

    return session;
  }

  @Mutation(returns => ObjectID, {
    description:
      'Invalidates the active user session and returns the session id',
  })
  async logout(
    @Arg('input') input: LoginInput,
    @Ctx() ctx: Context,
  ): Promise<ObjectID> {
    const session = ctx.state.session;
    if (!session) {
      throw new Error('Authentication required');
    }

    await this.sessionRepository.remove(session);

    ctx.state.session = undefined;
    ctx.state.viewer = undefined;
    if (ctx.cookies) {
      ctx.cookies.set('sessionId', undefined, { overwrite: true }); // Clear session
    }

    return session.id;
  }
}
