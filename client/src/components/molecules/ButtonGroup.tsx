import * as React from 'react';
import styled from 'react-emotion';

const Group = styled('div')`
  display: flex;
  flex-direction: row;
`;

export default class ButtonGroup extends React.Component {
  render() {
    return <Group>{this.props.children}</Group>;
  }
}
