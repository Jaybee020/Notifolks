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
exports.repayLoan = void 0;
const algosdk_1 = require("algosdk");
const src_1 = require("../src");
const config_1 = require("../config");
function repayLoan(escrowAddr, repayAmount, tokenPairKey, mnemonic) {
    return __awaiter(this, void 0, void 0, function* () {
        let txns, signedTxns, txId;
        const tokenPair = src_1.TestnetTokenPairs[tokenPairKey];
        const reserveAddress = src_1.TestnetReserveAddress;
        // retrieve params
        const params = yield config_1.algodClient.getTransactionParams().do();
        const sender = (0, algosdk_1.mnemonicToSecretKey)(mnemonic);
        // repay
        txns = (0, src_1.prepareRepayTransactions)(tokenPair, sender.addr, escrowAddr, reserveAddress, repayAmount, params);
        signedTxns = txns.map(txn => txn.signTxn(sender.sk));
        txId = (yield config_1.algodClient.sendRawTransaction(signedTxns).do()).txId;
        yield (0, algosdk_1.waitForConfirmation)(config_1.algodClient, txId, 1000);
        return true;
    });
}
exports.repayLoan = repayLoan;
