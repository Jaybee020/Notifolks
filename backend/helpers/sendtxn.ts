import { algodClient } from "../config";
import { waitForConfirmation } from "algosdk";

export async function sendtxn(signedTxns:Uint8Array|Uint8Array[]) {
    let txId = (await algodClient.sendRawTransaction(signedTxns).do()).txId;
    await waitForConfirmation(algodClient, txId, 1000);       
    return txId
}