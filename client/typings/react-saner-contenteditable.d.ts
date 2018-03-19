declare module 'react-saner-contenteditable' {
  export interface Props {
    className?: string;
    content?: string;
    editable?: boolean;
    maxLength?: number;
    multiLine?: boolean;
    sanitise?: boolean;
    tagName?: string;
    onChange?(event: React.FormEvent<HTMLElement>, value: string): void;
    onKeyDown?(event: React.KeyboardEvent<HTMLElement>): void;
  }

  export default class ContentEditable extends React.Component<Props> {}
}
