import express ,{ Router,Request,Response }from "express"
import { getCurrentLoanInfo } from "../helpers/getCurrentLoanInfo"
import { UserAlertModel } from "../models/UserAlert"
import { tokenPairKeys } from "../app"
import {isValidAddress,mnemonicToSecretKey,waitForConfirmation} from "algosdk";
import { takeLoan } from "../helpers/takeLoan";
import { Address } from "../config";
import { repayLoan } from "../helpers/repay";
import { getAllLoanInfo } from "../helpers/getAllLoanInfo";
import { transferAlgoOrAsset } from "../src/v1/utils";
import { algodClient } from "../config";
import {ObjectId,Types} from "mongoose"
import { authenticatetoken, Req } from "../middleware/authenticate";
import { AES } from "crypto-js";
const router=express.Router()

router.get("",async (req:Request,res:Response) => {
    res.send("Reached Here")
})

//gets Loan of Specified User
router.get("/getloan/:accountAddr",async function (req:Request,res:Response) {
    try {
        const accountAddr=req.params.accountAddr
        const AllLoanInfo=await getAllLoanInfo(accountAddr)
        return res.status(200).send({
            status:true,
            message:AllLoanInfo
        })    
    }
    catch (error) {
        return res.status(400).send({
            status:false,
            message:"Could not get loanInfo of accountAddr"
        })
    }
    
    
})

//get Alerts by account address
router.get("/loanAlert/userId/:userId",async function (req:Request,res:Response) {
    try {
        const userId=req.params.userId
        const loanInfos=await UserAlertModel.find({user:new Types.ObjectId(userId)}).populate("User")
         if(loanInfos){
                res.status(200).send({
                    status:true,
                    message:loanInfos.map((loanInfo)=>{
                    return {
                        executed:loanInfo.executed,
                        user:loanInfo.user,
                        escrowAddr:loanInfo.escrowAddr,
                        reminderHealthRatio:loanInfo.reminderHealthRatio,
                        tokenPairKeys:tokenPairKeys[loanInfo.tokenPairIndex]
                    }
                })
                })
        }else{
            res.status(400).send({
                status:false,
                message:"Alert for specified account does not exist"
            })
            }
    } catch (error) {
        console.error(error)
    }
})


//get Alerts by token
router.get("/loanAlert/tokenPairIndex/:tokenPairIndex",async function (req:Request,res:Response) {
    try {
        const tokenPairIndex=req.params.tokenPairIndex
        if(!tokenPairIndex){
            return res.status(400).send({
                status:false,
                message:"Invalid account Address given",
            })}
        const loanInfos=await UserAlertModel.find({tokenPairIndex:parseInt(tokenPairIndex)}).populate("User")
        if(loanInfos){
            res.status(200).send({
                status:true,
                message:loanInfos.map((loanInfo)=>{
                    return {
                        executed:loanInfo.executed,
                        user:loanInfo.user,
                        escrowAddr:loanInfo.escrowAddr,
                        reminderHealthRatio:loanInfo.reminderHealthRatio,
                        tokenPairKeys:tokenPairKeys[loanInfo.tokenPairIndex]
                    }
                })
            })
        }else{
            res.status(400).send({
                status:false,
                message:"Alert for specified index does not exist"
            })
            }
    } catch (error) {
        console.error(error)
    }
})
// creates a new alert document with escrow
router.post("/createloanAlert",authenticatetoken,async function (req:Req,res:Response) {
    try {
        const {escrowAddr,tokenPairIndex,reminderHealthRatio,password}=req.body
        if ( !escrowAddr || !tokenPairIndex  || !password){
            return res.status(400).send({
                status: false,
                message: "Please provide the required fields",
             });
        }   //Check whether all the fields are passed
        if(!isValidAddress(escrowAddr)){
            return res.status(400).send({
                status:false,
                message:"Invalid account Address given",
        })}
        const loanInfo=await getCurrentLoanInfo(escrowAddr,tokenPairKeys[parseInt(tokenPairIndex)])
        if(!loanInfo){
            return res.status(400).send({
                status:true,
            message:"Could not find loan"
            })
        }
        if(req.user){
            req.user.checkPassword(password,async function(err:Error,isMatch:Boolean){
            if(!isMatch){
                return res.status(401).json({
                    message:"Username and password do not match"
                })
            }
            const accountAddr=String(req.user?.accountAddr)
            const userId=new Types.ObjectId(req.user?._id)
            const bytes=AES.decrypt(String(req.user?.mnemonic_phrase),password)
            var originalmnemonic = bytes.toString(CryptoJS.enc.Utf8);
            const sender = mnemonicToSecretKey(originalmnemonic)
                 //Transaction for creating loanAlert
            try {
                const params = await algodClient.getTransactionParams().do();
                const loanCreateTxn=transferAlgoOrAsset(79413584,accountAddr,Address,1e5,params)
                const signedTxn=loanCreateTxn.signTxn(sender.sk)
                const txId = (await algodClient.sendRawTransaction(signedTxn).do()).txId;
                await waitForConfirmation(algodClient, txId, 1000);
            } catch (error) {
                return res.status(400).send({
                    status:false,
                    message:"Error in transaction occured"
                })
            }
            await UserAlertModel.create({
                user:userId,
                escrowAddr:escrowAddr,
                reminderHealthRatio:reminderHealthRatio,
                tokenPairIndex:parseInt(tokenPairIndex)})
            res.status(200).send({
                status:true,
                message:"Successful Creation of Alert"
            })

            })
        }
        
       
    } catch (error) {
        console.error(error)
        res.status(400).send({
            status:false,
            message:"Failed"
        })
    }
})

router.post('/newLoan',authenticatetoken,async function (req:Req,res:Response) {
    try {
        const {collateralAmount,borrowAmount,tokenPairIndex,password}=req.body
        if (!collateralAmount || !borrowAmount ||tokenPairIndex || !password){
            return res.status(400).send({
                status: false,
                message: "Please provide the required fields",
             });
        }
        if(req.user){
            req.user.checkPassword(password,async function(err:Error,isMatch:Boolean){
                if(!isMatch){
                    return res.status(401).json({
                        message:"Username and password do not match"
                    })
                }
                    const accountAddr=req.user?.accountAddr
                    const bytes=AES.decrypt(String(req.user?.mnemonic_phrase),password)
                    var originalmnemonic = bytes.toString(CryptoJS.enc.Utf8);
                    const key=tokenPairKeys[parseInt(tokenPairIndex as string)]
                    const escrow =await takeLoan(String(accountAddr),parseInt(collateralAmount),parseInt(borrowAmount),key,originalmnemonic)
                    return res.status(200).send({
                        status:true,
                        escrowAddr:escrow
                    })
            })
        }
    } catch (error) {
        console.error(error)
        return res.status(400).send({
            status:false,
            message:"Couldn't take a new Loan"
        })
    }
    

})


//Get loan info of specified escrowAddress and tokenPair
router.get("/currentLoanInfo/:escrowAddr/:tokenPairIndex",async function (req:Request,res:Response) {
    const escrowAddr=req.params.escrowAddr
    let tokenPairIndex=parseInt(req.params.tokenPairIndex)
    if ( !escrowAddr || !String(tokenPairIndex) ){
        return res.status(400).send({
            status: false,
            message: "Please provide the required fields",
         });
    } 
    if(!isValidAddress(escrowAddr)){
        return res.status(400).send({
            status:false,
            message:"Invalid account Address given",
        })
    }
    let tokenPairKey=tokenPairKeys[tokenPairIndex]
    try {
        console.log(Date.now())
        const loanInfo=await getCurrentLoanInfo(escrowAddr,tokenPairKey)
        console.log(Date.now())
        console.log("ReachedHere")
        return res.status(200).send({
            status:true,
            message:{
                escrowAddress:escrowAddr,
                userAddress:loanInfo.userAddress,
                borrowed:Number(loanInfo.borrowed),
                collateralBalance:Number(loanInfo.collateralBalance),
                borrowBalance:Number(loanInfo.borrowBalance),
                borrowBalanceLiquidationThreshold:Number(loanInfo.borrowBalanceLiquidationThreshold),
                healthFactor:Number(loanInfo.healthFactor)
            }
        })
    } catch (error) {
        return res.status(400).send({
            status:false,
            message:"Could not fetch loan of specified properties "
        })
    }
    
});

router.post("/repayLoan",authenticatetoken,async function (req:Req,res:Response) {
    let {escrowAddr,repayAmount,tokenPairIndex,password}=req.body
    tokenPairIndex=parseInt(tokenPairIndex)
    if ( !escrowAddr || !String(tokenPairIndex) ){
        return res.status(400).send({
            status: false,
            message: "Please provide the required fields",
         });
    } 
    if(!isValidAddress(escrowAddr)){
        return res.status(400).send({
            status:false,
            message:"Invalid account Address given",
        })
    }
    let tokenPairKey=tokenPairKeys[tokenPairIndex]
    try {
        // repay loan
        if(req.user){
            req.user.checkPassword(password,async function(err:Error,isMatch:Boolean){
                if(!isMatch){
                    return res.status(401).json({
                        message:"Username and password do not match"
                    })
                }
                //decrypt to get key
                const accountAddr=req.user?.accountAddr
                const bytes=AES.decrypt(String(req.user?.mnemonic_phrase),password)
                var originalmnemonic = bytes.toString(CryptoJS.enc.Utf8);
                const key=tokenPairKeys[parseInt(tokenPairIndex as string)]
                const repay_status=await repayLoan(escrowAddr,repayAmount,tokenPairKey,originalmnemonic)
                console.log("ReachedHere2")
                if(repay_status){
                    return res.status(200).send({
                        status:true,
                        message:"Loan repayed"
                    })
                }
            })
        }
        
    } catch (error) {
        return res.status(400).send({
            status:false,
            message:"Could not repay loan "
        })
    }
    
});


export const folksFinanceRouter=router

