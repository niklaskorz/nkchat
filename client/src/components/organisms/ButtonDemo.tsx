import * as React from 'react';
import ButtonGroup from '../molecules/ButtonGroup';
import Button from '../atoms/Button';

export default class ButtonDemo extends React.Component {
  onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    alert(e.currentTarget.textContent);
  };

  render() {
    return (
      <ButtonGroup>
        <Button onClick={this.onClick}>A</Button>
        <Button onClick={this.onClick}>B</Button>
      </ButtonGroup>
    );
  }
}
