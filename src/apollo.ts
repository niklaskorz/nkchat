import { split, Operation } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';

const httpLink = new HttpLink({
  uri: 'http://localhost:9000/graphql'
});

const wsLink = new WebSocketLink({
  uri: 'ws://localhost:9000/subscriptions',
  options: {
    reconnect: true
  }
});

const isSubscription = ({ query }: Operation) => {
  const node = getMainDefinition(query);
  return (
    node.kind === 'OperationDefinition' && node.operation === 'subscription'
  );
};

const link = split(isSubscription, wsLink, httpLink);
const cache = new InMemoryCache();

const client = new ApolloClient({
  link,
  cache
});

export default client;
