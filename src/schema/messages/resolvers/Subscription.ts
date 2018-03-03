import { withFilter } from 'graphql-subscriptions';
import { pubsub, SubscriptionType } from 'subscriptions';
import { InstanceType, Message } from 'models';

interface MessageWasSentPayload {
  roomId: string;
  message: InstanceType<Message>;
}

export default {
  messageWasSent: {
    subscribe: withFilter(
      () => pubsub.asyncIterator(SubscriptionType.RoomWasUpdated),
      (payload: MessageWasSentPayload, variables: { roomId: string }) =>
        payload.roomId === variables.roomId,
    ),
  },
};
