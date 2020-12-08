const express = require("express")
const multer = require("multer")
const router = new express.Router()
const Assignment = require("../models/assignment")
const Teacher = require("../models/teacher")
const authTeacher = require("../middleware/authTeacher")
const authStudent = require("../middleware/authStudent")


const upload = multer({
    limits: {
        fileSize: 5000000
    }
    // fileFilter(req,file,cb){
    //     if(!file.originalname.endsWith(".pdf")){
    //         throw new Error("Please upload a pdf")
    //     }

    //     cb(undefined,true)
    // }
})
// THIS IS FOR TEACHER TO MAKE OR ASSIGN THE ASSIGNMENT
var cpUpload = upload.fields([{ name: 'document', maxCount: 1 }, { name: 'overrides', maxCount: 1 }])
router.post("/assignment/make",authTeacher,cpUpload ,async (req,res) => {
    try{
        const val = JSON.parse(req.files['overrides'][0].buffer.toString())
        const assignment = new Assignment({
            document: req.files['document'][0].buffer,
            name: val.name,
            bss: val.bss,
            subid: val.subid,
            last: val.last,
            description: val.description,
            owner: req.teacher._id
        })
        // console.log(assignment)
        await assignment.save()
        res.status(201).send({_id: assignment._id, name: assignment.name})
    }catch(e){
        res.status(400).send({error: e.message})
    }
})

// THIS IS TO SEND THE PDF OF A PARTICULAR ASSIGNMENT TO STUDENT
router.get("/assignment/pdf/:id",async(req,res) => {
    try{
        const assignment = await Assignment.findOne({_id: req.params.id});
        if(!assignment){
            throw new Error("Please enter a valid url")
        }
        // res.set('Content-type', 'application/pdf')
        res.send(assignment.document)
    }catch(e){
        console.log(e);
        res.stauts(400).send(e);
    }
})

// SEND THE DETAIL OF A PARTICULAR ASSIGMENT TO STUDENT
router.get("/assignment/details/:id",authStudent, async(req,res) => {
    try{
        const details = await Assignment.findOne({_id: req.params.id});
        if(!details){
            throw new Error("Please enter a valid url")
        }
        const assignment = details.toObject();
        // REQ.STUDENT.BSS === ASSIGNMENT.BSS
        delete assignment.document;
        delete assignment.bss;
        delete assignment.subid;

        const teacherdetail = await Teacher.findOne({_id: assignment.owner});
        if(!teacherdetail){
            throw new Error("This teacher not exists")
        }
        delete assignment.owner
        const teacher = teacherdetail.toObject();
        delete teacher.email;
        delete teacher.password;
        delete teacher.resetId;
        delete teacher.tokens;
        delete teacher._id

        res.status(200).send({assignment, teacher})
    }catch(e){
        res.status(400).send(e.errmsg)
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

//  THIS IS WHEN TEACHER WANT TO SEE ALL THE ASSIGNMENT OF PARTICULAR SUBJECT
router.post("/allassignment",authTeacher ,async(req,res) => {
    try{
        const assignments = await Assignment.find({owner: req.teacher._id, subid: req.body.subid, bss: req.body.bss});
        // if(!code){
        //     res.status(404).send()
        // }
        const assign = assignments.map((assignment) => {
            const temp = assignment.toObject();
            delete temp.bss;
            delete temp.document;
            delete temp.description;
            delete temp.last;
            delete temp.subid;
            delete temp.owner;
            return temp
        })
        res.status(200).send(assign)
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
