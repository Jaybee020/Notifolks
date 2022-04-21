import { Address, indexerClient } from "../config";

export async function findReceiptTxn(address:string,txId:string){
    try {
        let response = await indexerClient.searchForTransactions()
        .address(address)
        .txid(txId).do();
        let transacation=response['transactions'][0]
        if(transacation['asset-transfer-transaction']['receiver']==Address &&transacation['asset-transfer-transaction']['asset-id']==79413584 && transacation['asset-transfer-transaction']['amount']>=1e5){
        return transacation.sender}
        else{
            return null
        }
    } 
    catch (error) {
        console.error(error)
    }
    

}
