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
exports.findReceiptTxn = void 0;
const config_1 = require("../config");
function findReceiptTxn(address, txId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let response = yield config_1.indexerClient.searchForTransactions()
                .address(address)
                .txid(txId).do();
            let transacation = response['transactions'][0];
            if (transacation['asset-transfer-transaction']['receiver'] == config_1.Address && transacation['asset-transfer-transaction']['asset-id'] == 79413584) {
                return transacation.id;
            }
            else {
                return null;
            }
        }
        catch (error) {
            console.error(error);
        }
    });
}
exports.findReceiptTxn = findReceiptTxn;
// findTxn("QYEZ6NCSPFSU53WWEOROREHFBYP42FBSUSJ5ZEM3R2R5VPNUSNKDHG5JSY","P2Y6UNGMLVREYZXPO2PYBXUJOEX6HMUO5N5KG4A46BUEZ6KB2SPA")
