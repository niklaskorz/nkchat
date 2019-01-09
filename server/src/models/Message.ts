import { ObjectID } from 'mongodb';
import { Field, ObjectType, registerEnumType } from 'type-graphql';
import { Column, Entity, ObjectIdColumn } from 'typeorm';

export enum EmbedType {
  Youtube = 'YOUTUBE',
  Alugha = 'ALUGHA',
  Image = 'IMAGE',
}

registerEnumType(EmbedType, {
  name: 'EmbedType',
});

@ObjectType()
export class Embed {
  @Field(type => EmbedType)
  @Column()
  type: EmbedType;

  @Field()
  @Column()
  src: string;
}

@ObjectType()
@Entity()
export class Message {
  @Field(type => ObjectID)
  @ObjectIdColumn()
  readonly id: ObjectID;

  @Field()
  @Column()
  content: string;

  @Field(type => ObjectID)
  @Column()
  authorId: ObjectID;

  @Field(type => ObjectID)
  @Column()
  roomId: ObjectID;

  @Field(type => [Embed])
  @Column(type => Embed)
  embeds: Embed[];

  @Field()
  createdAt(): Date {
    return this.id.getTimestamp();
  }
}
