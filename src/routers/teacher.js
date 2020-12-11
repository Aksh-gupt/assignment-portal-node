const express = require("express")
const router = new express.Router()
const Teacher = require("../models/teacher")
const Subject = require("../models/subject")
const authTeacher = require("../middleware/authTeacher")
const authAdmin = require("../middleware/authAdmin")
const { resetPassword } = require('../email/account')

// CREATE TEACHER
router.post("/teacher/signup",authAdmin,async (req, res) => {
    const teacher = new Teacher({
        ...req.body,
        resetpassword: false
    });
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
        res.status(400).send(e)
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

// THIS IS TO GET NAME AND RESET BUTTON WILL PRESENT OR NOT INFO
router.get("/teacher/teacherinfo",authTeacher ,async (req,res) => {
    try{
        // console.log(req.teacher.name); 
        res.status(200).send({name:req.teacher.name, reset: req.teacher.resetpassword});
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

router.post('/teacher/update/:id',authAdmin,async(req,res) => {
    const updates = Object.keys(req.body); 
    const allowedUpdate = ['name','email','department'];
    const isValid = updates.every((update) =>  allowedUpdate.includes(update) )
    if(!isValid){
        return res.status(400).send("Invalid request")
    }

    try{
        // console.log("update");
        const teacher = await Teacher.findOne({_id: req.params.id});
        if(!teacher){
            res.status(404).send()
        }

        updates.forEach((update) => teacher[update] = req.body[update])
        await teacher.save()
        res.send()
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

router.post("/teacher/forgotpassword", async(req,res) => {
    const email = req.body.email
    try{
        const teacher = await Teacher.findOne({email})
        if(!teacher){
            return res.status(400).send({error:"This email address don't exist in our database"})
        }
        const resetId = await teacher.generateResetId();
        // console.log("this is running")
        resetPassword(teacher.email,teacher.name,resetId,'teacher'); // This is to send email
        res.status(200).send({text: "check your email"});
    }catch(e){
        res.status(500).send({error: e.message})
    }
})

router.get("/teacher/resetpassword",authTeacher,async(req,res) => {
    try{
        const resetId = await req.teacher.generateResetId();
        resetPassword(req.teacher.email,req.teacher.name,resetId,'teacher');
        res.status(200).send({text: "check your email"});
    }catch(e){
        res.status(500).send({error: e.message});
    }
})

router.post("/teacher/resetpass/:id",async(req,res) => {
    try{
        if(req.params.id === ""){
            throw new Error("This is invalid url");
        }
        const teacher = await Teacher.findOne({resetId: req.params.id})

        if(!teacher){
            return res.status(404).send({error: "This link is not valid please check your email for updated one."})
        }

        teacher.password = req.body.password
        teacher.resetId = '';
        teacher.resetpassword = true;
        await teacher.save();
        res.send({text: `${teacher.name} your password update successfully.`}) 
    }catch(e){
        res.status(500).send(e)
    }
})

module.exports = router;
