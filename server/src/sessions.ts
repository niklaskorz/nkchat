import Redis from 'ioredis';
import { ObjectID } from 'mongodb';
import { getMongoRepository } from 'typeorm';
import { redisHost } from './config';
import { SESSION_EXPIRY_SECONDS } from './constants';
import { User } from './models';

const redis = new Redis(`redis://${redisHost}`);

export const loadSession = async (id: string): Promise<User | null> => {
  const userId = await redis.get(`session:${id}`);
  if (!userId) {
    return null;
  }
  const user = await getMongoRepository(User).findOne(userId);
  if (!user) {
    return null;
  }
  await redis.expire(id, SESSION_EXPIRY_SECONDS);
  return user;
};

export const createSession = async (userId: ObjectID): Promise<string> => {
  const id = new ObjectID().toHexString();
  await redis.setex(
    `session:${id}`,
    SESSION_EXPIRY_SECONDS,
    userId.toHexString(),
  );
  return id;
};

export const removeSession = async (id: string): Promise<void> => {
  await redis.del(`session:${id}`);
};
