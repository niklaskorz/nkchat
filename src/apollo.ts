import { split, Operation } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';

const session = localStorage.session;

// const host = '141.72.129.119';
const host = location.hostname;

const httpLink = new HttpLink({
  uri: `http://${host}:3000/graphql`,
  headers: session && {
    'X-Session-ID': session
  }
});

const wsLink = new WebSocketLink({
  uri: `ws://${host}:3000/subscriptions`,
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
