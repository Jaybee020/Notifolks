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
exports.getConversionRate = exports.getOraclePrices = void 0;
const utils_1 = require("../utils");
const math_1 = require("./math");
function parseOracleValue(base64Value) {
    const value = Buffer.from(base64Value, 'base64').toString('hex');
    // first 8 bytes are the price
    const price = BigInt("0x" + value.slice(0, 16));
    // next 8 bytes are the timestamp
    const timestamp = BigInt("0x" + value.slice(16, 32));
    return { price, timestamp };
}
/**
 *
 * Returns oracle prices for given oracle and provided assets.
 *
 * @param indexerClient - Algorand indexer client to query
 * @param oracle - oracle to query
 * @param assets - assets to get prices for
 * @returns OraclePrices oracle prices
 */
function getOraclePrices(indexerClient, oracle, assets) {
    return __awaiter(this, void 0, void 0, function* () {
        const { oracle1AppId } = oracle;
        const res = yield indexerClient.lookupApplications(oracle1AppId).do();
        const state = res['application']['params']['global-state'];
        let prices = {};
        assets.forEach(assetId => {
            const base64Value = String((0, utils_1.getParsedValueFromState)(state, (0, utils_1.fromIntToBytes8Hex)(assetId), 'hex'));
            prices[assetId] = parseOracleValue(base64Value);
        });
        return { currentRound: res['current-round'], prices };
    });
}
exports.getOraclePrices = getOraclePrices;
/**
 *
 * Returns conversion rate between two prices.
 *
 * @param collateralPrice - collateral asset price
 * @param borrowPrice - borrow asset price
 * @returns ConversionRate conversion rate
 */
function getConversionRate(collateralPrice, borrowPrice) {
    return (0, math_1.calcConversionRate)(collateralPrice, borrowPrice);
}
exports.getConversionRate = getConversionRate;
