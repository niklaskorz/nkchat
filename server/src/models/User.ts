import { ObjectType, Field } from 'type-graphql';
import { Entity, ObjectID, ObjectIdColumn, Column, Index } from 'typeorm';

@ObjectType({
  description: 'A user is a user, not much left to say here',
})
@Entity()
export class User {
  @Field()
  @ObjectIdColumn()
  id: ObjectID;

  @Field()
  @Index({ unique: true })
  @Column()
  name: string;

  // Do not expose this as a field!
  @Column()
  password: string;

  @Field()
  createdAt(): Date {
    return this.id.getTimestamp();
  }
}
