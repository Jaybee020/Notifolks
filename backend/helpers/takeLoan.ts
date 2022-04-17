import { Transaction } from "algosdk";
import {
  prepareAddEscrowTransactions,
  prepareBorrowTransactions,
  TestnetOracle,
  TestnetTokenPairs,
  TestnetTokenPairsKey,
} from "../src";
import { algodClient } from "../config";


interface OutputObj{
  escrowAddr:string,
  signedEscrowTxn:Uint8Array,
  unsignedUserTxn:Transaction[],
  borrowTxns:Transaction[]

}

export async function takeLoan(accountAddr:string,collateralAmount:number,borrowAmount:number,tokenPairKey:TestnetTokenPairsKey):Promise<OutputObj> {
    let txns;
  
    const oracle = TestnetOracle;
    console.log(tokenPairKey)
    const tokenPair = TestnetTokenPairs[tokenPairKey];
    
    // retrieve params
    const params = await algodClient.getTransactionParams().do();
  
    // add escrow
    const addEscrowTxns = prepareAddEscrowTransactions(tokenPair, accountAddr, params);
    const escrow = addEscrowTxns.escrow;
    txns = addEscrowTxns.txns;
    const signedEscrowTxn= txns[1].signTxn(escrow.sk)
     // // borrow
    txns = prepareBorrowTransactions(tokenPair, oracle, accountAddr, escrow.addr, collateralAmount, borrowAmount, params);
    return {
      escrowAddr:escrow.addr,
      signedEscrowTxn:signedEscrowTxn,
      unsignedUserTxn:[txns[0],txns[2]],
      borrowTxns:txns
    }
  }