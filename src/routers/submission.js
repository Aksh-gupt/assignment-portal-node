const express = require("express")
const multer = require("multer")
const router = new express.Router()
const Submission = require("../models/submission")
const Assignment = require("../models/assignment")
const authStudent = require("../middleware/authStudent")
const authTeacher = require("../middleware/authTeacher")

const upload = multer({
    limits: {
        fileSize: 5000000
    }
})
var cpUpload = upload.fields([{ name: 'document', maxCount: 1 }, { name: 'overrides', maxCount: 1 }])
// TO UPLOAD ANSWER OF A ASSIGNMENT
router.post("/submission/make",authStudent,cpUpload ,async (req,res) => {
    try{
        const val = JSON.parse(req.files['overrides'][0].buffer.toString())
        const check = await Submission.findOne({assignmentid: val._id, owner: req.student._id});
        if(check){
            res.status(400).send({error: "You already submitted this assignment. If you want to change then please update it"})
            // throw new Error("")
        }
        const submission = new Submission({
            name: req.student.name,
            subid: val.subid,
            assignmentid: val._id,
            status: "Not review",
            owner: req.student._id,
            document: req.files['document'][0].buffer
        })
        await submission.save()
        res.status(201).send({status: submission.status, createdAt: submission.createdAt })
    }catch(e){
        // console.log(e.error)
        res.status(400).send(e)
    }
})

router.patch("/updatesubmission/:id",authStudent , async(req,res) => {
    const updates = Object.keys(req.body); 
    const allowedUpdate = ['document'];
    const isValid = updates.every((update) =>  allowedUpdate.includes(update) )
    if(!isValid){
        return res.status(400).send("Invalid request")
    }

    try{
        // console.log("update");
        const submission = await Submission.findOne({_id: req.params.id, owner: req.student._id});
        if(!submission){
            res.status(404).send()
        }

        updates.forEach((update) => submission[update] = req.body[update])
        await submission.save()
        res.send(submission)
    }catch(e){
        console.log("error");
        res.status(500).send()
    }
})

// FROM THIS TEACHER CAN GET SUBMISSION OF ALL THE STUDENTS OF A PARTICULAR ASSIGNMENT
router.get("/teacher/allsubmission/:subid/:assignmentid",authTeacher ,async(req,res) => {
    try{
        const submissions = await Submission.find({subid: req.params.subid, assignmentid: req.params.assignmentid});
        const submission = submissions.map((submission) => {
            const temp = submission.toObject();
            delete temp.document;
            delete temp.subid;
            delete temp.assignmentid
            return temp;
        })
        // await req.student.populate({
        //     path : "submissions"
        // }).execPopulate()
        // if(!code){
        //     res.status(404).send()
        // }
        res.send(submission)
    }catch(e){
        res.status(500).send()
    }
})

// FROM THIS STUDENT CAN GET ALL SUBMITTED ASSIGNMENT OF A PARTICULAR SUBJECT
router.get("/student/allsubmission/:subid",authStudent ,async(req,res) => {
    try{
        const submissions = await Submission.find({owner: req.student._id, subid: req.params.subid});
        const submission = submissions.map((submission) => {
            const temp = submission.toObject();
            delete temp.document;
            delete temp.name;
            delete temp.subid;
            delete temp.owner;
            delete temp._id;
            return temp;
        })
        // await req.student.populate({
        //     path : "submissions"
        // }).execPopulate()
        // if(!code){
        //     res.status(404).send()
        // }
        res.send(submission)
    }catch(e){
        res.status(500).send()
    }
})

// TEACHER REVIEW ASSIGNMENT
router.post("/teacher/reviewassignment",authTeacher,async(req,res) => {
    try{
        const assignment = await Assignment.findOne({_id: req.body.assignmentid});
        if(!assignment){
            throw new Error("This assignment is not found");
        }
        if(assignment.owner.toString() !== req.teacher._id.toString()){
            
            throw new Error("You has not authorize to change status because this is not you assignment");
        }
        const submission = await Submission.findOne({_id: req.body._id});
        if(!submission){
            throw new Error("This solution is not found")
        }
        submission.status = req.body.status;
        await submission.save();
        res.status(200).send({status:submission.status});
    }catch(e){
        res.status(400).send({error: e.message});
    }
})

router.delete("/submission/:id",authStudent ,async(req,res) => {
    try{
        // console.log("delete request")
        const submission = await Submission.findOneAndDelete({_id: req.params.id, owner: req.student._id})
        if(!submission){
            return res.status(404).send()
        }
        res.send(submission)
    }catch(e){
        res.status(500).send()
    }
})

module.exports = router