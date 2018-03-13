import * as React from 'react';
import gql from 'graphql-tag';
import { ChildProps, compose, graphql, MutationFunc } from 'react-apollo';
import styled from 'react-emotion';

const Form = styled('form')`
  display: flex;
  flex-direction: column;
  padding: 20px;
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
  isNew: boolean;
  name: string;
  password: string;
}

class LoginPage extends React.Component<ChildProps<Props, Response>, State> {
  state: State = {
    isNew: false,
    name: '',
    password: ''
  };

  onNewChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    this.setState({ isNew: e.currentTarget.checked });
  };

  onNameChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    this.setState({ name: e.currentTarget.value });
  };

  onPasswordChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    this.setState({ password: e.currentTarget.value });
  };

  onSubmit: React.FormEventHandler<HTMLFormElement> = async e => {
    e.preventDefault();

    const { isNew, name, password } = this.state;
    let session: Session;
    if (isNew) {
      const result = await this.props.register({
        variables: { name, password }
      });
      session = result.data.register;
    } else {
      const result = await this.props.login({ variables: { name, password } });
      session = result.data.login;
    }
    localStorage.session = session.id;

    if (this.props.location.state) {
      location.pathname = this.props.location.state.from.pathname;
    } else {
      location.pathname = '/';
    }
  };

  render() {
    const { isNew, name, password } = this.state;

    return (
      <Form onSubmit={this.onSubmit}>
        <h1>Login or register</h1>
        <label>
          <input
            type="checkbox"
            placeholder="I want to create a new account"
            checked={isNew}
            onChange={this.onNewChange}
          />
          Create new account
        </label>
        <input
          type="text"
          placeholder="Name"
          autoFocus
          required
          value={name}
          onChange={this.onNameChange}
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={this.onPasswordChange}
        />
        <button type="submit">{isNew ? 'Register' : 'Login'}</button>
      </Form>
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
  graphql(RegisterMutation, { name: 'register' })
);

export default withMutations(LoginPage);
