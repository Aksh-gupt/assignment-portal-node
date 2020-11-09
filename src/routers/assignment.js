const express = require("express")
const router = new express.Router()
const Assignment = require("../models/assignment")
const authTeacher = require("../middleware/authTeacher")

router.post("/assignment/make",authTeacher ,async (req,res) => {
    const assignment = new Assignment({
        ...req.body,
        owner: req.teacher._id
    })
    
    try{
        // console.log(code);
        await assignment.save()
        res.status(201).send(code)
    }catch(e){
        res.status(400).send(e)
    }
})

router.patch("/updateassignment/:id",authTeacher , async(req,res) => {
    const updates = Object.keys(req.body); 
    const allowedUpdate = ['name', 'document', 'last','description'];
    const isValid = updates.every((update) =>  allowedUpdate.includes(update) )
    if(!isValid){
        return res.status(400).send("Invalid request")
    }

    try{
        // console.log("update");
        const assignment = await Assignment.findOne({_id: req.params.id, owner: req.teacher._id});
        if(!assignment){
            res.status(404).send()
        }

        updates.forEach((update) => assignment[update] = req.body[update])
        await assignment.save()
        res.send(assignment)
    }catch(e){
        console.log("error");
        res.status(500).send()
    }
})

router.get("/allassignment",authTeacher ,async(req,res) => {
    try{
        // const code = await Code.find({owner: req.user._id});
        await req.teacher.populate('assignments').execPopulate()
        // if(!code){
        //     res.status(404).send()
        // }
        res.send(req.teacher.assignments)
    }catch(e){
        res.status(500).send()
    }
})

router.delete("/assignment/:id",authTeacher ,async(req,res) => {
    try{
        // console.log("delete request")
        const assignment = await Assignment.findOneAndDelete({_id: req.params.id, owner: req.teacher._id})
        if(!assignment){
            return res.status(404).send()
        }
        res.send(assignment)
    }catch(e){
        res.status(500).send()
    }
})

module.exports = router