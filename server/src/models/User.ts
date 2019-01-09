import { ObjectID } from 'mongodb';
import { Field, ObjectType } from 'type-graphql';
import { Column, Entity, Index, ObjectIdColumn } from 'typeorm';

@ObjectType({
  description: 'A user is a user, not much left to say here',
})
@Entity()
export class User {
  @Field(type => ObjectID)
  @ObjectIdColumn()
  readonly id: ObjectID;

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
