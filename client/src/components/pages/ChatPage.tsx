import { ApolloQueryResult } from 'apollo-client';
import gql from 'graphql-tag';
import { History, Location } from 'history';
import React from 'react';
import { ChildProps, compose, graphql, MutationFunc } from 'react-apollo';
import { Redirect } from 'react-router-dom';
import styled from 'styled-components';
import client from '../../apollo';
import Loading from '../molecules/Loading';
import NothingHere from '../molecules/NothingHere';
import RoomList, { Room } from '../molecules/RoomList';
import Chat from '../organisms/Chat';

const Container = styled.div`
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
  history: History;
  location: Location;
  match: {
    params: {
      roomId?: string;
    };
  };
  createRoom: MutationFunc<{ createRoom: Room }, { name: string }>;
  joinRoom: MutationFunc<{ joinRoom: Room }, { roomId: string }>;
  logout: MutationFunc<{ logout: string }, {}>;
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
    const res = await this.props.createRoom({
      variables: { name },
      update: (store, result: ApolloQueryResult<{ createRoom: Room }>) => {
        const data = store.readQuery<Response>({ query: ChatPageQuery });
        if (data) {
          data.viewer.rooms.push(result.data.createRoom);
          store.writeQuery({ query: ChatPageQuery, data });
        }
      },
    });
    // Open the created room
    const roomId = res.data.createRoom.id;
    this.props.history.push(`/rooms/${roomId}`);
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
      },
    });
    // Open the joined room
    this.props.history.push(`/rooms/${roomId}`);
  };

  logout = async () => {
    await this.props.logout();
    await client.resetStore();
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
              from: this.props.location,
            },
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
        {roomId ? <Chat roomId={roomId} /> : <NothingHere />}
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
  { name: 'createRoom' },
);

const withJoinRoomMutation = graphql(
  gql`
    mutation JoinRoom($roomId: ObjectID!) {
      joinRoom(input: { roomId: $roomId }) {
        id
        name
      }
    }
  `,
  { name: 'joinRoom' },
);

const withLogoutMutation = graphql(
  gql`
    mutation LogoutMutation {
      logout
    }
  `,
  { name: 'logout' },
);

export default compose(
  withData,
  withCreateRoomMutation,
  withJoinRoomMutation,
  withLogoutMutation,
)(ChatPage);
