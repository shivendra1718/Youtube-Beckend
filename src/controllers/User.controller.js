import asyncHandler from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import{ User} from "../models/User.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.fileupload.js"
import {ApiResponse} from '../utils/ApiResponse.js'

const registerUser = asyncHandler( async(req,res)=>{
    // registering the use
    // get data from fronted 
    // check for - not empty
    // check user is alredy exist :- email,username
    // check for  image, avatar
    // uplaod them to cloudinary ,avatar
    //create user object -- create entry in db
    // remove password and refresh token from response
    //check for user creation 
    // return response 

    const {fullName,email,username,password}= req.body
    console.log("email:",email)
   

    // validate that all field is fill 

    if (
         [fullName,email,username,password].some((field)=>
         field?.trim() ===""  )
       ) {
         throw new ApiError(400,"All filled is required")
         }

         // to check the user is alredy exist or not we have to contact the database for that. so we have created a model in moder there is model of user this model can conatact with the data base and find the user with email and username if it exist than it return the msg

       const existingUser =   await User.findOne(
            {
                $or:[{ email },{ username }]
            }
        )
        if (existingUser) {
            throw new ApiError(409,"user alredy register with same username or email")
            }

            // this below code is done because we inject middleware such as multer dor file uploASding and we use middleware just before  register user and upload feild just befor post
         const avatarLocalPath =    req.files?.avatar[0]?.path;
         // const coverImageLocalPath = req.files?.coverImage[0]?.path;
          console.log(" avatar file ",avatarLocalPath)

          let coverImageLocalPath;
          if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0) {
            coverImageLocalPath=req.files.coverImage[0].path
            
          }
          // avatar is exist or not  beacause it is mandatory condition
          if (!avatarLocalPath) {
            throw new ApiError(409,"uplaod avatar image")
            }

            // now the next step is to upload the file on cloudinary and aws we have created amethod to upload on cloudinart so import method from cloudinary file 
             
            const  avatar =  await uploadOnCloudinary(avatarLocalPath)
            const coverImage = await uploadOnCloudinary(coverImageLocalPath)
             if (!avatar) {
                throw new ApiError(409,"upload avataar please")
                
             }

             // now we have done with it so we have to upload it on database we have  one which talk to datat base is user method which is created in models so we use thois methods it take object
               const user = await User.create({
                email,
                username: username.toLowerCase(),
                password,
                avatar:avatar.url,
                coverImage: coverImage?.url ||"",
                fullName

              }) 
              // check user uis created or not in dtabase  and we have to remove password and refresh token form it so we ahave amethod select it has weird syntax it select kya kya chahiye or - laga
             const createdUser = await   User.findById(user._id).select(
                " -password -refreshToken"
             )
             if (!createdUser) {
                throw new ApiError(500,"something went wrong in registering the c=uder")
                
             } 
             // now  we have to send respone with help of api response 
             return res.status(201).json(
                new ApiResponse(201,createdUser,"user created succesfully")
              
              
              
              
              
                // hum aise b bhej skte {createdUser}
             )

}  )
export { registerUser}