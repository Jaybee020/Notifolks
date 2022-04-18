import express ,{ Router,Request,Response }from "express"
import { json,urlencoded } from "body-parser"
import cors from "cors"
import mongoose  from "mongoose"
import morgan from "morgan"
import * as dotenv from"dotenv"
import { TestnetTokenPairsKey } from "./src"
import { folksFinanceRouter } from "./router/loan"
import { sendAlert } from "./workers/sendAlert"

export const tokenPairKeys:TestnetTokenPairsKey[]=["ALGO-USDC" , "ALGO-USDt" , "ALGO-goBTC" , "ALGO-goETH" , "ALGO-xUSD" , "USDC-ALGO" , "USDC-USDt" , "USDC-goBTC" , "USDC-goETH" , "USDC-xUSD" , "USDt-ALGO" , "USDt-USDC" , "USDt-goBTC" , "USDt-goETH" , "USDt-xUSD" , "goBTC-ALGO" , "goBTC-USDC" , "goBTC-USDt" ,"goBTC-goETH", "goBTC-xUSD" , "goETH-ALGO", "goETH-USDC", "goETH-USDt", "goETH-goBTC" , "goETH-xUSD" , "xUSD-ALGO" ,"xUSD-USDC", "xUSD-USDt", "xUSD-goBTC", "xUSD-goETH"]
dotenv.config()
const uri = String(process.env.MONGO_CONNECTION_STRING)
const PORT:number=parseInt(process.env.PORT as string) || 8000
mongoose.connect(uri,{})
                .then(()=>{console.log('Connected to the database')})
                .catch((err)=>{console.error("Couldn'to connect to database")})
const app=express()
app.use(cors())
app.use(json())
app.use(morgan('dev'))



app.get("/",async function (req:Request,res:Response) {
    res.status(200).send({
        status:"Up and running"
    })
})

app.use("/folks",folksFinanceRouter)


app.listen(PORT,async()=>{
    sendAlert.start()
    console.log(`Listening on ${PORT}`)
})