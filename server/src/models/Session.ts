import { ObjectType, Field } from 'type-graphql';
import { Entity, ObjectID, ObjectIdColumn, Column } from 'typeorm';

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
