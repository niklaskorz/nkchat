import { ObjectType, Field } from 'type-graphql';
import {
  Entity,
  ObjectID,
  ObjectIdColumn,
  Column,
  getMongoRepository,
} from 'typeorm';
import { User } from './User';

@ObjectType({
  description: 'A login session for authenticating user requests',
})
@Entity()
export class Session {
  @Field()
  @ObjectIdColumn()
  readonly id: ObjectID;

  @Field()
  @Column()
  userId: ObjectID;

  @Field()
  createdAt(): Date {
    return this.id.getTimestamp();
  }
}
