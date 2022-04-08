"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendAlert = void 0;
const bull_1 = __importDefault(require("bull"));
const cron_1 = require("cron");
const sendEmail_1 = require("../helpers/sendEmail");
const getCurrentLoanInfo_1 = require("../helpers/getCurrentLoanInfo");
const UserAlert_1 = require("../models/UserAlert");
const app_1 = require("../app");
const config_1 = require("./config");
const alertsQueue = new bull_1.default("alerts", config_1.REDIS_URL);
//Consumer queue process to be performed in background
alertsQueue.process(function (job, done) {
    return __awaiter(this, void 0, void 0, function* () {
        const { recipient, title, message } = job.data;
        let sendEmailResponse = yield (0, sendEmail_1.sendEmail)(recipient, message, title);
        console.log("reached Here");
        if (sendEmailResponse.error) {
            done(new Error("Error sending alert"));
        }
        done();
        console.log("Reached here 2");
    });
});
exports.sendAlert = new cron_1.CronJob("*/25 * * * * *", function () {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const allAlerts = yield UserAlert_1.UserAlertModel.find({
                executed: false
            }).populate("User"); //get all Alerts that have not been executed
            allAlerts.forEach((anAlert) => __awaiter(this, void 0, void 0, function* () {
                let message, title, recipient;
                console.log(anAlert.user.email);
                const loanInfo = yield (0, getCurrentLoanInfo_1.getCurrentLoanInfo)(anAlert.escrowAddr, app_1.tokenPairKeys[anAlert.tokenPairIndex]);
                console.log(loanInfo);
                if (loanInfo.healthFactor / BigInt(1e14) < BigInt(anAlert.reminderHealthRatio)) {
                    message = `${app_1.tokenPairKeys[anAlert.tokenPairIndex]} has just gone below your reminder health ratio of ${anAlert.reminderHealthRatio}.
                Current health Ratio is  ${loanInfo.healthFactor}.`;
                    title = `${app_1.tokenPairKeys[anAlert.tokenPairIndex]} loan Alert!`;
                    recipient = anAlert.user.email;
                    //add to alerts Que
                    alertsQueue.add({ message, title, recipient }, {
                        attempts: 3,
                        backoff: 3000,
                    });
                    //change executed status to true
                    console.log("Reached here 3");
                    anAlert.executed = true;
                    anAlert.dateExecetued = new Date();
                    yield anAlert.save();
                    console.log("Reached here 4");
                }
            }));
            // let message, title, recipient;
            // message = "Welcome"
            // title = "Notification";
            // recipient = "olayinkaganiyu1@gmail.com";
            // alertsQueue.add(
            //     {message,title,recipient},
            //     {
            //         attempts:3,
            //         backoff:3000
            //     }
            // )
        }
        catch (error) {
            console.log(error);
        }
    });
});
