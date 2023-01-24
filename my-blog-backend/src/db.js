import { MongoClient } from "mongodb";

let db;

const connectToDb = async (callback) => {
    const client = new MongoClient(`mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0.bb7ltfg.mongodb.net/?retryWrites=true&w=majority`);
    await client.connect();

    db = client.db("react-blog-db");
    callback();
}

export {
    db,
    connectToDb
};