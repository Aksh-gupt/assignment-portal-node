const mongoose = require("mongoose")


const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    subid:{
        type: String,
        required: true
    },
    document:{
        type: Buffer,
        required: true  
    },
    assignmentid:{
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    status:{
        type:String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Student'
    }
},{
    timestamps: {currentTime: () => Date.now()+1.98e+7}
})
const Submission = mongoose.model('Submission',userSchema)

module.exports = Submission
