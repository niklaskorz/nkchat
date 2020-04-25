import gql from 'graphql-tag';
import Linkify from 'linkifyjs/react';
import React from 'react';
import { ChildProps, compose, graphql, MutationFunc } from 'react-apollo';
import { Helmet } from 'react-helmet';
import ChatError from '../../molecules/ChatError';
import Embed, { Props as EmbedProps } from '../../molecules/Embed';
import Loading from '../../molecules/Loading';
import RoomInfo from '../../molecules/RoomInfo';
import {
  Header,
  Message,
  MessageAuthor,
  MessageDate,
  MessageHeader,
  MessageInput,
  MessageInputContainer,
  Messages,
  MessageSendButton,
  MessageText,
  MessageWrapper,
  NewMessageContainer,
  Section,
} from './styled';

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

  query ChatQuery($roomId: ObjectID!) {
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

interface ChatSubscriptionData {
  data: { messageWasSent: Message };
}

const ChatSubscription = gql`
  ${ChatMessageFragment}

  subscription ChatSubscription($roomId: ObjectID!) {
    messageWasSent(roomId: $roomId) {
      ...ChatMessage
    }
  }
`;

interface UserSubscriptionData {
  data: { userJoinedRoom: User };
}

const UserSubscription = gql`
  subscription UserSubscription($roomId: ObjectID!) {
    userJoinedRoom(roomId: $roomId) {
      id
      name
    }
  }
`;

class Chat extends React.Component<ChildProps<Props, Response>, State> {
  messageContainer?: HTMLDivElement;
  stickToBottom: boolean = true;
  unsubscribeMessages?: () => void;
  unsubscribeUsers?: () => void;

  state: State = {
    inputText: '',
  };

  componentDidMount() {
    this.stickToBottom = true;
    if (this.messageContainer) {
      this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
    }
    this.subscribeToMessages();
    this.subscribeToNewUsers();
  }

  componentWillUnmount() {
    if (this.unsubscribeMessages) {
      this.unsubscribeMessages();
      this.unsubscribeMessages = undefined;
    }
    if (this.unsubscribeUsers) {
      this.unsubscribeUsers();
      this.unsubscribeUsers = undefined;
    }
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
    if (this.props.roomId !== prevProps.roomId) {
      this.stickToBottom = true;
      if (this.messageContainer) {
        this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
      }
      if (this.unsubscribeMessages) {
        this.unsubscribeMessages();
        this.unsubscribeMessages = undefined;
      }
      if (this.unsubscribeUsers) {
        this.unsubscribeUsers();
        this.unsubscribeUsers = undefined;
      }
    }

    if (!this.unsubscribeMessages) {
      // Not subscribed currently, try to subscribe
      this.subscribeToMessages();
    }
    if (!this.unsubscribeUsers) {
      // Not subscribed currently, try to subscribe
      this.subscribeToNewUsers();
    }
  }

  refMessageContainer = (el: HTMLDivElement) => {
    this.messageContainer = el;
    if (this.messageContainer && this.stickToBottom) {
      this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
    }
  };

  subscribeToMessages() {
    const { roomId, data } = this.props;
    if (!data) {
      return;
    }

    this.unsubscribeMessages = data.subscribeToMore({
      document: ChatSubscription,
      variables: { roomId },
      updateQuery: (
        prev: Response,
        { subscriptionData }: { subscriptionData: ChatSubscriptionData },
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
            messages,
          },
        };
      },
    });
  }

  subscribeToNewUsers() {
    const { roomId, data } = this.props;
    if (!data) {
      return;
    }

    this.unsubscribeUsers = data.subscribeToMore({
      document: UserSubscription,
      variables: { roomId },
      updateQuery: (
        prev: Response,
        { subscriptionData }: { subscriptionData: UserSubscriptionData },
      ) => {
        if (!subscriptionData.data) {
          return prev;
        }

        const newUser = subscriptionData.data.userJoinedRoom;

        return {
          ...prev,
          room: {
            ...prev.room,
            members: [...prev.room.members, newUser],
          },
        };
      },
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
      return <ChatError errorMessage={error.message} />;
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
              <MessageWrapper
                key={message.id}
                viewerIsAuthor={message.viewerIsAuthor}
              >
                <Message viewerIsAuthor={message.viewerIsAuthor}>
                  <MessageHeader>
                    <MessageAuthor>{message.author.name}</MessageAuthor>
                    <MessageDate>
                      {new Date(message.createdAt).toLocaleString()}
                    </MessageDate>
                  </MessageHeader>
                  <MessageText>
                    <Linkify>{message.content}</Linkify>
                  </MessageText>
                  {message.embeds
                    .slice(0, 3) // Limit embeds to 3 per message
                    .map((embed, i) => (
                      <Embed
                        key={i}
                        type={embed.type}
                        src={embed.src}
                        onLoad={this.onEmbedLoaded}
                      />
                    ))}
                </Message>
              </MessageWrapper>
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

interface QueryVariables {
  roomId: string;
}

const withData = graphql<QueryVariables, Response, QueryVariables>(ChatQuery, {
  options: ({ roomId }) => ({
    variables: { roomId },
    // Use cache-and-network policy to ensure we get the most recent messages
    // but also start seeing the already cached messages while the new ones are
    // loading
    fetchPolicy: 'cache-and-network',
  }),
});

const withSendMessageMutation = graphql(
  gql`
    mutation SendMessage($roomId: ObjectID!, $content: String!) {
      sendMessage(input: { roomId: $roomId, content: $content }) {
        id
      }
    }
  `,
  { name: 'sendMessage' },
);

export default compose(
  withData,
  withSendMessageMutation,
)(Chat);
