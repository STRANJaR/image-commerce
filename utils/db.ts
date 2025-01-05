import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!
const DB_NAME = process.env.DB_NAME

if(!MONGODB_URI) throw new Error("MONGODB_URI is not defined")
if(!DB_NAME) throw new Error("DB_NAME is not defined")

let cached = global.mongoose;
console.log(cached)

if(!cached) {
    cached = global.mongoose = {conn: null, promise: null}
}

export async function dbConnect(){
    if(cached.conn){
        return cached.conn
    }

    if(!cached.promise){
        const opts = {
            bufferCommands: true,
            maxPoolSize: 10,

        };

        cached.promise = mongoose
        .connect(`${MONGODB_URI}/${DB_NAME}`, opts)
        .then(() => mongoose.connection)

    };


    try {
        cached.conn = await cached.promise;
        console.log("DB connected")
    } catch (error) {
        console.log(error);
        cached.promise = null;
    }


    return cached.conn
}