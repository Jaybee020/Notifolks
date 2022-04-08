import express, { Router,Response } from "express";
import { authenticatetoken } from "../middleware/authenticate";
import { Req } from "../middleware/authenticate";
import { UserDocument } from "../models/User";


const router:Router=express.Router()

router.post("",authenticatetoken,async(req:Req,res:Response)=>{
    req.user?.deletetoken((err:Error,user:UserDocument)=>{
        if(err){
            res.status(400).send({
                message:"Error deleting token, cannot log you out"
            })
        }
        res.status(200).send({ message: "Logging out user" });
    })
})

export const logoutRoute=router