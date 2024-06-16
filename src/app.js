import express from 'express'
import cookieParser from 'cookie-parser';
import cors from 'cors'

 const app = express();
 const port = process.env.PORT|| 4000

 app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
 }))

 ////////////////  we use app.use for setting configuration

 app.use(express.json({limit:"20kb"}))// for getting data from form
 app.use(express.urlencoded({extended:true,limit:"20kb"}))// for getting data from url 
 app.use(express.static("public"))// for storing pdf img and other for public uses
 app.use(cookieParser())
 


// app.listen(port, ()=>{ `app is running on ${process.env.PORT}`})
 //// routes yji pe import karte ahi 

 import userRouter from "./routes/user.routes.js"


 /// route declertion

 app.use("/api/v1/users",userRouter)


 //http://localhost:8000/api/v1/users/register





  export { app }