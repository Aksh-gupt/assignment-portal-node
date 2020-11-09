const express = require("express")
const router = new express.Router()
const Student = require("../models/student")
const authStudent = require("../middleware/authStudent")
const authAdmin = require("../middleware/authAdmin")
// const { sendWelcomeEmail, resetPassword } = require('../email/account')

// CREATE student
router.post("/student/signup",authAdmin,async (req, res) => {
    const student = new Student(req.body);
    try{
        await student.save();
        // const token = await student.generateAuthToken();
        // sendWelcomeEmail(student.email,student.name)
        res.status(201).send({student})
    }catch(e){
        res.status(400).send(e)
    }
    
})

// LOGIN student
router.post("/student/login", async(req, res) => {
    // console.log("run");
    try{
        const student = await Student.findByCredentials(req.body.email, req.body.password);
        const token = await student.generateAuthToken()
        res.send({student, token});
    }catch(e){
        res.status(400).send()
    }
})

router.get("/student/getname",authStudent ,async (req,res) => {
    try{
        // console.log(req.student.name);
        res.status(200).send({name:req.student.name});
    }catch(e){
        res.status(400).send(e);
    }
})

router.post('/student/logout', authStudent, async(req, res) => {
    try{
        req.student.tokens = req.student.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.student.save()
        res.send(req.student)
    }catch(e){
        res.status(500).send()
    }
})

router.delete("/student/delete", authStudent, async(req,res) => {
    try{
        await req.student.remove()
        res.send(req.student) 
    }catch(e){
        res.status(500).send()
    }
}) 

router.post("/student/resetrequest", async(req,res) => {
    const email = req.body.email
    try{
        const student = await Student.findOne({email})
        if(!student){
            return res.status(400).send({error:"This email address don't exist in our database"})
        }
        const resetId = await student.generateResetId();
        // console.log("this is running")
        // resetPassword(student.email,student.name,resetId); // This is to send email
        res.status(200).send({text: "check your email"});
    }catch(e){
        res.status(500).send(e)
    }
})

router.post("/student/resetpass/:id",async(req,res) => {
    try{
        if(req.params.id === ""){
            throw new Error("This is invalid url");
        }
        const student = await Student.findOne({resetId: req.params.id})

        if(!student){
            return res.status(404).send({text: "This is invalid url"})
        }

        student.password = req.body.password
        student.resetId = '';
        await student.save();
        res.send(student)
    }catch(e){
        res.status(500).send(e)
    }
})

module.exports = router;