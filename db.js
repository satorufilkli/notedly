import mongoose from "mongoose";

// 设置 MongoDB 连接事件监听器
function setupEventListeners() {
  mongoose.connection.on("connected", () => {
    console.log("MongoDB connected successfully");
  });
  mongoose.connection.on("disconnected", () => {
    console.log("MongoDB disconnected");
  });
  mongoose.connection.on("error", (error) => {
    console.error("MongoDB connection error:", error);
  });
}

// 连接到 MongoDB
export async function connect(DB_HOST) {
  try {
    setupEventListeners();
    await mongoose.connect(DB_HOST);
    console.log("Database connection attempt completed");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}

// 断开 MongoDB 连接
export async function disconnect() {
  try {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  } catch (error) {
    console.error("Error closing MongoDB connection:", error);
    throw error;
  }
}
