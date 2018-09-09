import { ObjectType, Field } from 'type-graphql';
import { Entity, ObjectID, ObjectIdColumn, Column, Index } from 'typeorm';
import { User } from './User';

@ObjectType({
  description:
    'A room contains information about the messages sent into the room and ' +
    "the users participating in the room's conversation",
})
@Entity()
export class Room {
  @Field(type => ObjectID)
  @ObjectIdColumn()
  readonly id: ObjectID;

  @Field()
  @Column()
  name: string;

  @Field(type => ObjectID)
  @Column(type => ObjectID)
  ownerId: ObjectID;

  @Field(type => [ObjectID])
  @Index()
  @Column(type => ObjectID)
  memberIds: ObjectID[];

  @Field()
  createdAt(): Date {
    return this.id.getTimestamp();
  }
}

export const userIsMemberOfRoom = (user: User, room: Room): boolean => {
  return !!room.memberIds.find(memberId => user.id.equals(memberId));
};
