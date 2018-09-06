import { Resolver, Query, Ctx, FieldResolver, Root } from 'type-graphql';
import { MongoRepository } from 'typeorm';
import { Session, User } from '../models';
import Context from '../Context';

@Resolver(of => Session)
export class SessionResolver {
  constructor(private userRepository: MongoRepository<User>) {}

  @FieldResolver(type => User)
  // @ManyToOne(type => User)
  async user(@Root() session: Session): Promise<User> {
    return await this.userRepository.findOneOrFail(session.userId);
  }

  @Query(type => Session, {
    description:
      'Returns the active session if the querying user is authenticated, null otherwise',
    nullable: true,
  })
  session(@Ctx() ctx: Context): Session | null {
    return ctx.state.session || null;
  }
}
