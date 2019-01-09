import { ObjectID } from 'mongodb';
import { Field, ObjectType } from 'type-graphql';
import { Column, Entity, ObjectIdColumn } from 'typeorm';

@ObjectType({
  description: 'A login session for authenticating user requests',
})
@Entity()
export class Session {
  @Field(type => ObjectID)
  @ObjectIdColumn()
  readonly id: ObjectID;

  @Field(type => ObjectID)
  @Column()
  userId: ObjectID;

  @Field()
  createdAt(): Date {
    return this.id.getTimestamp();
  }
}
