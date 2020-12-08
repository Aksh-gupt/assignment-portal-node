const express = require("express")
const router = new express.Router()
const Student = require("../models/student")
const authStudent = require("../middleware/authStudent")
const authAdmin = require("../middleware/authAdmin")
const Allocated = require("../models/allocatesubject")
const Assignment = require("../models/assignment")
// const { sendWelcomeEmail, resetPassword } = require('../email/account')

// CREATE student
router.post("/student/signup",authAdmin,async (req, res) => {
    const student = new Student(req.body);
    try{
        await student.save();
        // const token = await student.generateAuthToken();
        // sendWelcomeEmail(student.email,student.name)
        res.status(201).send(student)
    }catch(e){
        // console.log(e);
        res.status(400).send({code:e.code, msg:e.errmsg})
    }
})

// LOGIN student
router.post("/student/login", async(req, res) => {
    // console.log("run"); 
    try{
        const student = await Student.findByCredentials(req.body.email, req.body.password);
        const token = await student.generateAuthToken()
        // console.log(token);
        res.send({student, token});
    }catch(e){
        res.status(400).send()
    }
})

router.get("/allstudent",authAdmin,async(req,res) => {
    try{
        const student = await Student.find({});
        res.send(student)
    }catch(e){
        res.status(400).send()
    }
})

router.get("/student/subjects",authStudent, async(req,res) => {
    try{
        const year = (new Date().getFullYear())%100;
        const month = new Date().getMonth();
        var batch = Math.floor(req.student.bss/100);
        var sem = year - batch;
        sem *= 2;
        if(month >= 7){
            sem++;
        }
        var bsss = req.student.bss*10 + sem;
        const subjects = await Allocated.find({bsss})
        const subject = subjects.map((subject) => {
            const temp = subject.toObject();
            delete temp.owner
            return temp;
        })
        res.status(200).send(subject)
    }catch(e){
        res.status(400).send(e)
    }
})

router.post("/student/subject/assignment",authStudent, async(req,res) => {
    try{
        const assignments = await Assignment.find({bss: req.body.bss, subid: req.body.subid})
        const assignment = assignments.map((assignment) => {
            const temp = assignment.toObject();
            delete temp.document
            delete temp.subid
            delete temp.bss
            delete temp.owner
            delete temp.description
            delete temp.last
            return temp
        })
        res.status(200).send(assignment)
    }catch(e){
        res.status(400).send(e)
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
