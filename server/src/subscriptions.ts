import * as config from './config';
import NatsPubSub from './nats-subscriptions/NatsPubSub';

export enum SubscriptionType {
  MessageWasSent = 'MessageWasSent',
  RoomWasUpdated = 'RoomWasUpdated',
  UserJoinedRoom = 'UserJoinedRoom',
}

export const pubsub = new NatsPubSub({
  url: `nats://${config.natsHost}:4222`,
});
