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

// userSchema.virtual('submission',{
//     ref: 'submission',
//     localField: '_id',
//     foreignField: 'owner'
// })

userSchema.methods.generateAuthToken = async function(){
    const admin = this
    const token = jsonwebtoken.sign({_id: admin._id.toString()}, "this_is_jwt_token_of_admin")
    admin.tokens = user.tokens.concat({token})
    await admin.save()
    return token
}

userSchema.statics.findByCredentials = async (email,password) => {
    const admin = await Admin.findOne({email})
    if(!admin){
        throw new Error("No existing user with this email id")
    }
    const isMatch = await bcrypt.compare(password,admin.password)
    if(!isMatch){
        throw new Error("Please check your password")
    }
    return admin
}

userSchema.pre('save', async function(next){
    const admin = this

    if(admin.isModified("password")){
        admin.password = await bcrypt.hash(admin.password, 8);
    }
    next();
})

// userSchema.pre('remove', async function(next){
//     const admin = this

//     await Submission.deleteMany({owner: admin._id})
//     next()
// })

const Admin = mongoose.model('Admin',userSchema)

module.exports = Admin