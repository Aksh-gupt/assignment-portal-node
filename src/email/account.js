const sgmail = require('@sendgrid/mail')


sgmail.setApiKey("sendgrid_api_key");

const sendWelcomeEmail = (email,name)=>{
    sgmail.send({
        to: email,
        from:'sender_email',
        subject : '',
        text:``,
        html: ``
    })
}

const resetPassword = (email,name,_id) => {
    // console.log(email,name,_id);
    sgmail.send({
        to:email,
        from: 'sender_email',
        subject:'',
        text:``,
        html:``
    })
}


module.exports = {
    sendWelcomeEmail,
    resetPassword
}
