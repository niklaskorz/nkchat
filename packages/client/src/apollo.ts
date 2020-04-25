import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { Operation, split } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';

const base = '/graphql';
const wsProtocol = location.protocol.replace('http', 'ws');
const wsBase = wsProtocol + '//' + location.host + base;

const httpLink = new HttpLink({
  uri: base,
  credentials: 'same-origin',
});

const wsLink = new WebSocketLink({
  uri: wsBase,
  options: {
    reconnect: true,
  },
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
  cache,
});

export default client;
