"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.takeLoan = void 0;
const algosdk_1 = require("algosdk");
const src_1 = require("../src");
const config_1 = require("../config");
function takeLoan(accountAddr, collateralAmount, borrowAmount, tokenPairKey, mnemonic) {
    return __awaiter(this, void 0, void 0, function* () {
        let txns, signedTxns, txId;
        const sender = (0, algosdk_1.mnemonicToSecretKey)(mnemonic);
        if (accountAddr != sender.addr) {
            return "Addresses do not match";
        }
        const oracle = src_1.TestnetOracle;
        console.log(tokenPairKey);
        const tokenPair = src_1.TestnetTokenPairs[tokenPairKey];
        // retrieve params
        const params = yield config_1.algodClient.getTransactionParams().do();
        // add escrow
        const addEscrowTxns = (0, src_1.prepareAddEscrowTransactions)(tokenPair, accountAddr, params);
        const escrow = addEscrowTxns.escrow;
        txns = addEscrowTxns.txns;
        signedTxns = [txns[0].signTxn(sender.sk), txns[1].signTxn(escrow.sk), txns[2].signTxn(sender.sk)];
        txId = (yield config_1.algodClient.sendRawTransaction(signedTxns).do()).txId;
        yield (0, algosdk_1.waitForConfirmation)(config_1.algodClient, txId, 1000);
        console.log("Reached here");
        // borrow
        txns = (0, src_1.prepareBorrowTransactions)(tokenPair, oracle, accountAddr, escrow.addr, collateralAmount, borrowAmount, params);
        signedTxns = txns.map(txn => txn.signTxn(sender.sk));
        txId = (yield config_1.algodClient.sendRawTransaction(signedTxns).do()).txId;
        yield (0, algosdk_1.waitForConfirmation)(config_1.algodClient, txId, 1000);
        console.log("Reached here 2");
        return escrow.addr;
    });
}
exports.takeLoan = takeLoan;
