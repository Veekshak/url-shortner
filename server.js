require("dotenv").config();
const mongoose = require("mongoose");

async function startConnection() {
  try {
    const db = await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.DB_NAME,
    });
    console.log("Database connection successful");
    return db;
  } catch (err) {
    console.error("Database connection error:", err);
    throw err;
  }
}

module.exports = startConnection;
