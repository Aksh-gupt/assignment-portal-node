const express = require("express")
const router = new express.Router()
const Teacher = require("../models/teacher")
const authTeacher = require("../middleware/authTeacher")
const authAdmin = require("../middleware/authAdmin")
// const { sendWelcomeEmail, resetPassword } = require('../email/account')

// CREATE TEACHER
router.post("/teacher/signup",authAdmin,async (req, res) => {
    const teacher = new Teacher(req.body);
    try{
        await teacher.save();
        // const token = await teacher.generateAuthToken();
        // sendWelcomeEmail(teacher.email,teacher.name)
        res.status(201).send(teacher)
    }catch(e){
        res.status(400).send({code:e.code, msg:e.errmsg})
    }
    
})

// LOGIN teacher
router.post("/teacher/login", async(req, res) => {
    // console.log("run");
    try{
        const teacher = await Teacher.findByCredentials(req.body.email, req.body.password);
        const token = await teacher.generateAuthToken()
        res.send({teacher, token});
    }catch(e){
        res.status(400).send()
    }
})

router.get("/allteacher",async(req,res) => {
    try{
        const teacher = await Teacher.find({});
        res.send(teacher);
    }catch(e){
        res.status(400).send(e);
    }
})

router.get("/teacher/getname",authTeacher ,async (req,res) => {
    try{
        // console.log(req.teacher.name);
        res.status(200).send({name:req.teacher.name});
    }catch(e){
        res.status(400).send(e);
    }
})

router.post('/teacher/logout', authTeacher, async(req, res) => {
    try{
        req.teacher.tokens = req.teacher.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.teacher.save()
        res.send(req.teacher)
    }catch(e){
        res.status(500).send()
    }
})

router.delete("/teacher/delete", authTeacher, async(req,res) => {
    try{
        await req.teacher.remove()
        res.send(req.teacher) 
    }catch(e){
        res.status(500).send()
    }
}) 

router.post("/teacher/resetrequest", async(req,res) => {
    const email = req.body.email
    try{
        const teacher = await Teacher.findOne({email})
        if(!teacher){
            return res.status(400).send({error:"This email address don't exist in our database"})
        }
        const resetId = await teacher.generateResetId();
        // console.log("this is running")
        // resetPassword(teacher.email,teacher.name,resetId); // This is to send email
        res.status(200).send({text: "check your email"});
    }catch(e){
        res.status(500).send(e)
    }
})

router.post("/teacher/resetpass/:id",async(req,res) => {
    try{
        if(req.params.id === ""){
            throw new Error("This is invalid url");
        }
        const teacher = await Teacher.findOne({resetId: req.params.id})

        if(!teacher){
            return res.status(404).send({text: "This is invalid url"})
        }

        teacher.password = req.body.password
        teacher.resetId = '';
        await teacher.save();
        res.send(teacher)
    }catch(e){
        res.status(500).send(e)
    }
})

module.exports = router;
