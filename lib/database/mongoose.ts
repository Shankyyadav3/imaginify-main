import mongoose, { Mongoose } from "mongoose";

const MONGODB_URL = process.env.MONGOOSE_URL;

interface MongooseConnection {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
}

// Ensure proper type safety for global.mongoose
const cached: MongooseConnection = global.mongoose || {
    conn: null,
    promise: null,
};

export const connectToDatabase = async (): Promise<Mongoose> => {
    if (cached.conn) return cached.conn;

    if (!MONGODB_URL) {
        throw new Error("Missing MONGODB_URL. Please set it in your environment variables.");
    }

    cached.promise =
        cached.promise ||
        mongoose.connect(MONGODB_URL, {
            dbName: "imaginify",
            bufferCommands: false,
        }) as Promise<Mongoose>;

    cached.conn = await cached.promise;
    global.mongoose = cached; // Assign to the global object
    return cached.conn;
};
