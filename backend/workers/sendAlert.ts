import Queue from "bull";
import { CronJob } from "cron"
import { sendEmail } from "../helpers/sendEmail"
import { getCurrentLoanInfo } from "../helpers/getCurrentLoanInfo"
import { UserAlertModel } from "../models/UserAlert";
import { tokenPairKeys } from "../app";
import { REDIS_URL } from "./config";

const alertsQueue = new Queue("alerts",REDIS_URL)


//Consumer queue process to be performed in background
alertsQueue.process(async function(job,done){
    const { recipient, title, message } = job.data;

    let sendEmailResponse = await sendEmail(
        recipient,
        message,
        title
      );
        console.log("reached Here")
    if (sendEmailResponse.error) {
        done(new Error("Error sending alert"));
    }
    done();
    console.log("Reached here 2")
})


export var sendAlert=new CronJob("*/25 * * * * *",async function () {
    try {
        // const allAlerts=await UserAlertModel.find({
        //     executed:false
        // })//get all Alerts that have not been executed

        // allAlerts.forEach(async(anAlert)=>{
        //     let message, title, recipient;
        //     const loanInfo=await getCurrentLoanInfo(anAlert.escrowAddr,tokenPairKeys[anAlert.tokenPairIndex])
        //     console.log(loanInfo)
        //     if(loanInfo.healthFactor/BigInt(1e14)<BigInt(anAlert.reminderHealthRatio)){
        //         message = `${tokenPairKeys[anAlert.tokenPairIndex]} has just gone below your reminder health ratio of ${anAlert.reminderHealthRatio}.
        //         Current health Ratio is  ${loanInfo.healthFactor} USD.`;
        //         title = `${tokenPairKeys[anAlert.tokenPairIndex]} loan Alert!`;
        //         recipient = anAlert.email;

        //         //add to alerts Que
        //         alertsQueue.add(
        //             {message,title,recipient},
        //             {
        //                 attempts: 3,
        //                 backoff: 3000,
        //               }
        //         )
        //         //change executed status to true
        //         console.log("Reached here 3")
        //         anAlert.executed=true
        //         anAlert.dateExecetued=new Date()
        //         await anAlert.save()
        //         console.log("Reached here 4")
        //     }
        // })
        let message, title, recipient;
        message = "Welcome"
        title = "Notification";
        recipient = "olayinkaganiyu1@gmail.com";
        alertsQueue.add(
            {message,title,recipient},
            {
                attempts:3,
                backoff:3000
            }
        )
    } catch (error) {
        console.log(error)
    }
    


})
