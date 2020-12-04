const mongoose = require("mongoose")


const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    code:{
        type:String,
        required : true,
        unique: true
    },
    subid:{
        type: String,
        required: true,
        unique: true
    },
    type:{
        type:String,
        required: true
    }
})
const Subject = mongoose.model('Subject',userSchema)

module.exports = Subject