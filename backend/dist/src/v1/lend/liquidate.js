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
exports.prepareLiquidateTransactions = exports.getLoansInfo = exports.getLoanInfo = void 0;
const algosdk_1 = require("algosdk");
const utils_1 = require("../utils");
const borrow_1 = require("./borrow");
const deposit_1 = require("./deposit");
const oracle_1 = require("./oracle");
const utils_2 = require("./utils");
/**
 *
 * Returns information regarding the given loan.
 *
 * @param indexerClient - Algorand indexer client to query
 * @param tokenPair - token pair of the loan
 * @param oracle - oracle to query for prices
 * @param escrowAddr - escrow address to query about
 * @param round - results for specified round
 * @returns Promise<LoanInfo> loan info
 */
function getLoanInfo(indexerClient, tokenPair, oracle, escrowAddr, round) {
    return __awaiter(this, void 0, void 0, function* () {
        const { collateralPool, borrowPool } = tokenPair;
        // get escrow account
        const req = indexerClient.lookupAccountByID(escrowAddr);
        if (round)
            req.round(round);
        const res = yield req.do();
        // get conversion rate
        const { prices } = yield (0, oracle_1.getOraclePrices)(indexerClient, oracle, [collateralPool.assetId, borrowPool.assetId]);
        const conversionRate = (0, oracle_1.getConversionRate)(prices[collateralPool.assetId].price, prices[borrowPool.assetId].price);
        // get collateral pool and token pair info
        const collateralPoolInfo = yield (0, deposit_1.getPoolInfo)(indexerClient, collateralPool);
        const borrowPoolInfo = yield (0, deposit_1.getPoolInfo)(indexerClient, borrowPool);
        const tokenPairInfo = yield (0, borrow_1.getTokenPairInfo)(indexerClient, tokenPair);
        // derive loan info
        return (0, utils_2.loanInfo)(res['account'], tokenPair, tokenPairInfo, collateralPoolInfo, borrowPoolInfo, conversionRate, res['current-round']);
    });
}
exports.getLoanInfo = getLoanInfo;
/**
 *
 * Returns information regarding the given loans.
 * Must pass the token pair info, collateral pool info and conversion that you are using.
 *
 * @param indexerClient - Algorand indexer client to query
 * @param tokenPair - token pair of the loan
 * @param tokenPairInfo - token pair info
 * @param collateralPoolInfo - collateral pool info
 * @param borrowPoolInfo - borrow pool info
 * @param conversionRate - conversion rate from collateral to borrow asset
 * @param nextToken - token for retrieving next escrows
 * @param round - results for specified round
 * @returns Promise<{ loans: LoanInfo[], nextToken?: string}> object containing loan infos and next token
 */
function getLoansInfo(indexerClient, tokenPair, tokenPairInfo, collateralPoolInfo, borrowPoolInfo, conversionRate, nextToken, round) {
    return __awaiter(this, void 0, void 0, function* () {
        // retrieve loans
        const res = yield (0, utils_2.getEscrows)(indexerClient, tokenPair, nextToken, round);
        // derive loans info
        let loans = [];
        res['accounts'].forEach((account) => {
            try {
                const loan = (0, utils_2.loanInfo)(account, tokenPair, tokenPairInfo, collateralPoolInfo, borrowPoolInfo, conversionRate, res['current-round']);
                loans.push(loan);
            }
            catch (e) {
                console.error(e);
            }
        });
        return {
            loans,
            nextToken: res['next-token'],
        };
    });
}
exports.getLoansInfo = getLoansInfo;
/**
 *
 * Returns a group transaction to liquidate an under-collateralized loan.
 *
 * @param tokenPair - token pair to use for borrow
 * @param oracle - oracle price source
 * @param senderAddr - account address for the sender
 * @param escrowAddr - escrow address that will hold the collateral
 * @param reserveAddr - reserve address that will earn percentage of interest paid
 * @param liquidationAmount - amount to liquidate (will send back any over-payment if any)
 * @param params - suggested params for the transactions with the fees overwritten
 * @returns Transaction[] liquidate group transaction
 */
function prepareLiquidateTransactions(tokenPair, oracle, senderAddr, escrowAddr, reserveAddr, liquidationAmount, params) {
    const { appId, collateralPool, borrowPool, linkAddr } = tokenPair;
    const { oracle1AppId, oracle2AppId, oracleAdapterAppId } = oracle;
    const oracleAdapterAppCall = (0, algosdk_1.makeApplicationNoOpTxn)(senderAddr, Object.assign(Object.assign({}, params), { fee: 0, flatFee: true }), oracleAdapterAppId, [(0, algosdk_1.encodeUint64)(collateralPool.assetId), (0, algosdk_1.encodeUint64)(borrowPool.assetId)], undefined, oracle2AppId ? [oracle1AppId, oracle2AppId] : [oracle1AppId]);
    const collateralDispenserAppCall = (0, algosdk_1.makeApplicationNoOpTxn)(senderAddr, Object.assign(Object.assign({}, params), { fee: 8000, flatFee: true }), collateralPool.appId, [utils_1.enc.encode("l")], [linkAddr, escrowAddr], [appId], [collateralPool.fAssetId]);
    const borrowDispenserAppCall = (0, algosdk_1.makeApplicationNoOpTxn)(senderAddr, Object.assign(Object.assign({}, params), { fee: 0, flatFee: true }), borrowPool.appId, [utils_1.enc.encode("l")], [linkAddr, escrowAddr, reserveAddr], [appId], borrowPool.assetId ? [borrowPool.assetId] : undefined);
    const tokenPairAppCall = (0, algosdk_1.makeApplicationNoOpTxn)(senderAddr, Object.assign(Object.assign({}, params), { fee: 0, flatFee: true }), appId, [utils_1.enc.encode("l")], [escrowAddr], [borrowPool.appId], [collateralPool.fAssetId]);
    const repayTx = (0, utils_1.transferAlgoOrAsset)(borrowPool.assetId, senderAddr, (0, algosdk_1.getApplicationAddress)(borrowPool.appId), liquidationAmount, Object.assign(Object.assign({}, params), { fee: 0, flatFee: true }));
    return (0, algosdk_1.assignGroupID)([oracleAdapterAppCall, collateralDispenserAppCall, borrowDispenserAppCall, tokenPairAppCall, repayTx]);
}
exports.prepareLiquidateTransactions = prepareLiquidateTransactions;
