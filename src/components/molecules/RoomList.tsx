import * as React from 'react';
import styled from 'react-emotion';
import swal from 'sweetalert2';
import * as colors from 'colors';

const Section = styled('section')`
  flex-shrink: 0;
  width: 250px;
  border-right: 2px solid #000;

  display: flex;
  flex-direction: column;
`;

const Header = styled('header')`
  background: ${colors.primary};
  color: ${colors.primaryText};
  font-size: 1.2em;
  padding: 10px;
  text-align: center;
  flex-shrink: 0;
`;

const ActionBar = styled('div')`
  flex-shrink: 0;
  display: flex;
`;

const Action = styled('button')`
  border: none;
  background: ${colors.secondary};
  color: ${colors.secondaryText};
  flex: 1;
  appearance: none;
  cursor: pointer;
  padding: 5px;
  text-transform: uppercase;
  font-size: 0.75em;

  :hover {
    background: ${colors.secondaryDark};
    color: ${colors.secondaryDarkText};
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
  border-bottom: 1px solid #eee;
  cursor: pointer;

  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  :hover {
    background: #eee;
  }
`;

export interface Room {
  id: string;
  name: string;
}

interface Props {
  rooms: Room[];
  onCreate(name: string): void;
  onJoin(id: string): void;
  onSelect(room: Room): void;
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
    const { rooms, onSelect } = this.props;

    return (
      <Section>
        <Header>Rooms</Header>
        <ActionBar>
          <Action onClick={this.showCreateDialog}>Create</Action>
          <Action onClick={this.showJoinDialog}>Join</Action>
        </ActionBar>
        <List>
          {rooms.map(room => (
            <Item
              key={room.id}
              onClick={onSelect.bind(null, room)}
              title={room.name}
            >
              {room.name}
            </Item>
          ))}
        </List>
      </Section>
    );
  }
}

export default RoomList;
