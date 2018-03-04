import { withFilter } from 'graphql-subscriptions';
import { pubsub, SubscriptionType } from 'subscriptions';
import { InstanceType, Room, User } from 'models';

interface RoomWasUpdatedPayload {
  room: InstanceType<Room>;
}

interface UserJoinedRoomPayload {
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
    resolve: (payload: RoomWasUpdatedPayload) => payload.room,
  },
  userJoinedRoom: {
    subscribe: withFilter(
      () => pubsub.asyncIterator(SubscriptionType.UserJoinedRoom),
      (payload: UserJoinedRoomPayload, variables: { roomId: string }) =>
        payload.roomId === variables.roomId,
    ),
    resolve: (payload: UserJoinedRoomPayload) => payload.user,
  },
};
