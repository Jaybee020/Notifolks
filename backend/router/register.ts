import express, { Router,Request,Response } from "express";
import { UserModel,UserDocument} from "../models/User";
import nodemailer from "nodemailer"
import { JwtPayload, sign,verify} from "jsonwebtoken"
import { Options, SingleKeyOptions } from "nodemailer/lib/dkim";
import { isValidAddress } from "algosdk";
const router:Router=express.Router()
export const EMAIL_SENT_FROM = "olayinkaganiyu1@gmail.com"

interface decodedToken extends JwtPayload{
    username:string,
    password:string,
    email:string
}


router.get("/",function(req:Request,res:Response){
    res.status(200).send("Welcome to register page")
})

router.post("/",async function(req:Request,res:Response){
    const accountAddr:string=req.body.accountAddr
    const email:string=req.body.email.toLowerCase()
    const password:string=req.body.password
    const mnemonic:string=req.body.mnemonic
    
    if(!isValidAddress(accountAddr)){
        res.status(400).send({
            message:"The address is not a valid address"
        })
    }
    const existingUser:UserDocument|null=await UserModel.findOne({ accountAddr: accountAddr})  
    if(existingUser?.accountAddr==accountAddr){
        return res.status(400).send({
            message:"This account already exists"
        })
    }
    else{
        UserModel.create({
            accountAddr:accountAddr,
            email:email,
            password:password,
            mnemonic_phrase:mnemonic
        },function(err,newUser:UserDocument){
            if(err){
                return res.status(400).json({
                    message:"Could not create new user"
                })
            }
            res.status(200).send({
                message:"Your account was succesfully created"
            })
        })
    }    
       
})

export const registerRoute=router