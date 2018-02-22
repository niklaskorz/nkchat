import * as React from 'react';
import gql from 'graphql-tag';
import { graphql, ChildProps } from 'react-apollo';
import ButtonDemo from '../organisms/ButtonDemo';

interface Track {
  id: string;
  title: string;
  name: string;
}

interface Video {
  id: string;
  track: Track;
}

interface Response {
  videos?: Video[];
}

class IndexPage extends React.Component<ChildProps<{}, Response>> {
  render() {
    const { videos } = this.props.data;
    return (
      <div>
        <ButtonDemo />
        <div>
          {videos && videos.map(v => <div key={v.id}>{v.track.title}</div>)}
        </div>
      </div>
    );
  }
}

const withData = graphql<Response>(gql`
  query IndexPageQuery {
    videos(limit: 10) {
      id
      track(preferredLanguages: ["deu", "eng"]) {
        id
        title
        name
      }
    }
  }
`);

export default withData(IndexPage);
