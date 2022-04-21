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
const src_1 = require("../src");
const config_1 = require("../config");
const encodeTxn_1 = require("./encodeTxn");
function takeLoan(accountAddr, collateralAmount, borrowAmount, tokenPairKey) {
    return __awaiter(this, void 0, void 0, function* () {
        let txns;
        const oracle = src_1.TestnetOracle;
        console.log(tokenPairKey);
        const tokenPair = src_1.TestnetTokenPairs[tokenPairKey];
        // retrieve params
        const params = yield config_1.algodClient.getTransactionParams().do();
        // add escrow
        const addEscrowTxns = (0, src_1.prepareAddEscrowTransactions)(tokenPair, accountAddr, params);
        const escrow = addEscrowTxns.escrow;
        txns = addEscrowTxns.txns;
        const signedEscrowTxn = txns[1].signTxn(escrow.sk);
        // // borrow
        let borrow_txns = (0, src_1.prepareBorrowTransactions)(tokenPair, oracle, accountAddr, escrow.addr, collateralAmount, borrowAmount, params);
        return {
            escrowAddr: escrow.addr,
            signedEscrowTxn: Array.from(signedEscrowTxn),
            unsignedUserTxn: [(0, encodeTxn_1.encodeTxn)(txns[0]), (0, encodeTxn_1.encodeTxn)(txns[2])],
            borrowTxns: borrow_txns.map(encodeTxn_1.encodeTxn)
        };
    });
}
exports.takeLoan = takeLoan;
