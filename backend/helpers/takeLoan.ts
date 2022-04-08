import { waitForConfirmation,mnemonicToSecretKey } from "algosdk";
import {
  prepareAddEscrowTransactions,
  prepareBorrowTransactions,
  prepareRepayTransactions,
  TestnetOracle,
  TestnetReserveAddress,
  TestnetTokenPairs,
  TestnetTokenPairsKey,
  TokenPair,
} from "../src";
import { algodClient } from "../config";


export async function takeLoan(accountAddr:string,collateralAmount:number,borrowAmount:number,tokenPairKey:TestnetTokenPairsKey,mnemonic:string) {
    let txns, signedTxns, txId;
  
    const sender = mnemonicToSecretKey(mnemonic)
    if(accountAddr!=sender.addr){
        return "Addresses do not match"
    }

    const oracle = TestnetOracle;
    console.log(tokenPairKey)
    const tokenPair = TestnetTokenPairs[tokenPairKey];
    
    // retrieve params
    const params = await algodClient.getTransactionParams().do();
  
    // add escrow
    const addEscrowTxns = prepareAddEscrowTransactions(tokenPair, accountAddr, params);
    const escrow = addEscrowTxns.escrow;
    txns = addEscrowTxns.txns;
    signedTxns = [txns[0].signTxn(sender.sk), txns[1].signTxn(escrow.sk), txns[2].signTxn(sender.sk)];
    txId = (await algodClient.sendRawTransaction(signedTxns).do()).txId;
    await waitForConfirmation(algodClient, txId, 1000);
    console.log("Reached here")
  
    // borrow
    txns = prepareBorrowTransactions(tokenPair, oracle, accountAddr, escrow.addr, collateralAmount, borrowAmount, params);
    signedTxns = txns.map(txn => txn.signTxn(sender.sk));
    txId = (await algodClient.sendRawTransaction(signedTxns).do()).txId;
    await waitForConfirmation(algodClient, txId, 1000);
    console.log("Reached here 2")



    return escrow.addr
  
  }