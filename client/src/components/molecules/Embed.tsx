import React from 'react';
import styled from 'react-emotion';

const IframeContainer = styled('div')`
  position: relative;
  height: 0;
  padding-bottom: 56.25%;
  width: 800px;
  max-width: 100%;
  margin-top: 20px;
`;

const Iframe = styled('iframe')`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
`;

const Image = styled('img')`
  display: block;
  max-width: 800px;
  max-height: 600px;
  width: auto;
  height: auto;
  margin-top: 20px;
`;

enum EmbedType {
  Youtube = 'YOUTUBE',
  Alugha = 'ALUGHA',
  Image = 'IMAGE'
}

export interface Props {
  type: EmbedType;
  src: string;
}

export default class Embed extends React.Component<Props> {
  render() {
    const { type, src } = this.props;
    switch (type) {
      case EmbedType.Alugha:
        return (
          <IframeContainer>
            <Iframe
              allowFullScreen
              src={`https://alugha.com/embed/web-player?v=${src}`}
            />
          </IframeContainer>
        );
      case EmbedType.Youtube:
        return (
          <IframeContainer>
            <Iframe
              allowFullScreen
              src={`https://www.youtube.com/embed/${src}`}
            />
          </IframeContainer>
        );
      case EmbedType.Image:
        return <Image src={src} alt="Embedded image" />;
      default:
        return null;
    }
  }
}
