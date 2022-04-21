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
exports.sendtxn = void 0;
const config_1 = require("../config");
const algosdk_1 = require("algosdk");
function sendtxn(signedTxns) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let txId = (yield config_1.algodClient.sendRawTransaction(signedTxns).do()).txId;
            yield (0, algosdk_1.waitForConfirmation)(config_1.algodClient, txId, 1000);
            return txId;
        }
        catch (error) {
            console.error(error);
        }
    });
}
exports.sendtxn = sendtxn;
