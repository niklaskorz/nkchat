import { InstanceType, Room, RoomModel } from 'models';
import Context from 'Context';

interface CreateRoomInput {
  name: string;
}

interface UpdateRoomInput {
  roomId: string;
  name: string;
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
    return await room.save();
  },
};
