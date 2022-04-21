import {
  prepareRepayTransactions,
  TestnetReserveAddress,
  TestnetTokenPairsKey,
  TestnetTokenPairs  
} from "../src";
import { algodClient } from "../config";
import { encodeTxn } from "./encodeTxn";



export async function repayLoan(escrowAddr:string,repayAmount:number,tokenPairKey:TestnetTokenPairsKey,senderAddr:string) {
  let txns;

  const tokenPair = TestnetTokenPairs[tokenPairKey];
  const reserveAddress = TestnetReserveAddress;

  // retrieve params
  const params = await algodClient.getTransactionParams().do();

  // repay
  try {
    txns = prepareRepayTransactions(tokenPair, senderAddr, escrowAddr, reserveAddress, repayAmount, params);
    const txnsEncoded=txns.map(encodeTxn)
    return txnsEncoded
  } catch (error) {
    console.error(error)
  }
 

  
}



