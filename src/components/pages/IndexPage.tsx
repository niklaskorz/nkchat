import * as React from 'react';
import gql from 'graphql-tag';
import { graphql, ChildProps } from 'react-apollo';
import styled from 'react-emotion';
import RoomList from '../molecules/RoomList';

const Container = styled('div')`
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
`;

interface Response {
  viewer: object;
}

class IndexPage extends React.Component<ChildProps<{}, Response>> {
  render() {
    if (!this.props.data) {
      return null;
    }
    const { loading, error, viewer } = this.props.data;
    return (
      <Container>
        <RoomList />
        <div>
          {loading && 'Loading...'}
          {error && error.message}
          {viewer && JSON.stringify(viewer)}
        </div>
      </Container>
    );
  }
}

const withData = graphql<Response>(gql`
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
`);

export default withData(IndexPage);
