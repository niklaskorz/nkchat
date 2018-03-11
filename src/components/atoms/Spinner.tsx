import React from 'react';
import styled, { keyframes } from 'react-emotion';
import * as colors from 'colors';

// CSS code taken from http://tobiasahlin.com/spinkit/

const stretchDelay = keyframes`
  0%, 40%, 100% {
    transform: scaleY(0.4);
  }

  20% {
    transform: scaleY(1.0);
  }
`;

const Container = styled('div')`
  margin: 100px auto;
  width: 50px;
  height: 40px;
  text-align: center;
  font-size: 10px;
`;

interface RectProps {
  delay: number;
}

const Rect = styled<RectProps, 'div'>('div')`
  background-color: ${colors.darkPrimary};
  height: 100%;
  width: 6px;
  margin: 0 2px;
  display: inline-block;

  animation: ${stretchDelay} 1.2s infinite ease-in-out;
  animation-delay: ${props => props.delay}s;
`;

export default class Spinner extends React.Component {
  render() {
    return (
      <Container>
        <Rect delay={0} />
        <Rect delay={-1} />
        <Rect delay={-0.9} />
        <Rect delay={-0.8} />
      </Container>
    );
  }
}
