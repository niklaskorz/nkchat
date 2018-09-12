import { GraphQLScalarType, Kind, ValueNode } from 'graphql';
import { ObjectID } from 'mongodb';

export const ObjectIDScalar = new GraphQLScalarType({
  name: 'ObjectID',
  description: 'Object id scalar type',
  parseValue(value: string) {
    return ObjectID.createFromHexString(value);
  },
  parseLiteral(node: ValueNode) {
    if (node.kind !== Kind.STRING) {
      throw new Error('Cannot parse non-string as ObjectID');
    }
    return ObjectID.createFromHexString(node.value);
  },
  serialize(value: ObjectID) {
    return value.toHexString();
  },
});
