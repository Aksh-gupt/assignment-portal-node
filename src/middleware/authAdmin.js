const Admin = require("../models/admin")
const jwt = require("jsonwebtoken")

const auth = async (req, res, next) => {
    // console.log("auth running");
    try{
        const token = req.header('Authorization').replace('Bearer ','')
        // console.log(token);
        const decoded = jwt.verify(token,"this_is_token_of_student")
        const admin = await Admin.findOne({_id: decoded._id, 'tokens.token': token})
        if(!admin){
            throw new Error()
        }
        req.token = token
        req.admin = admin
        // console.log(req.user.name);
        next()
    }catch(e){
        res.status(401).send("Please authenticate")
    }
}

module.exports = auth