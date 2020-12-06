const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcrypt")
const jsonwebtoken = require("jsonwebtoken")
const uniqueString = require('unique-string')


const userSchema = new mongoose.Schema({
    name:{
        type: String,
        trim: true,
        required: true
    },
    enrollment:{
        type:String,
        required: true,
        unique: true,
        trim: true
    },
    bss:{
        type: Number,
        required: true
    },
    // batch:{
    //     type: Number,
    //     required: true
    // },
    // stream:{
    //     type: Number,
    //     required: true
    // },
    // section:{
    //     type: Number,
    //     required: true
    // },
    email:{
        type: String,
        unique: true,
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

userSchema.virtual('submission',{
    ref: 'submission',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.toJSON = function(){
    const student = this
    const studentObject = student.toObject()

    delete studentObject.password;
    delete studentObject.tokens;
    delete studentObject.resetId;

    return studentObject
}

userSchema.methods.generateResetId = async function(){
    const student = this
    const resetId = uniqueString();
    // console.log(resetId);
    student.resetId = resetId
    await student.save()
    return resetId
}

userSchema.methods.generateAuthToken = async function(){
    const student = this
    const token = jsonwebtoken.sign({_id: student._id.toString()}, "this_is_jwt_token_of_student")
    student.tokens = student.tokens.concat({token})
    await student.save()
    return token
}

userSchema.statics.findByCredentials = async (enrollment,password) => {
    const student = await Student.findOne({enrollment})
    if(!student){
        throw new Error("No existing user with this email id")
    }
    const isMatch = await bcrypt.compare(password,student.password)
    if(!isMatch){
        throw new Error("Please check your password")
    }
    return student
}

userSchema.pre('save', async function(next){
    const student = this

    if(student.isModified("password")){
        student.password = await bcrypt.hash(student.password, 8);
    }
    next();
})

userSchema.pre('remove', async function(next){
    const student = this

    await Submission.deleteMany({owner: student._id})
    next()
})

const Student = mongoose.model('Student',userSchema)

module.exports = Student