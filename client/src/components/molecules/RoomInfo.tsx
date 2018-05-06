import * as React from 'react';
import styled from 'react-emotion';
import * as colors from 'colors';
import SideBar from './SideBar';

const SubTitle = styled('h3')`
  font-size: 0.9em;
  margin: 0;
  font-weight: normal;
  margin-top: 10px;
  padding: 0 15px;
`;

const RoomIdText = styled('input')`
  appearance: none;
  border: none;
  border-radius: 2px;
  padding: 5px;
  margin: 10px 15px;
  color: ${colors.primaryText};
  background: ${colors.secondary};
  font-size: 0.8em;
  text-align: center;
`;

const List = styled('ul')`
  display: block;
  margin: 0;
  padding: 10px 0;
  overflow: auto;
  flex: 1;
  font-size: 0.8em;
`;

const Item = styled('li')`
  display: block;
  padding: 10px 15px;
  cursor: pointer;

  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  color: ${colors.darkSecondaryText};

  transition: 0.1s ease color, 0.1s ease background;

  :hover,
  &.active {
    background: ${colors.darkSecondary};
    color: ${colors.darkPrimaryText};
  }
`;

interface User {
  id: string;
  name: string;
}

interface Room {
  id: string;
  members: User[];
}

interface Props {
  room: Room;
}

const selectOnFocus: React.FocusEventHandler<HTMLInputElement> = e => {
  // Work around a bug in Microsoft Edge that prevents selecting text
  // inside the focus event handler:
  // https://stackoverflow.com/questions/38487059/selecting-all-content-of-text-input-on-focus-in-microsoft-edge
  const t = e.currentTarget;
  setTimeout(() => t.select(), 0);
};

export default class RoomInfo extends React.Component<Props> {
  render() {
    const { room } = this.props;

    return (
      <SideBar title="About this room">
        <SubTitle>Room ID</SubTitle>
        <RoomIdText
          type="text"
          readOnly
          onFocus={selectOnFocus}
          value={room.id}
        />
        <SubTitle>Members ({room.members.length})</SubTitle>
        <List>
          {room.members.map(user => <Item key={user.id}>{user.name}</Item>)}
        </List>
      </SideBar>
    );
  }
}
