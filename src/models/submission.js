const mongoose = require("mongoose")


const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    bss:{
        type:Number,
        required : true
    },
    subject:{
        type: String,
        required: true
    },
    document:{
        type: Buffer,
        required: true  
    },
    description:{
        type: String
    },
    assignmentid:{
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Student'
    }
})
const Submission = mongoose.model('Submission',userSchema)

module.exports = Submission
