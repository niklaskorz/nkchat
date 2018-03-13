import { withFilter } from 'graphql-subscriptions';
import { pubsub, SubscriptionType } from 'subscriptions';
import { InstanceType, Message, MessageModel } from 'models';

interface MessageWasSentPayload {
  roomId: string;
  message: InstanceType<Message>;
}

export default {
  messageWasSent: {
    subscribe: withFilter(
      () => pubsub.asyncIterator(SubscriptionType.MessageWasSent),
      (payload: MessageWasSentPayload, variables: { roomId: string }) =>
        payload.roomId === variables.roomId,
    ),
    resolve: (payload: MessageWasSentPayload) =>
      new MessageModel(payload.message),
  },
};
