import * as React from 'react';
import { ApolloProvider } from 'react-apollo';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import apolloClient from './apollo';
import ChatPage from './components/pages/ChatPage';
import LoginPage from './components/pages/LoginPage';

class App extends React.Component {
  render() {
    return (
      <ApolloProvider client={apolloClient}>
        <BrowserRouter>
          <Switch>
            <Route exact path="/" component={ChatPage} />
            <Route exact path="/rooms/:roomId" component={ChatPage} />
            <Route exact path="/login" component={LoginPage} />
          </Switch>
        </BrowserRouter>
      </ApolloProvider>
    );
  }
}

export default App;
