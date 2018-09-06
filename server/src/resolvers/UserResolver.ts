import {
  Resolver,
  Query,
  Ctx,
  Mutation,
  InputType,
  Arg,
  FieldResolver,
  Root,
} from 'type-graphql';
import * as bcrypt from 'bcrypt';
import Context from '../Context';
import { User, Session, Room, Message } from '../models';
import { ObjectID, MongoRepository } from 'typeorm';

@InputType()
class RegisterInput {
  name: string;
  password: string;
}

@InputType()
class LoginInput {
  name: string;
  password: string;
}

@Resolver(of => User)
export class UserResolver {
  constructor(
    private messageRepository: MongoRepository<Message>,
    private roomRepository: MongoRepository<Room>,
    private sessionRepository: MongoRepository<Session>,
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

  @Query(type => User, {
    description:
      'Returns the authenticated user if the querying user is authenticated, null otherwise',
    nullable: true,
  })
  viewer(@Ctx() ctx: Context): User | null {
    return ctx.state.viewer || null;
  }

  @Mutation(t => Session, {
    description:
      'Creates a new user and returns a login session for the created user',
  })
  async register(
    @Arg('input') input: RegisterInput,
    @Ctx() ctx: Context,
  ): Promise<Session> {
    let user: User;
    try {
      user = await this.userRepository.create({
        name: input.name,
        password: await bcrypt.hash(input.password, 10),
      });
    } catch (ex) {
      if (ex.code === 11000) {
        // WriteError of type KeyError
        throw new Error(`User ${input.name} already exists`);
      }
      throw new Error('User could not be created');
    }

    const session = await this.sessionRepository.create({
      userId: user.id,
    });
    ctx.state.session = session;
    ctx.state.viewer = user;

    return session;
  }

  @Mutation(t => Session, {
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

    const session = await this.sessionRepository.create({
      userId: user.id,
    });
    ctx.state.session = session;
    ctx.state.viewer = user;

    return session;
  }

  @Mutation(t => ObjectID, {
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

    return session.id;
  }
}
