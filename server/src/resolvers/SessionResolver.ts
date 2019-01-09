import { Ctx, FieldResolver, Query, Resolver, Root } from 'type-graphql';
import { MongoRepository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import Context from '../Context';
import { Session, User } from '../models';

@Resolver(of => Session)
export class SessionResolver {
  constructor(
    @InjectRepository(User) private userRepository: MongoRepository<User>,
  ) {}

  @FieldResolver(type => User)
  // @ManyToOne(type => User)
  async user(@Root() session: Session): Promise<User> {
    return await this.userRepository.findOneOrFail(session.userId);
  }

  @Query(returns => Session, {
    description:
      'Returns the active session if the querying user is authenticated, null otherwise',
    nullable: true,
  })
  session(@Ctx() ctx: Context): Session | null {
    return ctx.state.session || null;
  }
}
