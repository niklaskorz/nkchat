import { ObjectType, Field } from 'type-graphql';
import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { ObjectID } from 'mongodb';

@ObjectType({
  description: 'A login session for authenticating user requests',
})
@Entity()
export class Session {
  @Field(type => ObjectID)
  @ObjectIdColumn()
  readonly id: ObjectID;

  @Field(type => ObjectID)
  @Column(type => ObjectID)
  userId: ObjectID;

  @Field()
  createdAt(): Date {
    return this.id.getTimestamp();
  }
}
