declare module 'react-sane-contenteditable' {
  export interface Props {
    className?: string;
    content?: string;
    editable?: boolean;
    maxLength?: number;
    multiLine?: boolean;
    sanitise?: boolean;
    tagName?: string;
    onChange?(event: React.FormEvent<HTMLElement>, value: string): void;
  }

  export default class ContentEditable extends React.Component<Props> {}
}
