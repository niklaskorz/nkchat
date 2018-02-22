import * as React from 'react';
import { ApolloProvider } from 'react-apollo';
import apolloClient from './apollo';
import IndexPage from './components/pages/IndexPage';

class App extends React.Component {
  render() {
    return (
      <ApolloProvider client={apolloClient}>
        <IndexPage />
      </ApolloProvider>
    );
  }
}

export default App;
