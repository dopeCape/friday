import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.configDotenv({ path: process.cwd() + "/.env.local" })
export async function connectToTestDb() {
  try {
    const dbUrl = process.env.MONGO_URI?.replace("/dev", "/test").replace("/prod", "/test") as string
    await mongoose.connect(dbUrl);
  } catch (error) {
    throw "Failed to connect to test db"
  }
}

export async function disconnectToTestDb() {
  try {
    await mongoose.disconnect()
  } catch (error) {
    throw "Failed to disconnect to test db"
  }
}

export async function clearCollection(collectionName: string) {
  try {
    await mongoose.models[collectionName].deleteMany({});
  } catch (error) {
    throw "Failed to clear collection"
  }
}

export async function purgeDb() {
  try {
    await mongoose.connection.db?.dropDatabase()
  } catch (error) {
    throw "Failed to purge collection"

  }
}
