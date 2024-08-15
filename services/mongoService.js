import { MongoClient } from "mongodb";
import {uri} from "../config/index.js"

let client;

const mongoClient = async () => {
  if (client) {
    return client;
  }
  
  client = new MongoClient(uri, { useUnifiedTopology: true });
  try {
    await client.connect();
    console.log("Connected successfully to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    client = null;
  }
  return client;
};

export default mongoClient
