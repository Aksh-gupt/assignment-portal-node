const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcrypt")
const jsonwebtoken = require("jsonwebtoken")
const uniqueString = require('unique-string')


const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    department:{
        type: String,
        required: true,
        trim: true
    },
    teach:[{
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
        }
    }],
    email:{
        type: String,
        unique: true,
        required: true,
        trim: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Please enter a valid email address")
            }
        }
    },
    password:{
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value){
            if(value.toLowerCase().includes("password")){
                throw new Error("Password must not contain 'password' in it.")
            }
        }
    },
    resetId:{
        type: String,
        trim: true
    },
    tokens:[{
        token:{
            type:String,
            required: true
        }
    }]
})

userSchema.virtual('assignment',{
    ref: 'assignment',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.toJSON = function(){
    const teacher = this
    const teacherObject = teacher.toObject()

    delete teacherObject.password;
    delete teacherObject.tokens;
    delete teacherObject.resetId;

    return teacherObject
}

userSchema.methods.generateResetId = async function(){
    const teacher = this
    const resetId = uniqueString();
    // console.log(resetId);
    teacher.resetId = resetId
    await teacher.save()
    return resetId
}

userSchema.methods.generateAuthToken = async function(){
    const teacher = this
    const token = jsonwebtoken.sign({_id: teacher._id.toString()}, "this_is_jwt_token_of_teacher")
    teacher.tokens = teacher.tokens.concat({token})
    await teacher.save()
    return token
}

userSchema.statics.findByCredentials = async (email,password) => {
    const teacher = await Teacher.findOne({email})
    if(!teacher){
        throw new Error("No existing user with this email id")
    }
    const isMatch = await bcrypt.compare(password,teacher.password)
    if(!isMatch){
        throw new Error("Please check your password")
    }
    return teacher
}

userSchema.pre('save', async function(next){
    const teacher = this

    if(teacher.isModified("password")){
        teacher.password = await bcrypt.hash(teacher.password, 8);
    }
    next();
})

userSchema.pre('remove', async function(next){
    const teacher = this

    await Assignment.deleteMany({owner: teacher._id})
    next()
})

const Teacher = mongoose.model('Teacher',userSchema)

module.exports = Teacher