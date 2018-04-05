import * as React from 'react';
import styled from 'react-emotion';
import gql from 'graphql-tag';
import { graphql, compose, ChildProps, MutationFunc } from 'react-apollo';
import TextArea from 'react-textarea-autosize';
import Linkify from 'linkifyjs/react';
import { Helmet } from 'react-helmet';
import * as colors from 'colors';
import Loading from '../molecules/Loading';
import RoomInfo from '../molecules/RoomInfo';
import Embed, { Props as EmbedProps } from '../molecules/Embed';

const Section = styled('section')`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
`;

const Header = styled('header')`
  background: ${colors.primary};
  color: ${colors.primaryText};
  padding: 15px;
  text-align: center;
  flex-shrink: 0;
  z-index: 2;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  border-top: 2px solid transparent;
  border-bottom: 2px solid ${colors.secondary};
`;

const Messages = styled('div')`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 10px 40px;
  overflow: auto;
  background: ${colors.primary};
`;

const MessageHeader = styled('header')`
  display: flex;
  font-weight: bold;
  margin-bottom: 10px;
  align-items: baseline;
`;

const MessageAuthor = styled('div')`
  font-size: 0.9em;
  flex: 1;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const MessageDate = styled('div')`
  font-size: 0.7em;
  flex-shrink: 0;
  margin-left: 10px;
  color: ${colors.secondaryText};
`;

const MessageText = styled('div')`
  white-space: pre-wrap;
  word-wrap: break-word;
  max-width: 800px;
`;

const Message = styled('div')`
  background: #fff;
  color: #000;
  padding: 15px;
  margin: 10px 0;
  margin-right: auto;
  max-width: 100%;
  border-radius: 10px;
  line-height: 1.5;

  &.viewerIsAuthor {
    margin-left: auto;
    margin-right: 0;
    background: ${colors.secondary};
  }
`;

const NewMessageContainer = styled('div')`
  display: flex;
  background: ${colors.primary};
  padding: 10px;
  z-index: 2;
  border-top: 2px solid ${colors.secondary};
`;

const MessageInputContainer = styled('div')`
  flex: 1;
  padding: 10px;
  background: #fff;
  color: #000;
  border-radius: 2px;
`;

const MessageInput = styled(TextArea)`
  max-height: 5em;
  min-height: 1em;
  width: 100%;
  overflow-y: auto;
  padding: 0;
  outline: none;
  border: none;
  resize: none;
`;

const MessageSendButton = styled('button')`
  flex-shrink: 0;
  appearance: none;
  border: none;
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
  cursor: pointer;

  :disabled {
    cursor: not-allowed;
  }
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
  embeds: EmbedProps[];
}

interface Room {
  id: string;
  name: string;
  messages: Message[];
  members: User[];
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
    embeds {
      type
      src
    }
  }
`;

const ChatQuery = gql`
  ${ChatMessageFragment}

  query ChatQuery($roomId: ID!) {
    room(id: $roomId) {
      id
      name
      viewerIsMember
      messages {
        ...ChatMessage
      }
      members {
        id
        name
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
  messageContainer?: HTMLDivElement;
  stickToBottom: boolean = true;
  unsubscribe?: () => void;

  state: State = {
    inputText: ''
  };

  componentDidMount() {
    this.subscribeToMessages();
  }

  componentDidUpdate(prevProps: ChildProps<Props, Response>) {
    if (
      this.messageContainer &&
      this.props.data !== prevProps.data &&
      this.stickToBottom
    ) {
      this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
    }

    // Room changed
    if (this.props.roomId !== prevProps.roomId && this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = undefined;

      if (this.messageContainer) {
        this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
        this.stickToBottom = true;
      }
    }

    // Not subscribed currently, try to subscribe
    if (!this.unsubscribe) {
      this.subscribeToMessages();
    }
  }

  refMessageContainer = (el: HTMLDivElement) => {
    this.messageContainer = el;
  };

  subscribeToMessages() {
    const { roomId, data } = this.props;
    if (!data) {
      return;
    }

    this.unsubscribe = data.subscribeToMore({
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
        const messages = [...prev.room.messages];
        const messageIndex = messages.findIndex(m => m.id === newMessage.id);
        if (messageIndex !== -1) {
          messages[messageIndex] = newMessage;
        } else {
          messages.push(newMessage);
        }
        messages.sort(compareMessages);

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

  sendMessage = () => {
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
    if (!content.length || content.length > 500) {
      return;
    }

    this.setState({ inputText: '' });
    // Reset scroll preference so we see our new message
    this.stickToBottom = true;

    sendMessage({ variables: { roomId: room.id, content } });
  };

  onMessagesScroll: React.UIEventHandler<HTMLDivElement> = e => {
    const target = e.currentTarget;
    const height = target.getBoundingClientRect().height;
    const scrollBottom = target.scrollTop + height;

    this.stickToBottom = target.scrollHeight - scrollBottom <= 100;
  };

  onInputTextChange: React.ChangeEventHandler<HTMLTextAreaElement> = e => {
    this.setState({ inputText: e.currentTarget.value });
  };

  onInputTextKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = e => {
    if (e.keyCode === 13 && !e.shiftKey) {
      e.preventDefault();
      this.sendMessage();
    }
  };

  onEmbedLoaded = () => {
    if (this.messageContainer && this.stickToBottom) {
      // Make sure we're still at the bottom
      this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
    }
  };

  render() {
    if (!this.props.data) {
      return null;
    }
    const { loading, error, room } = this.props.data;
    if (loading) {
      return <Loading />;
    }
    if (error) {
      return error.message;
    }
    if (!room) {
      return 'Room not found';
    }

    const { inputText } = this.state;

    return (
      <React.Fragment>
        <Helmet title={room.name} />
        <Section>
          <Header title={room.name}>{room.name}</Header>
          <Messages
            innerRef={this.refMessageContainer}
            onScroll={this.onMessagesScroll}
          >
            {room.messages.map(message => (
              <Message
                key={message.id}
                className={message.viewerIsAuthor ? 'viewerIsAuthor' : ''}
              >
                <MessageHeader>
                  <MessageAuthor>{message.author.name}</MessageAuthor>
                  <MessageDate>
                    {new Date(message.createdAt).toLocaleString()}
                  </MessageDate>
                </MessageHeader>
                <MessageText>
                  <Linkify>{message.content}</Linkify>
                </MessageText>
                {message.embeds.map((embed, i) => (
                  <Embed
                    key={i}
                    type={embed.type}
                    src={embed.src}
                    onLoad={this.onEmbedLoaded}
                  />
                ))}
              </Message>
            ))}
          </Messages>
          <NewMessageContainer>
            <MessageInputContainer>
              <MessageInput
                useCacheForDOMMeasurements
                value={inputText}
                onChange={this.onInputTextChange}
                onKeyDown={this.onInputTextKeyDown}
              />
            </MessageInputContainer>
            <MessageSendButton type="button" onClick={this.sendMessage}>
              Send
            </MessageSendButton>
          </NewMessageContainer>
        </Section>

        <RoomInfo room={room} />
      </React.Fragment>
    );
  }
}

const withData = graphql<Response>(ChatQuery, {
  options: ({ roomId }) => ({
    variables: { roomId },
    fetchPolicy: 'cache-and-network'
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
