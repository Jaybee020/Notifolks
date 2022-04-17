import {Schema,model,Document,Model,ObjectId,Types} from "mongoose"
import {TestnetTokenPairs, TestnetTokenPairsKey, TokenPair} from '../folks-finance-js-sdk/src'

export interface UserAlert extends Document{
    accountAddr:string,
    email:string,
    escrowAddr:string,
    tokenPairIndex:number,
    dateCreated:Date,
    reminderHealthRatio:string,
    executed:boolean,
    dateExecetued:Date,
    transactionId:string
}


interface UserAlertModel extends Model<UserAlert>{
}

const UserAlertSchema= new Schema<UserAlert>({
    accountAddr:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    escrowAddr:{
        type:String,
        required:true
    },
    tokenPairIndex:{
        type:Number,
        required:true
    },
    executed:{
        type:Boolean,
        required:true,
        default:false
    },
    reminderHealthRatio:{
        type:String,
        required:true,
    },
    dateCreated:{
        type:Date,
        default:Date.now
    },
    dateExecetued:{
        type:Date,
        required:false
    },
    transactionId:{
        type:String,
        required:true
    },
})




export const UserAlertModel= model<UserAlert,UserAlertModel>('UserAlertModel',UserAlertSchema)