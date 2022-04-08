import express, { Router,Request,Response, NextFunction, RequestHandler } from "express";
import { UserModel,UserDocument} from "../models/User";

export interface Req extends Request{
    token?:string,
    user?:UserDocument
}

export const authenticatetoken=function(req:Req,res:Response,next:any){
    //auth header should take the form "JWT TOKEN_VALUE"
    const authHeader=req.headers.authorization
    if(authHeader){
        const token=authHeader.split(" ")[1]
        UserModel.findByToken(token,(err:Error,user:UserDocument|null)=>{
            if(err){console.error(err)}
            if(!user){
                res.status(400).send({ auth: false, message: "Wrong Header!" })
            }else{
                req.token=token
                req.user=user
                next()
            }
    
        })
    }else{
        res.status(400).send({ auth: false, message: "Wrong Header!" })
    }
    

}