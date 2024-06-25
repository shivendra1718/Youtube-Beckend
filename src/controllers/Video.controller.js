//get  tittle and description and thumbnail


import{ Video} from '../models/Video.model.js'
import { ApiError  } from '../utils/ApiError.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import asyncHandler from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.fileupload.js";
import { User } from '../models/User.model.js';
import { json } from 'express';

const videoUpload =asyncHandler(async( req, res)=>{
     
    const {title, description } = req.body
    
// importing videos
    const  videoFileLocalPath = req.files?.videoFile[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
    console.log("Title:", title);
    console.log("Description:", description);
    console.log("Video file path:", videoFileLocalPath);
    console.log("Thumbnail file path:", thumbnailLocalPath);

   
    if (!videoFileLocalPath) {
        throw new ApiError(401,"video does not uploaded")
        
    }
 
    
    if (!thumbnailLocalPath) {
        throw new ApiError(401, "please upload thumbnail")
        
    } 


    const videoFile = await uploadOnCloudinary(videoFileLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    if (!videoFile) {
        throw new ApiError(401,"upload videos please")
    }
    if (!thumbnail) {
        throw new ApiError(401,"upload thumbnail please")
    }
    // console.log("videoFile", videoFile)
    // get video duration ****
    const duration= videoFile.duration
   // console.log("duration",duration)

    const video =  await Video.create({
        title: title,
        description:description,
        thumbnail:thumbnail.url,
        videoFile:videoFile.url,
        duration:duration
    })

    const uploadedVideo = await Video.findById(video._id)
    if (!uploadedVideo) {
        throw new ApiError(401," video doses not exist")
    }
    return res.status(201).json( new ApiResponse(201, video , "video uploaded successfully"))
})


// update tittle and description 
const updateVideoTittleAndDescription = asyncHandler(async(req,res)=>{
         
    let { videoId } = req.params; // Assuming videoId is passed as a parameter in the request URL
    const { newTitle , newDescription} = req.body;   // Assuming newTitle is sent in the request body

    

    if (!newTitle||!newDescription) {
        throw new ApiError(401," please enter the field to update")
        
    }




   
   
    videoId= videoId.trim()

    const p = await Video.findById(videoId)
   
 
        // Find the video by its ID and owner
        const videoUpdate = await Video.findOneAndUpdate(
            { _id:videoId },{owner:req.user?._id},
            { title: newTitle, description: newDescription },
            { new: true } // To return the updated video object
        )

        // Check if video exists
        if (!videoUpdate) {
            throw new ApiError(404, "Video not found");
        }





    // const {newTitle,newDescription} = req.body
    // console.log("title", newTitle)
    // console.log("decription", newDescription)
    // if(!newTitle|| !newDescription){
    //     throw new ApiError(401,"please enter  new title and description")
    // }
    // const video = Video.findById(req.video?._id)
    
    
   return res.status(201).json(new ApiResponse(201,videoUpdate,"updated successfully"))
   })

   /// update video thumbnail

  const updateVideoThumbnail = asyncHandler(async(req,res) =>{

    let { videoId } = req.params;
     videoId = videoId.trim()
     console.log(videoId)
     
     const newThumbnailLocalPath = req.file?.path
                     console.log(newThumbnailLocalPath)

                     if (!newThumbnailLocalPath) {
                       throw new ApiError(401,"file upload fail")  
                     }

                     const newThumbnail = await uploadOnCloudinary(newThumbnailLocalPath)

                     if (!newThumbnail ) {
                      throw new ApiError(401,"error while uploading the avatar")
                    }
      
      const videoThumbUpdate = await Video.findOneAndUpdate(
        {_id:videoId},
        {thumbnail:newThumbnail.url},
        {set:true}
      )
      console.log(videoThumbUpdate)

      return res.status(201).json(new ApiResponse(201,videoThumbUpdate,"thumbnail updated successfully"))
 })
 // search videos in term of query
 const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    const pageNumber = parseInt(page)
    const itemsPerPage = parseInt(limit)
    const skip = (pageNumber-1)*itemsPerPage

    console.log('Request parameters:', { pageNumber, itemsPerPage, query, sortBy, sortType });
     

     try {

       //  sort criteria
       const sortCriteria = {};
       sortCriteria[sortBy] = sortType === 'desc' ? -1 : 1;

       //  query criteria
       const queryCriteria = query ? { title: new RegExp(query, 'i') } : {};

       console.log('Query criteria:', queryCriteria);
       console.log('Sort criteria:', sortCriteria);
       console.log('Skip:', skip, 'Limit:', itemsPerPage);

       // Fetch videos fromdb
       const videos = await Video.find(queryCriteria)
           .sort(sortCriteria)
           .skip(skip)
           .limit(itemsPerPage);

       

       // Count total number of videos (for pagination metadata)
       const totalVideos = await Video.countDocuments(queryCriteria);

       console.log('Total videos:', totalVideos);

       

       return res.status(200).json(new ApiResponse(200, {
           videos,
           totalVideos,
           currentPage: pageNumber,
           totalPages: Math.ceil(totalVideos / itemsPerPage)
       }));


     } catch (error) {
        throw new ApiError(404, "server error cannot find the videos ")
     }

})
//  get video by id
const getVideoById = asyncHandler(async (req, res) => {
    let  { videoId } = req.params
    console.log(videoId)
    if (!videoId) {
        throw new ApiError(401, " please enter video id ")
        
    }
    videoId= videoId.trim()

    const video = await Video.findById(videoId)
    console.log(video)

    if (!video) {
         throw new ApiError(401,"please enter valid video id")
        
    }
    return res.status(201).json(new ApiResponse(201,video,"video found "))

  
})

//TODO: delete video   
const deleteVideo = asyncHandler(async (req, res) => {
    let { videoId } = req.params
     videoId= videoId.trim()

     const videoDelete = await Video.findByIdAndDelete(videoId)

     return res.status(201).json(new ApiResponse(201,videoDelete, "video deleted successfully"))
    
})
// chech video status and change with order 
const togglePublishStatus = asyncHandler(async (req, res) => {
    let  { videoId } = req.params
    const {toggleStatus} = req.body
    videoId= videoId.trim()

    if (!(toggleStatus === true|| toggleStatus ===false)) {
         throw new ApiError(401,"please enter valid input true or false ")
    }

    const video = await Video.findById(videoId)

    if (!(toggleStatus === undefined)) {
        video.isPublished = toggleStatus;
        await video.save();
    }

    return res.status(201).json(new ApiResponse(201,video, "video status"))
})



export{ videoUpload, updateVideoTittleAndDescription, updateVideoThumbnail, getAllVideos, getVideoById, deleteVideo, togglePublishStatus }