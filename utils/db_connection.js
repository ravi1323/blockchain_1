const mongoose = require("mongoose");
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}.vp53g.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

mongoose
  .connect(uri, {
    serverSelectionTimeoutMS: 5000,
  })
  .catch((err) => console.log(err.message));
  
const connection = mongoose.connection;

connection.once("open", function () {
  console.log("Database connection established...");
});