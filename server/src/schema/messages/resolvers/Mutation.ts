import getUrls from 'get-urls';
import { URL } from 'url';
import winston from 'winston';
import {
  InstanceType,
  Message,
  MessageModel,
  Embed,
  EmbedType,
} from '../../../models';
import Context from '../../../Context';
import { pubsub, SubscriptionType } from '../../../subscriptions';

interface SendMessageInput {
  roomId: string;
  content: string;
}

type EmbedParser = (url: URL) => Embed | null;

const embedHosts = new Map<string, EmbedParser>([
  [
    'youtube.com',
    url => {
      const videoId = url.searchParams.get('v');
      if (!videoId || url.pathname !== '/watch') {
        return null;
      }

      const embed = new Embed();
      embed.type = EmbedType.Youtube;
      embed.src = videoId;

      return embed;
    },
  ],
  [
    'youtu.be',
    url => {
      const videoId = url.pathname.slice(1);
      const embed = new Embed();
      embed.type = EmbedType.Youtube;
      embed.src = videoId;
      return embed;
    },
  ],
  [
    'alugha.com',
    url => {
      if (!url.pathname.startsWith('/videos/')) {
        return null;
      }
      const videoId = url.pathname.slice('/videos/'.length);

      const embed = new Embed();
      embed.type = EmbedType.Alugha;
      embed.src = videoId;
      return embed;
    },
  ],
]);

const imageEmbedParser: EmbedParser = url => {
  if (
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.bmp') ||
    url.pathname.endsWith('.tga')
  ) {
    const embed = new Embed();
    embed.type = EmbedType.Image;
    embed.src = url.href;
    return embed;
  }

  return null;
};

const getEmbeds = (text: string): Embed[] => {
  const embeds = [];
  for (const urlString of getUrls(text)) {
    const url = new URL(urlString);
    const parser = embedHosts.get(url.hostname);
    const embed = (parser && parser(url)) || imageEmbedParser(url);
    if (embed) {
      embeds.push(embed);
    }
  }
  return embeds;
};

export default {
  async sendMessage(
    root: any,
    { input }: { input: SendMessageInput },
    ctx: Context,
  ): Promise<InstanceType<Message>> {
    const viewer = ctx.state.viewer;
    if (!viewer) {
      throw new Error('Authentication required');
    }

    const message = await MessageModel.create({
      content: input.content,
      author: viewer.id,
      room: input.roomId,
      embeds: getEmbeds(input.content),
    });

    pubsub.publish(SubscriptionType.MessageWasSent, {
      roomId: input.roomId,
      message,
    });

    return message;
  },
};
