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
    subid:{
        type: String,
        required: true
    },
    document:{
        type: Buffer,
        required: true  
    },
    last:{
        type: Date,
        required: true  
    },
    description:{
        type: String  
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Teacher'
    }
})
const Assignment = mongoose.model('Assignment',userSchema)

module.exports = Assignment