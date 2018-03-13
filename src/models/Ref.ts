import { ObjectID } from 'mongodb';

type Ref<T> = ObjectID | T;

export default Ref;
