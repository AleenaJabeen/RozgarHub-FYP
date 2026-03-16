// controllers/categoryController.js
import {Category} from "../../models/category.model.js"
import { CATEGORIES } from "../../data/categories.js";
import {ApiResponse }from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";

export const seedCategories = async () => {
  try {

    const count = await Category.countDocuments();

    if (count > 0) {
      console.log("Categories already exist");
      return;
    }

    const formattedCategories = CATEGORIES.map((category) => ({
      name: category.name,
      subcategory: category.subcategories.map((sub) => ({
        name: sub,
      })),
    }));

    await Category.insertMany(formattedCategories);

    console.log("Categories inserted successfully");

  } catch (error) {
    console.error(error);
  }
};


export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().lean();

    return res.status(200).json(new ApiResponse(200, categories, "Categories fetched successfully"));

  } catch (error) {
    return res.status(500).json(new ApiError(500, "Failed to fetch categories", error.message));
  }
};
