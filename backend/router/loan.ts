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
import { sendtxn } from "../helpers/sendtxn";
import { findReceiptTxn } from "../helpers/findtxn";
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
router.get("/loanAlert/accountAddr/accountAddr",async function (req:Request,res:Response) {
    try {
        const accountAddr=req.params.accountAddr
        const loanInfos=await UserAlertModel.find({accountAddr:accountAddr})
         if(loanInfos){
                res.status(200).send({
                    status:true,
                    message:loanInfos
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



// creates a new alert document with escrow
router.post("/createloanAlertTransaction",async function (req:Request,res:Response) {
    try {
        const {escrowAddr,tokenPairIndex,accountAddr}=req.body
        if ( !escrowAddr || !tokenPairIndex  ||accountAddr){
            return res.status(400).send({
                status: false,
                message: "Please provide the required fields",
             });
        }   //Check whether all the fields are passed
        if(!isValidAddress(escrowAddr) || !isValidAddress(accountAddr)){
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
        //Transaction for creating loanAlert
        const params = await algodClient.getTransactionParams().do();
        const loanCreateTxn=transferAlgoOrAsset(79413584,accountAddr,Address,1e5,params)
        res.status(200).send({
            status:true,
            data:loanCreateTxn
        })
    } catch (error) {
        console.error(error)
        res.status(400).send({
            status:false,
            message:"Failed"
        })
    }
})

router.post("/createloanAlert",async function(req:Request,res:Response){
    const {txId,email,accountAddr,escrowAddr,reminderHealthRatio,tokenPairIndex}=req.body
    const foundAlert=await UserAlertModel.findOne({
        transactionId:txId
    })
    if(foundAlert){
        return res.status(200).send({
            status:true,
            message:"Transaaction Id has been used to create alert"
        })
    }
    let txIdSender=await findReceiptTxn(accountAddr,txId)
    if(!txIdSender){
        return res.status(400).send({
            message:"Couldn't find receipt transaction"
        })
    }
    if(txIdSender!=accountAddr){
        return res.status(400).send({
            message:"Sender address and transaction Id do not match"
        })
    }
    await UserAlertModel.create({
        accountAddr:accountAddr,
        email:email,
        escrowAddr:escrowAddr,
        reminderHealthRatio:reminderHealthRatio,
        transactionId:txId,
        tokenPairIndex:parseInt(tokenPairIndex)})
    return res.status(200).send({
        status:true,
        message:"Successful Creation of Alert"
    })

})

router.post('/newLoanTxn',async function (req:Request,res:Response) {
    try {
        const {collateralAmount,borrowAmount,tokenPairIndex,accountAddr}=req.body
        if (!collateralAmount || !borrowAmount ||tokenPairIndex ||accountAddr){
            return res.status(400).send({
                status: false,
                message: "Please provide the required fields",
             });
        }
        const key=tokenPairKeys[parseInt(tokenPairIndex as string)]
        const data =await takeLoan(String(accountAddr),parseInt(collateralAmount),parseInt(borrowAmount),key)
        return res.status(200).send({
            status:true,
            data:data
        })
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

router.post("/repayLoanTxn",async function (req:Request,res:Response){
    let {escrowAddr,repayAmount,tokenPairIndex,accountAddr}=req.body
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
    try {
        // repay loan
        const key=tokenPairKeys[parseInt(tokenPairIndex as string)]
        const repaytxn=await repayLoan(escrowAddr,repayAmount,key,accountAddr)
        console.log("ReachedHere2")
        if(repaytxn){
            return res.status(200).send({
                status:true,
                data:repaytxn,
            })
        }
    } catch (error) {
        return res.status(400).send({
            status:false,
            message:"Could not repay loan "
        })
    }
    
});


router.post("/processtxn",async function(req:Request,res:Response){
    let{txns}=req.body
    let txId=await sendtxn(txns)
    return res.status(200).send({
        txid:txId
    })
})

export const folksFinanceRouter=router

