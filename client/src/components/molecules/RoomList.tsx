import * as React from 'react';
import styled from 'react-emotion';
import swal from 'sweetalert2';
import { Link } from 'react-router-dom';
import * as colors from 'colors';
import SideBar from './SideBar';

const ActionBar = styled('div')`
  flex-shrink: 0;
  display: flex;
  margin: 10px;
  margin-bottom: 0;
  font-size: 0.8em;
`;

const Action = styled('button')`
  border: none;
  background: transparent;
  border: 1px solid ${colors.darkSecondaryText};
  color: ${colors.darkSecondaryText};
  flex: 1;
  appearance: none;
  cursor: pointer;
  padding: 5px 10px;
  margin: 0 5px;
  border-radius: 2px;
  text-transform: uppercase;
  font-size: 0.75em;

  transition: 0.1s ease color, 0.1s ease background;

  :hover {
    background: ${colors.darkSecondaryText};
    color: ${colors.darkSecondary};
  }
`;
Action.defaultProps = {
  type: 'button'
};

const List = styled('ul')`
  display: block;
  margin: 0;
  padding: 10px 0;
  overflow: auto;
  flex: 1;
  font-size: 0.8em;
`;

const ItemLink = styled(Link)`
  display: block;
  padding: 10px 15px;
  cursor: pointer;

  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  color: ${colors.darkSecondaryText};
  text-decoration: none;
  transition: 0.1s ease color, 0.1s ease background;

  :hover,
  &.active {
    background: ${colors.darkSecondary};
    color: ${colors.darkPrimaryText};
  }
`;

const Footer = styled('footer')`
  border-top: 2px solid ${colors.darkSecondary};
  border-bottom: 2px solid transparent;
  font-size: 0.8em;
  display: flex;
  align-items: center;
  height: 56px;
`;

const Viewer = styled('div')`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 10px 5px;
  margin-left: 15px;
  flex: 1;
`;

const LogoutButton = styled(Action)`
  margin: 10px 5px;
  margin-right: 15px;
  flex: 0 0 auto;
`;

export interface Room {
  id: string;
  name: string;
}

interface Props {
  viewerName: string;
  rooms: Room[];
  activeRoomId?: string;
  onCreate(name: string): void;
  onJoin(id: string): void;
  onLogout(): void;
}

class RoomList extends React.Component<Props> {
  showCreateDialog = async () => {
    const result = await swal({
      title: 'Create room',
      input: 'text',
      text: 'Room name',
      showCancelButton: true,
      confirmButtonText: 'Create'
    });
    if (!result.dismiss && result.value) {
      this.props.onCreate(result.value);
    }
  };

  showJoinDialog = async () => {
    const result = await swal({
      title: 'Join room',
      input: 'text',
      text: 'Room id',
      showCancelButton: true,
      confirmButtonText: 'Join'
    });
    if (!result.dismiss && result.value) {
      this.props.onJoin(result.value);
    }
  };

  render() {
    const { rooms, viewerName, activeRoomId, onLogout } = this.props;

    return (
      <SideBar title="Rooms">
        <ActionBar>
          <Action onClick={this.showJoinDialog}>Join</Action>
          <Action onClick={this.showCreateDialog}>Create</Action>
        </ActionBar>
        <List>
          {rooms.map(room => (
            <li key={room.id}>
              <ItemLink
                to={`/rooms/${room.id}`}
                title={room.name}
                className={room.id === activeRoomId ? 'active' : ''}
              >
                {room.name}
              </ItemLink>
            </li>
          ))}
        </List>
        <Footer>
          <Viewer>{viewerName}</Viewer>
          <LogoutButton onClick={onLogout}>Logout</LogoutButton>
        </Footer>
      </SideBar>
    );
  }
}

export default RoomList;
