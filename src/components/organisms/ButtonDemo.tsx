import * as React from 'react';
import ButtonGroup from '../molecules/ButtonGroup';
import Button from '../atoms/Button';

export default class ButtonDemo extends React.Component {
  render() {
    return (
      <ButtonGroup>
        <Button>A</Button>
        <Button>B</Button>
      </ButtonGroup>
    );
  }
}
