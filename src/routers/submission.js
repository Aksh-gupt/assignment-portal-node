const express = require("express")
const router = new express.Router()
const Submission = require("../models/submission")
const authStudent = require("../middleware/authStudent")

router.post("/submission/",authStudent ,async (req,res) => {
    const submission = new Submission({
        ...req.body,
        owner: req.student._id
    })
    
    try{
        // console.log(code);
        await submission.save()
        res.status(201).send(code)
    }catch(e){
        res.status(400).send(e)
    }
})

router.patch("/updatesubmission/:id",authStudent , async(req,res) => {
    const updates = Object.keys(req.body); 
    const allowedUpdate = ['name', 'document','description'];
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

router.get("/allsubmission",authStudent ,async(req,res) => {
    try{
        // const code = await Code.find({owner: req.user._id});
        await req.student.populate('submissions').execPopulate()
        // if(!code){
        //     res.status(404).send()
        // }
        res.send(req.student.submissions)
    }catch(e){
        res.status(500).send()
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