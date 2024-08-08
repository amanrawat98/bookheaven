import mongoose from "mongoose";

export const dbConnection = ()=> {
  mongoose.connect(process.env.MONGO_URI).then(()=> 
  console.log('connection connected')).catch((error)=> {
    console.log(error)
  })
}