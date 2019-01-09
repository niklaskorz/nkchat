export const mongodbHost = process.env.MONGODB_HOST || '127.0.0.1';
export const natsHost = process.env.NATS_HOST || '127.0.0.1';
export const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
