import { split, Operation } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';

const session = localStorage.session;

const protocol = location.protocol;
const hostname = location.hostname;
const port = location.port && location.port !== ':8080' ? ':3000' : '';
const host = hostname + port;
const base = protocol + '//' + host;
const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:';
const wsBase = wsProtocol + '//' + host;

const httpLink = new HttpLink({
  uri: base + '/graphql',
  headers: session && {
    Authentication: 'Bearer ' + session
  }
});

const wsLink = new WebSocketLink({
  uri: wsBase + '/subscriptions',
  options: {
    reconnect: true,
    connectionParams: {
      session
    }
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
