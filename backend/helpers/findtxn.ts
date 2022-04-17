import { Address, indexerClient } from "../config";

export async function findReceiptTxn(address:string,txId:string){
    try {
        let response = await indexerClient.searchForTransactions()
        .address(address)
        .txid(txId).do();
        let transacation=response['transactions'][0]
        if(transacation['asset-transfer-transaction']['receiver']==Address &&transacation['asset-transfer-transaction']['asset-id']==79413584){
        return transacation.id}
        else{
            return null
        }
    } 
    catch (error) {
        console.error(error)
    }
    

}

// findTxn("QYEZ6NCSPFSU53WWEOROREHFBYP42FBSUSJ5ZEM3R2R5VPNUSNKDHG5JSY","P2Y6UNGMLVREYZXPO2PYBXUJOEX6HMUO5N5KG4A46BUEZ6KB2SPA")