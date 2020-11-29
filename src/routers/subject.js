const express = require("express")
const router = new express.Router()
const Subject = require("../models/subject")
const authAdmin = require("../middleware/authAdmin")

router.post("/admin/addsubject",authAdmin, async(req,res) => {
    const subject = new Subject(req.body)
    try{
        await subject.save();
        res.status(201).send(subject)
    }catch(e){
        res.status(400).send(e)
    }
})

router.delete("/subject/delete", authAdmin, async(req,res) => {
    try{
        const subject = await Subject.findOne({code: req.code})
        await subject.remove();
        res.status(204).send()
    }catch(e){
        res.status(400).send(e);
    }
})

module.exports = router