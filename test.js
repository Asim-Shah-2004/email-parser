import { gemini,mongoClient } from "./services/index.js";
import {collectionName,dbName} from "./config/mongoConfig.js"
import testData from "./temporary/testData.js";

async function test() {
    const client = await mongoClient()
    const database = client.db(dbName);
    const collection = database.collection(collectionName);

    const response = await gemini(testData)
    const data = JSON.parse(response)
    
    await collection.insertOne(data);

    console.log("Data inserted successfully!!!");
    
}

test().catch(console.error);