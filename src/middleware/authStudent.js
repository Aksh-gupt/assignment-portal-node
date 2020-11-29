const Student = require("../models/student")
const jwt = require("jsonwebtoken")

const auth = async (req, res, next) => {
    // console.log("auth running");
    try{
        const token = req.header('Authorization').replace('Bearer ','')
        // console.log(token);
        const decoded = jwt.verify(token,"this_is_jwt_token_of_student")
        const student = await Student.findOne({_id: decoded._id, 'tokens.token': token})
        if(!student){
            throw new Error()
        }
        req.token = token
        req.student = student
        // console.log(req.student.name);
        next()
    }catch(e){
        res.status(401).send("Please authenticate")
    }
}

module.exports = auth