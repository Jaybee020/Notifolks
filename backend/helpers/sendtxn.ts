import { algodClient } from "../config";
import { waitForConfirmation } from "algosdk";

export async function sendtxn(signedTxns:Uint8Array|Uint8Array[]) {
    try {
        let txId = (await algodClient.sendRawTransaction(signedTxns).do()).txId;
    await waitForConfirmation(algodClient, txId, 1000);       
    return txId   
    } catch (error) {
        console.error(error)
    }
    
}