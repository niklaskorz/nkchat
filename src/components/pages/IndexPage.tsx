import * as React from 'react';
import gql from 'graphql-tag';
import { ApolloQueryResult } from 'apollo-client';
import { graphql, ChildProps, compose, MutationFunc } from 'react-apollo';
import styled from 'react-emotion';
import Chat from '../organisms/Chat';
import LoginPage from './LoginPage';
import RoomList, { Room } from '../molecules/RoomList';

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
  createRoom: MutationFunc<{ createRoom: Room }, { name: string }>;
  joinRoom: MutationFunc<{ joinRoom: Room }, { roomId: string }>;
}

const IndexPageQuery = gql`
  query IndexPageQuery {
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

interface State {
  activeRoom?: Room;
}

class IndexPage extends React.Component<ChildProps<Props, Response>, State> {
  state: State = {};

  onCreateRoom = async (name: string) => {
    await this.props.createRoom({
      variables: { name },
      update: (store, result: ApolloQueryResult<{ createRoom: Room }>) => {
        const data = store.readQuery<Response>({ query: IndexPageQuery });
        if (data) {
          data.viewer.rooms.push(result.data.createRoom);
          store.writeQuery({ query: IndexPageQuery, data });
        }
      }
    });
  };

  onJoinRoom = async (roomId: string) => {
    await this.props.joinRoom({
      variables: { roomId },
      update: (store, result: ApolloQueryResult<{ joinRoom: Room }>) => {
        const data = store.readQuery<Response>({ query: IndexPageQuery });
        if (data) {
          data.viewer.rooms.push(result.data.joinRoom);
          store.writeQuery({ query: IndexPageQuery, data });
        }
      }
    });
  };

  onSelectRoom = (room: Room) => {
    this.setState({ activeRoom: room });
  };

  render() {
    if (!this.props.data) {
      return null;
    }
    const { loading, error, viewer } = this.props.data;
    if (loading) {
      return 'Loading...';
    }
    if (error) {
      return error.message;
    }
    if (!viewer) {
      return <LoginPage />;
    }

    const { activeRoom = viewer.rooms[0] } = this.state;

    return (
      <Container>
        <RoomList
          rooms={viewer.rooms}
          activeRoomId={activeRoom && activeRoom.id}
          onCreate={this.onCreateRoom}
          onJoin={this.onJoinRoom}
          onSelect={this.onSelectRoom}
        />
        {activeRoom && <Chat roomId={activeRoom.id} />}
        <RoomList
          rooms={viewer.rooms}
          activeRoomId={activeRoom && activeRoom.id}
          onCreate={this.onCreateRoom}
          onJoin={this.onJoinRoom}
          onSelect={this.onSelectRoom}
        />
      </Container>
    );
  }
}

const withData = graphql<Response>(IndexPageQuery);

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
  IndexPage
);
