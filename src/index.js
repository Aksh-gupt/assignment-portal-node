const express = require("express")
require("./db/mongoose")
const adminRouter = require("./routers/admin")
const assignmentRouter = require("./routers/assignment")
const studentRouter = require("./routers/student")
const submissionRouter = require("./routers/submission")
const teacherRouter = require("./routers/teacher")
const subjectRouter = require("./routers/subject")
const allocatedsubjectRouter = require("./routers/allocatesubject")

const app = express()
 
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', "*");
    next();
}

const port = 3000

app.use(express.json())
app.use(allowCrossDomain);
app.use(adminRouter)
app.use(subjectRouter)
app.use(assignmentRouter)
app.use(studentRouter)
app.use(submissionRouter)
app.use(teacherRouter)
app.use(allocatedsubjectRouter)

app.listen(port, () => {
    console.log("Server is up on port ",port);
})