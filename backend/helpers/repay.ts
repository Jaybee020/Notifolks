import { mnemonicToSecretKey, waitForConfirmation } from "algosdk";
import {
  prepareRepayTransactions,
  TestnetReserveAddress,
  TestnetTokenPairsKey,
  TestnetTokenPairs  
} from "../src";
import { algodClient } from "../config";

export async function repayLoan(escrowAddr:string,repayAmount:number,tokenPairKey:TestnetTokenPairsKey,mnemonic:string) {
  let txns, signedTxns, txId;

  const tokenPair = TestnetTokenPairs[tokenPairKey];
  const reserveAddress = TestnetReserveAddress;

  // retrieve params
  const params = await algodClient.getTransactionParams().do();
  const sender= mnemonicToSecretKey(mnemonic)

  // repay
  txns = prepareRepayTransactions(tokenPair, sender.addr, escrowAddr, reserveAddress, repayAmount, params);
  signedTxns = txns.map(txn => txn.signTxn(sender.sk));
  txId = (await algodClient.sendRawTransaction(signedTxns).do()).txId;
  await waitForConfirmation(algodClient, txId, 1000);
  return true
}

