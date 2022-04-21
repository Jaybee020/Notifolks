import algosdk, { Transaction } from "algosdk";

export function encodeTxn(txn:Transaction){
    const encoded=algosdk.encodeUnsignedTransaction(txn)
    //@ts-ignore
    return Array.from(encoded)
        
}