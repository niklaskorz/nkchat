import { ObjectType, Field } from 'type-graphql';
import { Entity, ObjectIdColumn, Column, Index } from 'typeorm';
import { ObjectID } from 'mongodb';

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
