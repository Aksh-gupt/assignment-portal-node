const express = require("express")
const router = new express.Router()
const Subject = require("../models/subject")
const authAdmin = require("../middleware/authAdmin")
const authTeacher = require("../middleware/authTeacher")


router.post("/subject/add",authAdmin, async(req,res) => {
    const subject = new Subject(req.body)
    try{
        await subject.save();
        res.status(201).send(subject)
    }catch(e){
        res.status(400).send({code:e.code, msg:e.errmsg})
    }
})

router.get("/allsubject",async(req,res) => {
    try{
        const subject = await Subject.find({});
        res.send(subject);
    }catch(e){
        res.status(400).send(e);
    }
})

router.post('/subject/update/:id',authAdmin,async(req,res) => {
    const updates = Object.keys(req.body); 
    const allowedUpdate = ['name','code','subid','type'];
    const isValid = updates.every((update) =>  allowedUpdate.includes(update) )
    if(!isValid){
        return res.status(400).send("Invalid request")
    }

    try{
        // console.log("update");
        const subject = await Subject.findOne({_id: req.params.id});
        if(!subject){
            res.status(404).send()
        }

        updates.forEach((update) => subject[update] = req.body[update])
        await subject.save()
        res.send(updates)
    }catch(e){
        res.status(500).send()
    }
})

router.get("/subjects/name",authTeacher,async(req,res) => {
    try{
        const subjects = await Subject.find({})
        var send = subjects.map((subject) =>{
            return subject.name;
        })
        res.send(send)
    }catch(e){
        res.status(400).send(e)
    }
})

router.post("/subject/delete", authAdmin, async(req,res) => {
    try{
        console.log(req.body._id);
        const subject = await Subject.findOne({_id: req.body._id})
        await subject.remove();
        res.status(204).send(subject)
    }catch(e){
        res.status(400).send(e);
    }
})

module.exports = router