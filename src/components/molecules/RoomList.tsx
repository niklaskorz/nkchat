import * as React from 'react';
import styled from 'react-emotion';

const Section = styled('section')`
  background: #fff;
  flex-shrink: 0;
  width: 250px;
  border-right: 1px solid #485460;

  display: flex;
  flex-direction: column;
`;

const Header = styled('header')`
  background: #3c40c6;
  color: #fff;
  font-size: 1.2em;
  padding: 10px;

  flex-shrink: 0;
`;

const ActionBar = styled('div')`
  flex-shrink: 0;
  display: flex;
`;

const Action = styled('button')`
  border: 1px solid #1e272e;
  background: #485460;
  color: #fff;
  flex: 1;
  appearance: none;
  cursor: pointer;
  padding: 5px;
  text-transform: uppercase;
  font-size: 0.75em;

  :hover {
    background: #1e272e;
  }
`;
Action.defaultProps = {
  type: 'button'
};

const List = styled('ul')`
  display: block;
  margin: 0;
  padding: 0;
  overflow: auto;
  flex: 1;
`;

const Item = styled('li')`
  display: block;
  padding: 10px;
  border-bottom: 1px solid #d2dae2;
  cursor: pointer;

  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  :hover {
    background: #d2dae2;
  }
`;

class RoomList extends React.Component {
  render() {
    return (
      <Section>
        <Header>Rooms</Header>
        <List>
          <Item>The Real Chat</Item>
          <Item>
            Politics and Stuff with a really long name that will not fit
          </Item>
          <Item>Once upon a time</Item>
        </List>
        <ActionBar>
          <Action>Create</Action>
          <Action>Join</Action>
        </ActionBar>
      </Section>
    );
  }
}

export default RoomList;
