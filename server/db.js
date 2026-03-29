import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.MONGO_URI;

async function connectDB() {
  try {
    await mongoose.connect(uri, {
      serverApi: {
        version: "1",
        strict: true,
        deprecationErrors: true,
      },
      dbName: "BackendDB0",
    });
    console.log("Connected to MongoDB");
    console.log("Successfully connected to MongoDB via Mongoose");
    mongoose.set("debug", true);
  } catch (error) {
    console.error("Could not connect to MongoDB:", error.message);
    console.log("Server starting without database connection...");
  }
}

function getDB() {
  return mongoose.connection;
}

export { connectDB, getDB };
