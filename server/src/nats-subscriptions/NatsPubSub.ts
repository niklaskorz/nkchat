import { PubSubEngine } from 'graphql-subscriptions';
import { connect, Client, ClientOpts } from 'nats';
import PubSubAsyncIterator from './PubSubAsyncIterator';
import { ObjectID } from 'mongodb';

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

  public publish(triggerName: string, payload: any): boolean {
    this.client.publish(triggerName, JSON.stringify(payload));
    return true;
  }

  public subscribe(
    triggerName: string,
    onMessage: (payload: any) => void,
  ): Promise<number> {
    const id = this.client.subscribe(triggerName, (msg: string) =>
      onMessage(JSON.parse(msg, reviver)),
    );
    return Promise.resolve(id);
  }

  public unsubscribe(subId: number) {
    this.client.unsubscribe(subId);
  }

  public asyncIterator<T>(triggers: string | string[]): AsyncIterator<T> {
    return new PubSubAsyncIterator<T>(this, triggers);
  }
}
