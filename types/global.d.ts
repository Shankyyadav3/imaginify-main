import type { Mongoose } from "mongoose";

interface MongooseConnection {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
}

declare global {
    // Extend the globalThis type
    namespace NodeJS {
        interface Global {
            mongoose: MongooseConnection;
        }
    }

    var mongoose: MongooseConnection; // Add mongoose to the global object
}
