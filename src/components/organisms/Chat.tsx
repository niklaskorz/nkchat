import * as React from 'react';
import styled from 'react-emotion';
import gql from 'graphql-tag';
import { graphql, compose, ChildProps, MutationFunc } from 'react-apollo';
import toMaterialStyle from 'material-color-hash';
import ContentEditable from 'react-sane-contenteditable';
import * as colors from 'colors';

const Section = styled('section')`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const Header = styled('header')`
  background: ${colors.primary};
  color: ${colors.primaryText};
  font-size: 1.2em;
  padding: 10px;
  text-align: center;
  flex-shrink: 0;

  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  z-index: 2;
`;

const Messages = styled('div')`
  flex: 1;
  display: flex;
  flex-direction: column-reverse;
  overflow: auto;
`;

const MessagesInner = styled('div')`
  width: 100%;
  padding: 5px 0;
`;

const MessageHeader = styled('header')`
  font-size: 0.8em;
  font-weight: bold;
  margin-bottom: 10px;
`;

const Message = styled('div')`
  background: ${colors.secondary};
  color: ${colors.secondaryText};
  padding: 15px;
  margin: 5px 10px;
  width: 300px;
  max-width: 100%;
  border-radius: 5px;
  line-height: 1.5;

  &.viewerIsAuthor {
    margin-left: auto;
  }
`;

const InputForm = styled('form')`
  display: flex;
  background: ${colors.primary};
  padding: 10px;
  box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.12), 0 -1px 2px rgba(0, 0, 0, 0.24);
  z-index: 2;
`;

const MessageInputContainer = styled('div')`
  flex: 1;
  padding: 10px;
  background: #fff;
  color: #000;
  border-radius: 2px;
`;

const MessageInput = styled(ContentEditable)`
  max-height: 5em;
  overflow-y: auto;
  outline: none;
`;

interface User {
  id: string;
  name: string;
}

interface Message {
  id: string;
  createdAt: string;
  content: string;
  author: User;
  viewerIsAuthor: boolean;
}

interface Room {
  id: string;
  name: string;
  messages: Message[];
}

interface Response {
  room: Room;
}

interface Props {
  roomId: string;
  sendMessage: MutationFunc<
    { sendMessage: { id: string } },
    { roomId: string; content: string }
  >;
}

interface State {
  inputText: string;
}

const compareMessages = (a: Message, b: Message): number => {
  const dateA = new Date(a.createdAt);
  const dateB = new Date(a.createdAt);

  return dateA.getTime() - dateB.getTime();
};

const ChatMessageFragment = gql`
  fragment ChatMessage on Message {
    id
    createdAt
    content
    author {
      id
      name
    }
    viewerIsAuthor
  }
`;

const ChatQuery = gql`
  ${ChatMessageFragment}

  query ChatQuery($roomId: ID!) {
    room(id: $roomId) {
      id
      name
      messages {
        ...ChatMessage
      }
    }
  }
`;

interface SubscriptionData {
  data: { messageWasSent: Message };
}

const ChatSubscription = gql`
  ${ChatMessageFragment}

  subscription ChatSubscription($roomId: ID!) {
    messageWasSent(roomId: $roomId) {
      ...ChatMessage
    }
  }
`;

class Chat extends React.Component<ChildProps<Props, Response>, State> {
  state: State = {
    inputText: ''
  };

  componentDidMount() {
    this.subscribeToMessages();
  }

  componentDidUpdate(prevProps: ChildProps<Props, Response>) {
    if (this.props.data !== prevProps.data) {
      // tslint:disable-next-line
      console.info('Data changed');
    }

    if (this.props.roomId !== prevProps.roomId) {
      this.subscribeToMessages();
    }
  }

  subscribeToMessages() {
    const { roomId, data } = this.props;
    if (!data) {
      return;
    }

    data.subscribeToMore({
      document: ChatSubscription,
      variables: { roomId },
      updateQuery: (
        prev: Response,
        { subscriptionData }: { subscriptionData: SubscriptionData }
      ) => {
        if (!subscriptionData.data) {
          return prev;
        }

        const newMessage = subscriptionData.data.messageWasSent;
        let messages = prev.room.messages;
        if (!messages.find(message => message.id === newMessage.id)) {
          // Message is really new, add to message list
          messages = [...messages, newMessage];
          messages.sort(compareMessages);
        }

        return {
          ...prev,
          room: {
            ...prev.room,
            messages
          }
        };
      }
    });
  }

  async sendMessage() {
    const { sendMessage, data } = this.props;
    const { inputText } = this.state;
    if (!data) {
      return;
    }
    const { room } = data;
    if (!room) {
      return;
    }

    const content = inputText.trim();
    if (!content.length) {
      return;
    }

    await sendMessage({
      variables: { roomId: room.id, content }
    });
    this.setState({ inputText: '' });
  }

  onSubmit: React.FormEventHandler<HTMLFormElement> = e => {
    e.preventDefault();
    this.sendMessage();
  };

  onInputTextChange = (e: React.FormEvent<HTMLElement>, value: string) => {
    this.setState({ inputText: value });
  };

  render() {
    if (!this.props.data) {
      return null;
    }
    const { loading, error, room } = this.props.data;
    if (loading) {
      return 'Loading...';
    }
    if (error) {
      return error.message;
    }
    if (!room) {
      return 'Room not found';
    }

    return (
      <Section>
        <Header title={room.name}>{room.name}</Header>
        <Messages>
          <MessagesInner>
            {room.messages.map(message => (
              <Message
                key={message.id}
                className={message.viewerIsAuthor ? 'viewerIsAuthor' : ''}
                style={toMaterialStyle(message.author.id, 500)}
              >
                <MessageHeader>
                  {message.author.name} ({new Date(
                    message.createdAt
                  ).toLocaleTimeString()})
                </MessageHeader>
                {message.content}
              </Message>
            ))}
          </MessagesInner>
        </Messages>
        <InputForm onSubmit={this.onSubmit}>
          <MessageInputContainer>
            <MessageInput
              content={this.state.inputText}
              onChange={this.onInputTextChange}
              maxLength={500}
              multiLine
            />
          </MessageInputContainer>
          <button type="submit">Send</button>
        </InputForm>
      </Section>
    );
  }
}

const withData = graphql<Response>(ChatQuery, {
  options: ({ roomId }) => ({
    variables: { roomId }
  })
});

const withSendMessageMutation = graphql(
  gql`
    mutation SendMessage($roomId: ID!, $content: String!) {
      sendMessage(input: { roomId: $roomId, content: $content }) {
        id
      }
    }
  `,
  { name: 'sendMessage' }
);

export default compose(withData, withSendMessageMutation)(Chat);
