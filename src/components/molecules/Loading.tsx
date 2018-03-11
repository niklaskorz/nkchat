import React from 'react';
import styled from 'react-emotion';
import * as colors from 'colors';
import Spinner from '../atoms/Spinner';

const Container = styled('div')`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${colors.primary};
`;

export default class Loading extends React.Component {
  render() {
    return (
      <Container>
        <Spinner />
      </Container>
    );
  }
}
