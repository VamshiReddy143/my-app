import mongoose from "mongoose";

const MONGO_URI = process.env.MONGODB_URI as string; // Fallback for local DB

type DBConnectionState = 1 | 2 | 3 | 4 | 5;

const dbConnect = async (): Promise<void> => {
  // Check if already connected
  if (mongoose.connection.readyState >= 1) return; // 1 means connected, 2 means connecting

  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);

    const connectionState: DBConnectionState = mongoose.connection.readyState as DBConnectionState;

    if (connectionState === 1) {
      console.log("Successfully connected to MongoDB!");
    } else {
      console.error("Failed to establish MongoDB connection!");
    }
  } catch (error) {
    console.error("Database connection error:", error);
    throw new Error("Could not connect to MongoDB.");
  }
};

export { dbConnect };
