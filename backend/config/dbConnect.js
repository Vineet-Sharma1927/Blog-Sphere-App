const mongoose = require("mongoose");
// Use process.env directly instead of importing
// const { DB_URL } = require("./dotenv.config");

async function dbConnect() {
  try {
    await mongoose.connect(process.env.DB_URL, {
      // Add connection options to handle timeout issues
      serverSelectionTimeoutMS: 30000, // Timeout after 30 seconds instead of 10
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      maxPoolSize: 10, // Maintain up to 10 socket connections
    });
    console.log("Db Connected successfully");
  } catch (error) {
    console.log("error connecting to MongoDB:", error.message);
    // If the error is a timeout, provide a clearer error message
    if (error.name === 'MongooseServerSelectionError') {
      console.log("MongoDB connection timeout. Please check your connection string and network settings.");
    }
    console.log(error);
  }
}

module.exports = dbConnect;
