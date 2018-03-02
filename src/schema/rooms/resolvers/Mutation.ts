import { InstanceType, Room, RoomModel } from 'models';
import Context from 'Context';

interface CreateRoomInput {
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
};
