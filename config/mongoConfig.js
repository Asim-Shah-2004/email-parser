import "dotenv/config"

const dbName = "email_parser";
const collectionName = "mails";
const uri = process.env.uri;

export{
    uri,
    collectionName,
    dbName
}