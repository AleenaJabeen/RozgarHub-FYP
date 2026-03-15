import mongoose, { Schema } from "mongoose";
const categorySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  subcategory: [
    {
      name: String,
    },
  ],
});

export const Category = mongoose.model("Category", categorySchema);