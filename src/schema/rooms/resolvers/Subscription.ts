import { withFilter } from 'graphql-subscriptions';
import { pubsub, SubscriptionType } from 'subscriptions';
import { InstanceType, Room, User } from 'models';

interface RoomWasUpdatedPayload {
  room: InstanceType<Room>;
}

interface UserJoinedPayload {
  roomId: string;
  user: InstanceType<User>;
}

export default {
  roomWasUpdated: {
    subscribe: withFilter(
      () => pubsub.asyncIterator(SubscriptionType.RoomWasUpdated),
      (payload: RoomWasUpdatedPayload, variables: { roomId: string }) =>
        payload.room.id === variables.roomId,
    ),
  },
  userJoined: {
    subscribe: withFilter(
      () => pubsub.asyncIterator(SubscriptionType.RoomWasUpdated),
      (payload: UserJoinedPayload, variables: { roomId: string }) =>
        payload.roomId === variables.roomId,
    ),
  },
};
