import { PubSubEngine } from 'graphql-subscriptions';
import { ObjectID } from 'mongodb';
import { Client, ClientOpts, connect } from 'nats';
import PubSubAsyncIterator from './PubSubAsyncIterator';

const reviver = (key: string, value: any) => {
  if (ObjectID.isValid(value)) {
    return ObjectID.createFromHexString(value);
  }
  return value;
};

export default class NatsPubSub implements PubSubEngine {
  protected client: Client;

  constructor(opts: ClientOpts) {
    this.client = connect(opts);
  }

  public async publish(triggerName: string, payload: any): Promise<void> {
    this.client.publish(triggerName, JSON.stringify(payload));
  }

  public async subscribe(
    triggerName: string,
    onMessage: (payload: any) => void,
  ): Promise<number> {
    return this.client.subscribe(triggerName, (msg: string) =>
      onMessage(JSON.parse(msg, reviver)),
    );
  }

  public unsubscribe(subId: number) {
    this.client.unsubscribe(subId);
  }

  public asyncIterator<T>(triggers: string | string[]): AsyncIterator<T> {
    return new PubSubAsyncIterator<T>(this, triggers);
  }
}
