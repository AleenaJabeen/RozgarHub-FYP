import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

export const requireServiceProvider = asyncHandler(
  async (req, res, next) => {

    if (!req.user) {
      throw new ApiError(401, "Unauthorized request");
    }

    if (req.user.role !== "serviceprovider") {
      throw new ApiError(403, "Access denied. Service providers only.");
    }

    next();
  }
);



export const requireCustomer = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized request");
  }

  if (req.user.role !== "customer") {
    throw new ApiError(403, "Access denied. Customers only.");
  }

  next(); 
});