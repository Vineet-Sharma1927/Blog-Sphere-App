const mongoose = require("mongoose");
// Use process.env directly instead of importing
// const { DB_URL } = require("./dotenv.config");

async function dbConnect() {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("Db Conected successfully");
  } catch (error) {
    console.log("error aa gaya while connecting db");
    console.log(error);
  }
}

module.exports = dbConnect;
