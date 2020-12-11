const express = require("express")
const router = new express.Router()
const Student = require("../models/student")
const authStudent = require("../middleware/authStudent")
const authAdmin = require("../middleware/authAdmin")
const authTeacher = require("../middleware/authTeacher")
const Allocated = require("../models/allocatesubject")
const Assignment = require("../models/assignment")
const { resetPassword } = require('../email/account')

// CREATE student
router.post("/student/signup",authAdmin,async (req, res) => {
    const student = new Student({
        ...req.body,
        resetpassword: false
    });
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

router.post('/student/update/:id',authAdmin,async(req,res) => {
    console.log("run")
    const updates = Object.keys(req.body); 
    const allowedUpdate = ['name','email','enrollment'];
    const isValid = updates.every((update) =>  allowedUpdate.includes(update) )
    if(!isValid){
        
        return res.status(400).send("Invalid request")
    }
    try{
        
        const student = await Student.findOne({_id: req.params.id});
        if(!student){
            console.log("update");
            res.status(404).send()
        }

        updates.forEach((update) => student[update] = req.body[update])
        await student.save()
        res.send(updates)
    }catch(e){
        res.status(500).send()
    }
})

router.get("/student/enrollment/:owner",authTeacher,async(req,res) => {
    try{
        const student = await Student.findOne({_id: req.params.owner});
        if(!student){
            throw new Error("Student not found");
        }
        res.status(200).send({enrollment: student.enrollment})
    }catch(e){
        res.status(400).send(e.message);
    }
})

// THIS IS TO GET NAME AND RESET BUTTON WILL PRESENT OR NOT INFO
router.get("/student/studentinfo",authStudent ,async (req,res) => {
    try{
        // console.log(req.student.name);
        res.status(200).send({name:req.student.name, reset: req.student.resetpassword});
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

// THIS IS WHEN STUDENT CALL IT FROM FORGET PASSWORD
router.post("/student/forgotpassword", async(req,res) => {
    const email = req.body.email
    try{
        const student = await Student.findOne({email})
        if(!student){
            return res.status(400).send({error:"This email address don't exist in our database"})
        }
        const resetId = await student.generateResetId();
        // console.log("this is running")
        resetPassword(student.email,student.name,resetId,'student'); // This is to send email
        res.status(200).send({text: "check your email"});
    }catch(e){
        res.status(500).send({error: e.message})
    }
})

router.get("/student/resetpassword",authStudent,async(req,res) => {
    try{
        const resetId = await req.student.generateResetId();
        resetPassword(req.student.email,req.student.name,resetId,'student');
        res.status(200).send({text: "check your email"});
    }catch(e){
        res.status(500).send({error: e.message});
    }
})

router.post("/student/resetpass/:id",async(req,res) => {
    try{
        if(req.params.id === ""){
            throw new Error("This is invalid url");
        }
        const student = await Student.findOne({resetId: req.params.id})

        if(!student){
            return res.status(404).send({error: "This link is not valid please check your email for updated one."})
        }

        student.password = req.body.password
        student.resetId = '';
        student.resetpassword = true;
        await student.save();
        res.send({text: `${student.name} your password update successfully.`})
    }catch(e){
        res.status(500).send(e)
    }
})

module.exports = router;
