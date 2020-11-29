const express = require("express")
const router = new express.Router()
const Admin = require("../models/admin")
const authAdmin = require("../middleware/authAdmin")
// const { sendWelcomeEmail, resetPassword } = require('../email/account')

// CREATE ADMIN
router.post("/admin/signup",async (req, res) => {
    const admin = new Admin(req.body);
    try{
        await admin.save();
        // const token = await admin.generateAuthToken();
        // sendWelcomeEmail(admin.email,admin.name)
        res.status(201).send({admin})
    }catch(e){
        res.status(400).send(e)
    }
    
})
 
// LOGIN admin
router.post("/admin/login", async(req, res) => {
    try{
        const admin = await Admin.findByCredentials(req.body.email, req.body.password);
        const token = await admin.generateAuthToken()
        res.send({admin, token});
    }catch(e){
        // console.log(e," error")
        res.status(400).send(e)
    }
})

router.get("/admin/getname",authAdmin ,async (req,res) => {
    try{
        // console.log(req.admin.name);
        res.status(200).send({name:req.admin.name});
    }catch(e){
        res.status(400).send(e);
    }
})

router.post('/admin/logout', authAdmin, async(req, res) => {
    try{
        req.admin.tokens = req.admin.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.admin.save()
        res.send(req.admin)
    }catch(e){
        res.status(500).send()
    }
})

router.delete("/admin/delete", authAdmin, async(req,res) => {
    try{
        await req.admin.remove()
        res.send(req.admin) 
    }catch(e){
        res.status(500).send()
    }
}) 

router.post("/admin/resetrequest", async(req,res) => {
    const email = req.body.email
    try{
        const admin = await Admin.findOne({email})
        if(!admin){
            return res.status(400).send({error:"This email address don't exist in our database"})
        }
        const resetId = await admin.generateResetId();
        // console.log("this is running")
        // resetPassword(admin.email,admin.name,resetId); // This is to send email
        res.status(200).send({text: "check your email"});
    }catch(e){
        res.status(500).send(e)
    }
})

router.post("/admin/resetpass/:id",async(req,res) => {
    try{
        if(req.params.id === ""){
            throw new Error("This is invalid url");
        }
        const admin = await Admin.findOne({resetId: req.params.id})

        if(!admin){
            return res.status(404).send({text: "This is invalid url"})
        }

        admin.password = req.body.password
        admin.resetId = '';
        await admin.save();
        res.send(admin)
    }catch(e){
        res.status(500).send(e)
    }
})

module.exports = router;