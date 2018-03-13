import NatsPubSub from './nats-subscriptions/NatsPubSub';

export enum SubscriptionType {
  MessageWasSent = 'MessageWasSent',
  RoomWasUpdated = 'RoomWasUpdated',
  UserJoinedRoom = 'UserJoinedRoom',
}

export const pubsub = new NatsPubSub({
  url: 'nats://localhost:4222',
});
