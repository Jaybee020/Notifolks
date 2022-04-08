"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParsedValueFromState = exports.fromIntToBytes8Hex = exports.unixTime = exports.transferAlgoOrAsset = exports.enc = void 0;
const algosdk_1 = require("algosdk");
const enc = new TextEncoder();
exports.enc = enc;
/**
 * Transfer algo or asset. 0 assetId indicates algo transfer, else asset transfer.
 */
function transferAlgoOrAsset(assetId, from, to, amount, params) {
    return assetId !== 0
        ? (0, algosdk_1.makeAssetTransferTxnWithSuggestedParams)(from, to, undefined, undefined, amount, undefined, assetId, params)
        : (0, algosdk_1.makePaymentTxnWithSuggestedParams)(from, to, amount, undefined, undefined, params);
}
exports.transferAlgoOrAsset = transferAlgoOrAsset;
function unixTime() {
    return Math.floor(Date.now() / 1000);
}
exports.unixTime = unixTime;
/**
 * Convert an int to its hex representation with a fixed length of 8 bytes.
 */
function fromIntToBytes8Hex(num) {
    return num.toString(16).padStart(16, '0');
}
exports.fromIntToBytes8Hex = fromIntToBytes8Hex;
function encodeToBase64(str, encoding = 'utf8') {
    return Buffer.from(str, encoding).toString('base64');
}
function getParsedValueFromState(state, key, encoding = 'utf8') {
    const encodedKey = encoding ? encodeToBase64(key, encoding) : key;
    const keyValue = state.find(entry => entry.key === encodedKey);
    if (keyValue === undefined)
        return;
    const { value } = keyValue;
    if (value.type === 1)
        return value.bytes;
    if (value.type === 2)
        return BigInt(value.uint);
    return;
}
exports.getParsedValueFromState = getParsedValueFromState;
