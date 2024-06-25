import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'


 // Configuration
 cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});




const uploadOnCloudinary =  async(localFilePath)=> {
    try {
         if(!localFilePath) return null;
         //****upload file on cloudinary ****/

        const response=  await cloudinary.uploader.upload(localFilePath,
            {
                resource_type:'auto'
            })
            ///**file has been uploaded successfully */
                // console.log("file has been uploaded", response.url)
                 
                 // now unlink the file when it is uloaded 
                 fs.unlinkSync(localFilePath)
                 return response
        
    } catch (error) {
        fs.unlinkSync(localFilePath)//
        // remove the locally saved file which is failed to upload  or operation got failed to upload
        return null
        
    }

}


 

export {uploadOnCloudinary }