import nodemailer from "nodemailer"

export async function sendEmail(email:string,title:string,message:string) {
    try {
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            port:465,
            auth: {
              user: String(process.env.APP_EMAIL),
              pass: String(process.env.APP_EMAIL_PASS),
            },
        });
    
        //Verify transporter connection
        transporter.verify(function (error, success) {
        if (error) {
            console.log(error);
        } else {
        }
        });
        var body_html = `<html><p>${message}</p></html>`
        var mailOptions = {
            from: String(process.env.APP_EMAIL),
            to: email,
            subject: title,
            html: body_html
        };
    
        await transporter.sendMail(mailOptions);  //Send the mail.
        return { error: false };} 
    catch (error) {
        console.error("send-email-error", error);
        return {
            error: true,
            message: "Couldn't send email",
    };
    }
    
}

 