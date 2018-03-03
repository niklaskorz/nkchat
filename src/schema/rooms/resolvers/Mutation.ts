import { InstanceType, Room, RoomModel } from 'models';
import Context from 'Context';
import { pubsub, SubscriptionType } from 'subscriptions';

interface CreateRoomInput {
  name: string;
}

interface UpdateRoomInput {
  roomId: string;
  name: string;
}

interface JoinRoomInput {
  roomId: string;
}

export default {
  async createRoom(
    root: any,
    { input }: { input: CreateRoomInput },
    ctx: Context,
  ): Promise<InstanceType<Room>> {
    const viewer = ctx.state.viewer;
    if (!viewer) {
      throw new Error('Authentication required');
    }

    return await RoomModel.create({
      name: input.name,
      owner: viewer.id,
      members: viewer.id,
    });
  },
  async updateRoom(
    root: any,
    { input }: { input: UpdateRoomInput },
    ctx: Context,
  ): Promise<InstanceType<Room>> {
    const viewer = ctx.state.viewer;
    if (!viewer) {
      throw new Error('Authentication required');
    }

    const room = await RoomModel.findById(input.roomId);
    if (!room) {
      throw new Error('Room could not be found');
    }
    if (room.owner !== viewer.id) {
      throw new Error("Only a room's owner can update a room");
    }

    room.name = input.name;
    await room.save();

    pubsub.publish(SubscriptionType.RoomWasUpdated, {
      roomWasUpdated: { room },
    });

    return room;
  },
  async joinRoom(
    root: any,
    { input }: { input: JoinRoomInput },
    ctx: Context,
  ): Promise<InstanceType<Room>> {
    const viewer = ctx.state.viewer;
    if (!viewer) {
      throw new Error('Authentication required');
    }

    const room = await RoomModel.findByIdAndUpdate(input.roomId, {
      $addToSet: {
        members: viewer.id,
      },
    }).exec();
    if (!room) {
      throw new Error('Room could not be found');
    }

    pubsub.publish(SubscriptionType.UserJoinedRoom, {
      userJoinedRoom: {
        roomId: room.id,
        user: viewer,
      },
    });

    return room;
  },
};
