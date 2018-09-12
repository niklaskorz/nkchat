import { GraphQLScalarType, Kind, ValueNode } from 'graphql';
import { ObjectID } from 'mongodb';

export const ObjectIDScalar = new GraphQLScalarType({
  name: 'ObjectID',
  description: 'Object id scalar type',
  parseValue(value: string) {
    return ObjectID.createFromHexString(value);
  },
  parseLiteral(node: ValueNode) {
    if (node.kind === Kind.STRING) {
      return ObjectID.createFromHexString(node.value);
    }
    return null;
  },
  serialize(value: ObjectID) {
    return value.toHexString();
  },
});
