import { InstanceType, Message, MessageModel } from 'models';
import Context from 'Context';
import { pubsub, SubscriptionType } from 'subscriptions';

interface SendMessageInput {
  roomId: string;
  content: string;
}

export default {
  async sendMessage(
    root: any,
    { input }: { input: SendMessageInput },
    ctx: Context,
  ): Promise<InstanceType<Message>> {
    const viewer = ctx.state.viewer;
    if (!viewer) {
      throw new Error('Authentication required');
    }

    const message = await MessageModel.create({
      content: input.content,
      author: viewer.id,
      room: input.roomId,
    });

    pubsub.publish(SubscriptionType.MessageWasSent, {
      messageWasSent: {
        roomId: input.roomId,
        message,
      },
    });

    return message;
  },
};
