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
exports.getEscrows = exports.loanInfo = void 0;
const algosdk_1 = require("algosdk");
const utils_1 = require("../utils");
const math_1 = require("./math");
/**
 *
 * Derives loan info from escrow account.
 *
 * @param escrow - escrow account with structure https://developer.algorand.org/docs/rest-apis/indexer/#account
 * @param tokenPair - token pair of the loan
 * @param tokenPairInfo - token pair info
 * @param collateralPoolInfo - collateral pool info
 * @param borrowPoolInfo - borrow pool info
 * @param conversionRate - conversion rate from collateral to borrow asset
 * @param currentRound - results for specified round
 * @returns LoanInfo loan info
 */
function loanInfo(escrow, tokenPair, tokenPairInfo, collateralPoolInfo, borrowPoolInfo, conversionRate, currentRound) {
    var _a, _b, _c, _d;
    const escrowAddr = escrow.address;
    const { appId, collateralPool } = tokenPair;
    const { liquidationThreshold } = tokenPairInfo;
    const { depositInterestIndex } = collateralPoolInfo;
    const { borrowInterestIndex } = borrowPoolInfo;
    const { rate, decimals } = conversionRate;
    // escrow balance
    const collateralBalance = (_b = (_a = escrow['assets']) === null || _a === void 0 ? void 0 : _a.find((asset) => asset['asset-id'] === collateralPool.fAssetId)) === null || _b === void 0 ? void 0 : _b['amount'];
    if (collateralBalance === undefined)
        throw new Error("Unable to get escrow: " + escrowAddr + " collateral balance.");
    // escrow local state
    const state = (_d = (_c = escrow['apps-local-state']) === null || _c === void 0 ? void 0 : _c.find((app) => app.id === appId)) === null || _d === void 0 ? void 0 : _d['key-value'];
    if (state === undefined)
        throw new Error("Unable to find escrow: " + escrowAddr + " for token pair " + appId + ".");
    if ((0, utils_1.getParsedValueFromState)(state, 'borrowed') === undefined)
        throw new Error("No loan for escrow: " + escrowAddr + " for token pair " + appId + ".");
    const ua = String((0, utils_1.getParsedValueFromState)(state, 'user_address'));
    const borrowed = BigInt((0, utils_1.getParsedValueFromState)(state, 'borrowed') || 0);
    const bb = BigInt((0, utils_1.getParsedValueFromState)(state, 'borrow_balance') || 0);
    const lbii = BigInt((0, utils_1.getParsedValueFromState)(state, 'latest_borrow_interest_index') || 0);
    // calculate health factor
    const threshold = (0, math_1.calcThreshold)(BigInt(collateralBalance), depositInterestIndex, liquidationThreshold, rate, decimals);
    const borrowBalance = (0, math_1.calcBorrowBalance)(bb, borrowInterestIndex, lbii);
    const healthFactor = (0, math_1.calcHealthFactor)(threshold, borrowBalance);
    return {
        currentRound,
        escrowAddress: escrowAddr,
        userAddress: (0, algosdk_1.encodeAddress)(Buffer.from(ua, "base64")),
        borrowed,
        collateralBalance: BigInt(collateralBalance),
        borrowBalance,
        borrowBalanceLiquidationThreshold: threshold,
        healthFactor,
    };
}
exports.loanInfo = loanInfo;
/**
 *
 * Returns escrow accounts for given token pair.
 *
 * @param indexerClient - Algorand indexer client to query
 * @param tokenPair - token pair to query about
 * @param nextToken - token for retrieving next escrows
 * @param round - results for specified round
 * @returns response with structure https://developer.algorand.org/docs/rest-apis/indexer/#searchforaccounts-response-200
 */
function getEscrows(indexerClient, tokenPair, nextToken, round) {
    return __awaiter(this, void 0, void 0, function* () {
        const { appId, collateralPool } = tokenPair;
        const req = indexerClient
            .searchAccounts()
            .applicationID(appId)
            .assetID(collateralPool.fAssetId)
            .currencyGreaterThan("0"); // TODO: https://github.com/algorand/indexer/issues/144
        if (nextToken)
            req.nextToken(nextToken);
        if (round)
            req.round(round);
        return yield req.do();
    });
}
exports.getEscrows = getEscrows;
