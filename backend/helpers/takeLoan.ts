import {
  prepareAddEscrowTransactions,
  prepareBorrowTransactions,
  TestnetOracle,
  TestnetTokenPairs,
  TestnetTokenPairsKey,
} from "../src";
import { algodClient } from "../config";
import { encodeTxn } from "./encodeTxn";


interface OutputObj{
  escrowAddr:string,
  signedEscrowTxn:number[],
  unsignedUserTxn:number[][],
  borrowTxns:number[][]

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
    let borrow_txns = prepareBorrowTransactions(tokenPair, oracle, accountAddr, escrow.addr, collateralAmount, borrowAmount, params);
    return {
      escrowAddr:escrow.addr,
      signedEscrowTxn:Array.from(signedEscrowTxn),
      unsignedUserTxn:[encodeTxn(txns[0]),encodeTxn(txns[2])],
      borrowTxns:borrow_txns.map(encodeTxn)
    }
  }