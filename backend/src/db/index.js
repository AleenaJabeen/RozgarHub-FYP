import { DB_NAME } from "../constants.js";
import mongoose from "mongoose";
import {seedCategories } from "../controllers/serviceprovider/category.controller.js"

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.DATABASE_URI}/${DB_NAME}`,
    );
    console.log(
      `Mongodb connected and Host: ${connectionInstance.connection.host}`,
    );
    await seedCategories();
  } catch (err) {
    console.error("Error connection to Mongodb", err);
    process.exit(1);
  }
};

export default connectDB;
