import {ApiError} from '../utils/ApiError.js'
import asyncHandler from '../utils/asyncHandler.js'
import jwt from 'jsonwebtoken'
import {User} from "../models/User.model.js"

export const verifyJWT = asyncHandler(async(req,res, next)=>{

     try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
         if (!token) {
           throw new ApiError(401,"Unautorized request")    
         }
           const decordedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
           const user = await  User.findById(decordedToken?._id).select("-password -refreshToken")
           if (!user) {  throw new ApiError(501, "invalid accesstoken")
               
           }
   
            // now after knowing the user is exist than we have to add new obect in req we use our costume name 
             req.user= user;
             next()
   
     } catch (error) {
        throw new ApiError(401,error?.message||"invalid acces token ")
        
     }
})