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
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
function sendEmail(email, title, message) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let transporter = nodemailer_1.default.createTransport({
                service: 'gmail',
                port: 465,
                auth: {
                    user: String(process.env.APP_EMAIL),
                    pass: String(process.env.APP_EMAIL_PASS),
                },
            });
            //Verify transporter connection
            transporter.verify(function (error, success) {
                if (error) {
                    console.log(error);
                }
                else {
                }
            });
            var body_html = `<html><p>${message}</p></html>`;
            var mailOptions = {
                from: String(process.env.APP_EMAIL),
                to: email,
                subject: title,
                html: body_html
            };
            yield transporter.sendMail(mailOptions); //Send the mail.
            return { error: false };
        }
        catch (error) {
            console.error("send-email-error", error);
            return {
                error: true,
                message: "Couldn't send email",
            };
        }
    });
}
exports.sendEmail = sendEmail;
