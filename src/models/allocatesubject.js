const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    bsss:{                // B => Batch,   S => Section,   S => Stream,  S => Semester
        type:Number,
        required: true
    },
    subject:{
        type: String,
        required: true
    },
    subid:{
        type:String,
        required: true,
        trim: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Teacher'
    }
})

const AllocatedSubject = mongoose.model('AllocatedSubject',userSchema)

module.exports = AllocatedSubject