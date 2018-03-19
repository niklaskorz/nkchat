import * as React from 'react';
import gql from 'graphql-tag';
import { ApolloQueryResult } from 'apollo-client';
import { graphql, ChildProps, compose, MutationFunc } from 'react-apollo';
import styled from 'react-emotion';
import { Redirect } from 'react-router-dom';
import Chat from '../organisms/Chat';
import RoomList, { Room } from '../molecules/RoomList';
import Loading from '../molecules/Loading';

const Container = styled('div')`
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
`;

interface User {
  id: string;
  name: string;
  rooms: Room[];
}

interface Response {
  viewer: User;
}

interface Props {
  location: {
    pathname: string;
  };
  match: {
    params: {
      roomId?: string;
    };
  };
  createRoom: MutationFunc<{ createRoom: Room }, { name: string }>;
  joinRoom: MutationFunc<{ joinRoom: Room }, { roomId: string }>;
}

const ChatPageQuery = gql`
  query ChatPageQuery {
    viewer {
      id
      name
      rooms {
        id
        name
      }
    }
  }
`;

class ChatPage extends React.Component<ChildProps<Props, Response>> {
  createRoom = async (name: string) => {
    await this.props.createRoom({
      variables: { name },
      update: (store, result: ApolloQueryResult<{ createRoom: Room }>) => {
        const data = store.readQuery<Response>({ query: ChatPageQuery });
        if (data) {
          data.viewer.rooms.push(result.data.createRoom);
          store.writeQuery({ query: ChatPageQuery, data });
        }
      }
    });
  };

  joinRoom = async (roomId: string) => {
    await this.props.joinRoom({
      variables: { roomId },
      update: (store, result: ApolloQueryResult<{ joinRoom: Room }>) => {
        const data = store.readQuery<Response>({ query: ChatPageQuery });
        if (data) {
          data.viewer.rooms.push(result.data.joinRoom);
          store.writeQuery({ query: ChatPageQuery, data });
        }
      }
    });
  };

  logout = () => {
    delete localStorage.session;
    location.pathname = '/login';
  };

  render() {
    if (!this.props.data) {
      return null;
    }
    const { loading, error, viewer } = this.props.data;
    if (loading) {
      return <Loading />;
    }
    if (error) {
      return error.message;
    }
    if (!viewer) {
      return (
        <Redirect
          to={{
            pathname: '/login',
            state: {
              from: this.props.location
            }
          }}
        />
      );
    }

    const { roomId } = this.props.match.params;

    return (
      <Container>
        <RoomList
          rooms={viewer.rooms}
          viewerName={viewer.name}
          activeRoomId={roomId}
          onCreate={this.createRoom}
          onJoin={this.joinRoom}
          onLogout={this.logout}
        />
        {roomId && <Chat roomId={roomId} />}
      </Container>
    );
  }
}

const withData = graphql<Response>(ChatPageQuery);

const withCreateRoomMutation = graphql(
  gql`
    mutation CreateRoom($name: String!) {
      createRoom(input: { name: $name }) {
        id
        name
      }
    }
  `,
  { name: 'createRoom' }
);

const withJoinRoomMutation = graphql(
  gql`
    mutation JoinRoom($roomId: ID!) {
      joinRoom(input: { roomId: $roomId }) {
        id
        name
      }
    }
  `,
  { name: 'joinRoom' }
);

export default compose(withData, withCreateRoomMutation, withJoinRoomMutation)(
  ChatPage
);