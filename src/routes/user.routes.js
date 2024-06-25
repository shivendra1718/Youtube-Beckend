import { Router } from 'express';
import { loginUser, logoutUser, registerUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getWatchedHistory } from '../controllers/User.controller.js';
import {upload} from '../Middlewares/multer.middleware.js'
import { verifyJWT } from '../Middlewares/auth.middleware.js';
import {videoUpload, updateVideoTittleAndDescription, updateVideoThumbnail, getAllVideos,getVideoById, deleteVideo , togglePublishStatus} from '../controllers/Video.controller.js'


const router = Router();

router.route("/register").post(


    upload.fields([
        {
             name:"avatar",
            maxCount:1
    
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    
    
    
    registerUser
    
    )

    router.route("/login").post(loginUser)

    // secure routes 
    router.route("/logout").post(verifyJWT,logoutUser)
    router.route("/refresh-token").post(refreshAccessToken)

    router.route("/change-password").post(verifyJWT, changeCurrentPassword)
    router.route("/current-user").get(verifyJWT, getCurrentUser)
    router.route("/update-account").patch(verifyJWT, updateAccountDetails)
    router.route("/avatar").patch(verifyJWT, upload.single('avatarr'), updateUserAvatar)
    router.route("/cover-image").patch(verifyJWT,upload.single("coverImage"), updateUserCoverImage)

    router.route("/c/:username").get(verifyJWT,getUserChannelProfile)
    router.route("/history").get(verifyJWT,getWatchedHistory)

    // videos route
    router.route("/video-upload").post(verifyJWT,
        
        upload.fields([
            {
                 name:"videoFile",
                maxCount:1
        
            },
            {
                name:"thumbnail",
                maxCount:1
            }
        ]),

        videoUpload)
        // video title and des update and thumb
        router.route("/video-update/:videoId").patch(verifyJWT, upload.single('newThumbnail'),  updateVideoTittleAndDescription)
        // video thumbnail update
        router.route("/video-thumbnail-update/:videoId").patch(verifyJWT, upload.single('newThumbnail'), updateVideoThumbnail)
        // fetch paginated videos 
         router.route("/get-videos").get( verifyJWT,getAllVideos)
         // getVideoById
         router.route("/videoid/:videoId").patch(getVideoById)
         // get video by id and delete 
         router.route("/video-delete/:videoId").patch(deleteVideo)
         // get video by id and update toggle status
         router.route("/video-status/:videoId").patch(togglePublishStatus)




export default router