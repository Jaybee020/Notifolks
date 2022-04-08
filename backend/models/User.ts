import {Schema,model,Document,Model,ObjectId,Types} from "mongoose"
import bcrypt from "bcrypt"
import { sign,verify} from "jsonwebtoken"
import { AES } from "crypto-js"

export interface User{
    accountAddr:string,
    email:string,
    password:string,
    mnemonic_phrase:string,
    date_created:Date
}

export interface UserDocument extends User,Document{
    checkPassword:(password:string,cb:Function)=>Promise<void>,
    generatetoken:(cb:Function)=>Promise<void>,
    token?:string,
    deletetoken:(cb:Function)=>Promise<void>
}

export interface UserModel extends Model<UserDocument>{
    findByToken:(token:string,cb:Function)=>Promise<void>
}

const UserSchema= new Schema<UserDocument>({
    accountAddr:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password :{
        type:String,
    },
    date_created:{
        type:Date,
        default:Date.now
    },
    token:{
        type:String
    },
    mnemonic_phrase:{
        type:String,
        required:true
    }
   
})


//hash password before saving it to db and using it to encrypt mnemonic phrase
UserSchema.pre<UserDocument>("save",function(next){
    const user=this
    if(user.isModified("password")){
        bcrypt.genSalt(10,(err,salt)=>{
            if(err){return next(err)}
            bcrypt.hash(user.password,salt,(err,hash)=>{
                if(err){return next(err)}
                user.mnemonic_phrase=AES.encrypt(user.mnemonic_phrase,user.password).toString()//encrypting with password string
                user.password=hash
                next()
            })
        })
    }
})

//compare passwords
UserSchema.methods.checkPassword=function(password:String&Buffer,cb:Function):void{
    var user=this;
    bcrypt.compare(password,user.password,function(err,isMatch){
        if(err){return cb(err)}
        console.log(isMatch)
        cb(null,isMatch)
    })
}

UserSchema.methods.generatetoken = function(cb:Function):void{
    const user=this;
    console.log(process.env.LOGIN_SECRET)
    var token =sign(user._id.toString(),String(process.env.LOGIN_SECRET))
    console.log(token)
    cb(null,token)
    
}

UserSchema.statics.findByToken=function(token:string,cb:Function):void{
    var user=this;
    try {
        const decode=verify(token,String(process.env.LOGIN_SECRET))
        user.findOne({_id:decode,token:token},function(err:Error,user:UserDocument){
            if(err){console.error(err)}
            cb(null,user)
        })
      } catch(err) {
            cb(err,null)
      }
    
    

}

UserSchema.methods.deletetoken=async function(cb:Function){
    var user=this
    user.updateOne({ $unset: { token: "1" } }, function (err:Error, user:UserDocument) {
        if (err) return cb(err);
        cb(null, user);
      });
}

export const UserModel=model<UserDocument,UserModel>('User',UserSchema)