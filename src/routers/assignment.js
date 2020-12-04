const express = require("express")
const multer = require("multer")
const router = new express.Router()
const Assignment = require("../models/assignment")
const authTeacher = require("../middleware/authTeacher")


const upload = multer({
    dest: "files",
    limits: {
        fileSize: 5000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.endsWith(".pdf")){
            throw new Error("Please upload a pdf")
        }

        cb(undefined,true)
    }
})

router.post("/assignment/make",authTeacher,upload.single('document') ,async (req,res) => {
    // const assignment = new Assignment({
    //     document: req.file.buffer,
    //     name: req.body.name,
    //     bss: req.body.bss,
    //     subid: req.body.subid,
    //     last: req.body.last,
    //     description: req.body.description,
    //     owner: req.teacher._id
    // })
    
    try{
        // console.log(assignment);
        // await assignment.save()
        console.log(req.body)
        console.log(req.file)
        res.status(201).send()
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