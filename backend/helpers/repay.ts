import {
  prepareRepayTransactions,
  TestnetReserveAddress,
  TestnetTokenPairsKey,
  TestnetTokenPairs  
} from "../src";
import { algodClient } from "../config";

export async function repayLoan(escrowAddr:string,repayAmount:number,tokenPairKey:TestnetTokenPairsKey,senderAddr:string) {
  let txns;

  const tokenPair = TestnetTokenPairs[tokenPairKey];
  const reserveAddress = TestnetReserveAddress;

  // retrieve params
  const params = await algodClient.getTransactionParams().do();

  // repay
  txns = prepareRepayTransactions(tokenPair, senderAddr, escrowAddr, reserveAddress, repayAmount, params);
  return txns
}

