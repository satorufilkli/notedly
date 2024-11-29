import mongoose from "mongoose";

// 设置 MongoDB 状态查看器
export function checkState() {
  const state = mongoose.connection.readyState;
  switch (state) {
    case 0:
      console.log("MongoDB is disconnected");
      break;
    case 1:
      console.log("MongoDB is connected");
      break;
    case 2:
      console.log("MongoDB is connecting");
      break;
    case 3:
      console.log("MongoDB is disconnecting");
      break;
    default:
      console.log("Unknown connection state");
  }
}

// 连接到 MongoDB
export async function connect(DB_HOST) {
  try {
    await mongoose.connect(DB_HOST);
    checkState();
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}

// 断开 MongoDB 连接
export async function disconnect() {
  try {
    await mongoose.connection.close();
  } catch (error) {
    console.error("Error closing MongoDB connection:", error);
    throw error;
  }
}
