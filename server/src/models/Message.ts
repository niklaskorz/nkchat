import { ObjectType, Field, registerEnumType } from 'type-graphql';
import { Entity, ObjectID, ObjectIdColumn, Column, Index } from 'typeorm';

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
  @Field()
  @ObjectIdColumn()
  id: ObjectID;

  @Field()
  @Column()
  content: string;

  @Field()
  @Column()
  authorId: ObjectID;

  @Field()
  @Index()
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
