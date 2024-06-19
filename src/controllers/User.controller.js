import asyncHandler from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import{ User} from "../models/User.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.fileupload.js"
import {ApiResponse} from '../utils/ApiResponse.js'
import jwt from 'jsonwebtoken'


/// we  making a method for generating the refresh and access token so 
 const generateAccessAndRefeshTokens = async(userId)=> {
    try {
        const user = await User.findById(userId)
        const refreshToken = user.generateRefreshToken()
        const accessToken = user.generateAccessToken()

        // now we hve a refresh token and access token so we have to send it db 
        user.refreshToken = refreshToken;
          await user.save({validateBeforeSave:false})

          return {accessToken, refreshToken}
        
    } catch (error) {
        throw new ApiError(500, " something went wrong in generating the access token")
        
    }
     
 }

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
              
              
             )
              
              
                // hum aise b bhej skte {createdUser}



               

}  )




 /// now to login user
                // we make a function called login user
            
                const loginUser = asyncHandler(async (req,res)=>{

                    // we take email and user name from the user 
                    // find the user and if the user not exist than throw error
                    // check password
                    // generate acess and refresh token 
                    // send the response in cookies
                    const {email,username,password} = req.body
                    console.log("email: ",email)
                    console.log("email: ",username)
                   
                    if (!(username ||email)) {
                        throw new ApiError(400,"enter username or email")
                        
                    }
                    // find the user in basis of usernme andemail we use mongoose user model findone and use opertor provided
                     const user = await  User.findOne({
                        $or:[{email},{username}]
                    })
                    if (!user) {
                        throw new ApiError(404,"user not found ")
                        
                    }

                    // we compare the password from a method we created in  use rmodel by help of bcrypt
                     const isPasswordvalid = await user.isPasswordCorrect(password)
                     if (!isPasswordvalid) {
                        throw new ApiError(401,"password is incorrect ")}
                        // we have to ggenerate the user token and access token after generating we have to perform futher steps

                       const {refreshToken,accessToken} = await generateAccessAndRefeshTokens(user._id)
                       
                    
                       // there is two method whixh willl be perfom i call the database and 2 update the user

                        const loggedInUser =  await User.findById(user._id).select("-password -refreshToken")

                           // we have to send it in cookies 
                           // for sending cookies we have to design some option (called objects )
                            const options = {
                              httpOnly:true,
                              secure: true
                            }
                            return res.status(201).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options)
                            .json(new ApiResponse(201,{
                              user: loggedInUser, accessToken, refreshToken
                            },"user login successfully"))

                    
                  })
                  const logoutUser = asyncHandler(async (req,res)=>{
                   await  User.findByIdAndUpdate(
                      req.user._id,
                     { 
                          $set:{ refreshToken: undefined}
                    },{
                      new: true
                    }
                    )
                    const options = {
                      httpOnly:true,
                      secure: true
                    }

                    return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(new ApiResponse(200), {}, "user logout successfully")
                    


                  })

                  const refreshAccessToken = asyncHandler(async (req,res) =>{
                    // for doing this we need to firdt get  refresh token
                    const incomingRefreshToken =  req.cookies.refreshToken || refreshAccessToken.body // for mobile user app
                     if (!incomingRefreshToken) {
                      throw new ApiError(401, "unauthorized request")
                     }
                      // we have to get raw tokken from db and verify with jwt 
                    try {
                        const decodedToken =  jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
                         const user = await User.findById(decodedToken._id)
                         if (!user) {
                          throw new ApiError(401, "invalid refresh tokkent")
                         }
                        //  comparing the tokken with frontend and the store in db
                         if (incomingRefreshToken !== user?._id) {
                          throw new ApiError(401, "expired  refresh tokkent")
                         }
  
                         // the token is exoired the we have to create the token with the method and pass the id of the user 
                          const {newRefreshToken,accessToken} = await generateAccessAndRefeshTokens(user._id)
                         const options = {
                          httpOnly: true,
                          secure : true
                         }
                          return res.status(201).cookie("accessToken",accessToken,options).cookie("newRefreshToken",newRefreshToken,options)
                          .json(201,
                            {accessToken, newRefreshToken},
                            "access token refresh sucessfully")
                    } catch (error) {
                      
                      new ApiError(401, error?.message||"invalid refresh token")
                    }
                  })

                  const changeCurrentPassword = asyncHandler(async(req,res)=>{
                    const {oldPassword, newPassword} = req.body;
                    const user = User.findById(req.user?._id)
                     const isPasswordCorrect =  await isPasswordCorrect(oldPassword)
                     if (!isPasswordCorrect) {
                      throw new ApiError(401, "invalid paasword ")
                      user.password = newPassword
                      await user.save({validateBeforeSave:false})
                      return res.status(201).json(new ApiResponse(201,{},"password change successfully"))

                      
                     }
                  })

                  const getCurrentUser = asyncHandler(async(req, res )=>{
                    return res.status(201).json(201,req.user, "current user fetch successfully")

                  })
                   const updateAccountDetails = asyncHandler(async(req,res)=>{
                    const {email, fullName} = req.body
                    if (!email||!fullName) {
                      throw new ApiError(401, "enter the user email or fullname")
                    }
                     const user = await User.findByIdAndUpdate(
                      req.user?._id,
                      {
                        $set:{
                          fullName:fullName,
                          email:email
                        }
                      },
                      {new: true}
                      )
                   }).select("-password")

                   return res.status(201).json(new ApiResponse(201, user, "account updated "))

                   const updateUserAvatar = asyncHandler(async(req,res)=>{

                     const avatarLocalPath = req.files?.path

                     if (!avatarLocalPath) {
                       throw new ApiError(401,"file upload fail")
                       
                       
                     }
                     const avatar = await uploadOnCloudinary(avatarLocalPath)

                     if (!avatar ) {
                      throw new ApiError(401,"error while uploading the avatar")
                    }

                  const user =   await User.findByIdAndUpdate(req.user?._id, 
                     { $set:{ avatar : avatar.url}},
                      {new: true }
                      ).select("-password")
                      return res.status(201).json(ApiResponse(201,user,"avatar  update successfully"))

                   })

                   const updateUserCoverImage = asyncHandler(async(req,res)=>{
                     const coverImageLocalPath = req.file?.path
                     if (!coverImageLocalPath) {
                      throw new ApiError(4001, " fail to upload cover image ")

                     }
                      const coverImage = await uploadOnCloudinary(coverImageLocalPath)

                      if (!coverImage.url) {
                        throw new ApiError(401, "unable to upload on cloudinary")
                      }
                       
                     const user =   await user.findByIdAndUpdate(req.user?._id,
                        {
                          $set:{
                            coverImage: coverImage.url
                          }
                        },
                        {new:true})
                         return res.status(201).json(ApiResponse(201,user,"cover image update successfully"))
                   })
    
                 





export { registerUser, loginUser, logoutUser, refreshAccessToken, getCurrentUser, changeCurrentPassword, updateUserAvatar, updateUserCoverImage}