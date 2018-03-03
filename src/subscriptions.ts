import { PubSub } from 'graphql-subscriptions';

export enum SubscriptionType {
  MessageWasSent = 'MessageWasSent',
  RoomWasUpdated = 'RoomWasUpdated',
  UserJoinedRoom = 'UserJoinedRoom',
}

export const pubsub = new PubSub();
