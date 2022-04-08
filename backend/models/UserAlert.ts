import {Schema,model,Document,Model,ObjectId,Types} from "mongoose"
import {TestnetTokenPairs, TestnetTokenPairsKey, TokenPair} from '../folks-finance-js-sdk/src'
import { User } from "./User"

export interface UserAlert extends Document{
    user:any,
    escrowAddr:string,
    tokenPairIndex:number,
    dateCreated:Date,
    reminderHealthRatio:string,
    executed:boolean,
    dateExecetued:Date,
}


interface UserAlertModel extends Model<UserAlert>{
}

const UserAlertSchema= new Schema<UserAlert>({
    user:{
        type:Types.ObjectId,
        ref:"User",
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
    }
})




export const UserAlertModel= model<UserAlert,UserAlertModel>('UserAlertModel',UserAlertSchema)