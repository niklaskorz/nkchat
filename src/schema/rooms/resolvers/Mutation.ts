import {
  InstanceType,
  Room,
  RoomModel,
  UserModel,
  UserInRoomModel,
} from '../../../models';

interface CreateRoomInput {
  name: string;
  ownerId: string;
}

interface CreateRoomPayload {
  room: InstanceType<Room>;
}

export default {
  async createRoom(
    root: any,
    { input }: { input: CreateRoomInput },
  ): Promise<CreateRoomPayload> {
    const user = await UserModel.findById(input.ownerId).exec();
    if (!user) {
      throw new Error('User not found');
    }

    const room = await RoomModel.create({
      name: input.name,
      owner: input.ownerId,
    });
    room.owner = user;

    await UserInRoomModel.create({
      user: input.ownerId,
      room: room.id,
    });

    return { room };
  },
};
