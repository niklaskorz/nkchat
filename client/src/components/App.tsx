import React from 'react';
import { ApolloProvider } from 'react-apollo';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import apolloClient from '../apollo';
import ChatPage from './pages/ChatPage';
import LoginPage from './pages/LoginPage';

class App extends React.Component {
  render() {
    return (
      <div>
        <Helmet titleTemplate="%s - nkchat" defaultTitle="nkchat" />
        <ApolloProvider client={apolloClient}>
          <BrowserRouter>
            <Switch>
              <Route exact path="/" component={ChatPage} />
              <Route exact path="/rooms/:roomId" component={ChatPage} />
              <Route exact path="/login" component={LoginPage} />
              <Route exact path="/register" component={LoginPage} />
            </Switch>
          </BrowserRouter>
        </ApolloProvider>
      </div>
    );
  }
}

export default App;
