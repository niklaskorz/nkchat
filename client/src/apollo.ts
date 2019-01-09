import { split, Operation } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';

const protocol = location.protocol;
const hostname = location.hostname;
const port = location.port && location.port !== '9000' ? '4000' : location.port;
const host = hostname + (port ? ':' + port : '');
const base = protocol + '//' + host;
const wsProtocol = protocol.replace('http', 'ws');
const wsBase = wsProtocol + '//' + host;

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
