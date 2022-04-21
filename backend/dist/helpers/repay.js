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
const src_1 = require("../src");
const config_1 = require("../config");
const encodeTxn_1 = require("./encodeTxn");
function repayLoan(escrowAddr, repayAmount, tokenPairKey, senderAddr) {
    return __awaiter(this, void 0, void 0, function* () {
        let txns;
        const tokenPair = src_1.TestnetTokenPairs[tokenPairKey];
        const reserveAddress = src_1.TestnetReserveAddress;
        // retrieve params
        const params = yield config_1.algodClient.getTransactionParams().do();
        // repay
        try {
            txns = (0, src_1.prepareRepayTransactions)(tokenPair, senderAddr, escrowAddr, reserveAddress, repayAmount, params);
            const txnsEncoded = txns.map(encodeTxn_1.encodeTxn);
            return txnsEncoded;
        }
        catch (error) {
            console.error(error);
        }
    });
}
exports.repayLoan = repayLoan;
