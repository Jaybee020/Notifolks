"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeTxn = void 0;
const algosdk_1 = __importDefault(require("algosdk"));
function encodeTxn(txn) {
    const encoded = algosdk_1.default.encodeUnsignedTransaction(txn);
    //@ts-ignore
    return Array.from(encoded);
}
exports.encodeTxn = encodeTxn;
