import { InstanceType, Room, RoomModel } from 'models';
import Context from 'Context';

interface CreateRoomInput {
  name: string;
}

interface CreateRoomPayload {
  room: InstanceType<Room>;
}

export default {
  async createRoom(
    root: any,
    { input }: { input: CreateRoomInput },
    ctx: Context,
  ): Promise<CreateRoomPayload> {
    const viewer = ctx.state.viewer;
    if (!viewer) {
      throw new Error('Authentication required');
    }

    const room = await RoomModel.create({
      name: input.name,
      owner: viewer.id,
      members: viewer.id,
    });

    return { room };
  },
};
