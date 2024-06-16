 import dotenv from 'dotenv'
import connectDB from './DB/DB_CONNECTION.js';
import { app } from './app.js';

 

 
 
dotenv.config({
    path:'./env'
})



connectDB()
.then(()=>{
    app.listen(process.env.PORT||4000, ()=>{
        console.log(`app is running on ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("erron in connection ", err)
})



// ( async ()=>{
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on("error",(error)=>{
//             console.log("cant connnect to db",error)
//             throw error
//         })
//         app.listen(process.env.PORT,()=>{
//             console.log(`app is running on ${process.env.PORT}`)
//         })
        
//     } catch (error) {
      
//         console.error("ERROR",error)
//         throw error
        
//     }
// })()