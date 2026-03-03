import {User} from '../models/user.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import jwt, { decode } from 'jsonwebtoken';

export const verifyJWT=asyncHandler(async(req,_,next)=>{

    try{
        const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
        if(!token){
            throw new ApiError(401,"Unauthorized request");
        }

        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        const userId=decodedToken?._id
;
        const user=await User.findById(userId).select(
            "-password -refreshToken"
        );
        if(!user){
            throw new ApiError(401,"Invalid token access");
        }
        req.user=user;
        next();

    }catch(err){
        throw new ApiError(401,err?.message || "Invalid acess token issue")

    }

});