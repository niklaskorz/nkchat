import React from 'react';
import gql from 'graphql-tag';
import { ChildProps, compose, graphql, MutationFunc } from 'react-apollo';
import { Link } from 'react-router-dom';
import styled from 'react-emotion';
import { Helmet } from 'react-helmet';
import * as colors from 'colors';
import formatError from 'formatError';
import ErrorMessage from '../atoms/ErrorMessage';

const Container = styled('div')`
  background: ${colors.darkPrimary};
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Form = styled('form')`
  background: ${colors.primary};
  display: flex;
  flex-direction: column;
  padding: 20px;
  border-radius: 2px;
  width: 400px;
  max-width: 100%;
`;

const Title = styled('h1')`
  text-align: center;
`;

const Input = styled('input')`
  margin-bottom: 20px;
  border: 1px solid ${colors.secondary};
  padding: 15px 10px;
  border-radius: 2px;
  box-shadow: none;
`;

const Button = styled('button')`
  border: 1px solid ${colors.darkSecondary};
  background: ${colors.darkSecondary};
  color: ${colors.darkSecondaryText};
  padding: 15px 10px;
  margin-bottom: 15px;
  border-radius: 2px;
  text-transform: uppercase;
  cursor: pointer;
  transition: 0.1s background ease, 0.1s color ease;

  :hover,
  :active {
    background: ${colors.secondary};
    color: ${colors.primaryText};
  }
`;

const InfoText = styled('p')`
  text-align: center;
`;

interface Session {
  id: string;
}

interface LoginVariables {
  name: string;
  password: string;
}

interface Props {
  location: {
    pathname: string;
    state?: {
      from: {
        pathname: string;
      };
    };
  };
  login: MutationFunc<{ login: Session }, LoginVariables>;
  register: MutationFunc<{ register: Session }, LoginVariables>;
}

interface Response {
  viewer: {
    id: string;
  };
}

interface State {
  name: string;
  password: string;
  errorMessage?: string;
}

class LoginPage extends React.Component<ChildProps<Props, Response>, State> {
  state: State = {
    name: '',
    password: '',
  };

  componentDidUpdate(prevProps: Props) {
    if (this.props.location.pathname !== prevProps.location.pathname) {
      this.setState({ errorMessage: undefined });
    }
  }

  onNameChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    this.setState({ name: e.currentTarget.value });
  };

  onPasswordChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    this.setState({ password: e.currentTarget.value });
  };

  onSubmit: React.FormEventHandler<HTMLFormElement> = async e => {
    e.preventDefault();

    const { name, password } = this.state;
    const {
      location: { pathname },
    } = this.props;

    try {
      let session: Session;
      if (pathname === '/register') {
        const result = await this.props.register({
          variables: { name, password },
        });
        session = result.data.register;
      } else {
        const result = await this.props.login({
          variables: { name, password },
        });
        session = result.data.login;
      }
      localStorage.session = session.id;

      if (this.props.location.state) {
        // Reloads and redirects to the chat room visited before
        // the user was redirected to the login page
        location.pathname = this.props.location.state.from.pathname;
      } else {
        // Redirects the user to the room list if no room was open before
        // the user was redirected to the login page
        location.pathname = '/';
      }
    } catch (ex) {
      this.setState({ errorMessage: formatError(ex.message) });
    }
  };

  render() {
    const { name, password, errorMessage } = this.state;
    const {
      location: { pathname },
    } = this.props;
    const isRegistration = pathname === '/register';
    const label = isRegistration ? 'Register' : 'Login';

    return (
      <Container>
        <Helmet title={label} />
        <Form onSubmit={this.onSubmit}>
          <Title>{label}</Title>
          {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
          <Input
            type="text"
            placeholder="Name"
            autoFocus
            required
            value={name}
            onChange={this.onNameChange}
          />
          <Input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={this.onPasswordChange}
          />
          <Button type="submit">{label}</Button>
          {!isRegistration && (
            <InfoText>
              Don't have an account yet?{' '}
              <Link to="/register">Register here</Link>
            </InfoText>
          )}
          {isRegistration && (
            <InfoText>
              Already have an account? <Link to="/login">Login here</Link>
            </InfoText>
          )}
        </Form>
      </Container>
    );
  }
}

const LoginMutation = gql`
  mutation LoginMutation($name: String!, $password: String!) {
    login(input: { name: $name, password: $password }) {
      id
    }
  }
`;

const RegisterMutation = gql`
  mutation RegisterMutation($name: String!, $password: String!) {
    register(input: { name: $name, password: $password }) {
      id
    }
  }
`;

const withMutations = compose(
  graphql(LoginMutation, { name: 'login' }),
  graphql(RegisterMutation, { name: 'register' }),
);

export default withMutations(LoginPage);
