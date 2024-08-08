import mongoose from "mongoose";
import validator from "validator";


const messageSchema = new mongoose.Schema({
  firstName: {
    type:String,
    required: true,
    minLength:[3, "First Name Should Be atleast 3 digits"]
  },
  lastName: {
    type:String,
    required: true,
    minLength:[3, "last Name Should Be atleast 3 digits"]
  },
  email: {
    type:String,
    required: true,
    validate:[validator.isEmail, "Enter valid Email"]
  },
  phone: {
    type:String,
    required:true,
    minLength:[10, "Must contain min 10 Digits"],
    maxLength:[10, "Must contain min 10 Digits"],
  },
  message: {
    type:String,
    required:true,
    minLength:[10, "Message Must have min 10 digits"],

  }
})


export const Message = mongoose.model('Message',messageSchema);