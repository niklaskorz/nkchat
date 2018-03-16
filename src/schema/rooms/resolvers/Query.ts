import { RoomModel } from '../../../models';

export default {
  room(root: any, { id }: { id: string }) {
    return RoomModel.findById(id).exec();
  },
};
