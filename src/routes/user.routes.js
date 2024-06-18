import { Router } from 'express';
import { loginUser, logoutUser, registerUser, refreshAccessToken } from '../controllers/User.controller.js';
import {upload} from '../Middlewares/multer.middleware.js'
import { verifyJWT } from '../Middlewares/auth.middleware.js';


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


export default router