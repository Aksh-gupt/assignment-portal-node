const express = require("express")
const router = new express.Router()
const Allocated = require("../models/allocatesubject")
const authTeacher = require("../middleware/authTeacher")
const Subject = require("../models/subject")

router.post("/teacher/addsubject",authTeacher,async(req,res) => {
    try{
        const subject = await Subject.findOne({name: req.body.subject})
        const allocated = new Allocated({bsss: req.body.bsss, subject: req.body.subject, subid: subject.subid, owner: req.teacher._id});
        // req.teacher.teach = req.teacher.teach.concat({});
        await allocated.save();
        // var len = req.teacher.teach.length
        res.status(200).send(allocated);
    }catch(e){
        // console.log(e)
        res.status(400).send(e);
    }
})

router.get("/teacher/mysubject",authTeacher,async(req,res) => {
    try{
        const subjects = await Allocated.find({owner: req.teacher._id})
        const subject = subjects.map((sub) => {
            const temp = sub.toObject();
            delete temp.owner
            return temp
        })
        res.status(200).send(subject)
    }catch(e){
        res.status(400).send()
    }
})

module.exports = router;