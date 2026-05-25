import mongoose from 'mongoose';

const rawMongoUri = process.env.MONGODB_URI;
const isAtlasPlaceholder = rawMongoUri?.includes('YOUR_CLUSTER') || rawMongoUri?.includes('YOUR_USER') || rawMongoUri?.includes('YOUR_PASS');
const MONGODB_URI = !rawMongoUri || isAtlasPlaceholder
  ? 'mongodb://localhost:27017/aesthetx-ways'
  : rawMongoUri;

let cached = global._mongooseCache;
if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
