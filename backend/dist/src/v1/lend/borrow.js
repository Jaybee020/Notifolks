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
exports.prepareRepayTransactions = exports.prepareIncreaseBorrowTransactions = exports.prepareReduceCollateralTransactions = exports.prepareIncreaseCollateralTransaction = exports.prepareBorrowTransactions = exports.prepareAddEscrowTransactions = exports.getTokenPairInfo = void 0;
const algosdk_1 = require("algosdk");
const utils_1 = require("../utils");
/**
 *
 * Returns information regarding the given token pair.
 *
 * @param indexerClient - Algorand indexer client to query
 * @param tokenPair - token pair to query about
 * @returns Promise<TokenPairInfo[]> token pair info
 */
function getTokenPairInfo(indexerClient, tokenPair) {
    return __awaiter(this, void 0, void 0, function* () {
        const { appId } = tokenPair;
        const res = yield indexerClient.lookupApplications(appId).do();
        const state = res['application']['params']['global-state'];
        const s1 = BigInt((0, utils_1.getParsedValueFromState)(state, 'S1') || 0);
        const s2 = BigInt((0, utils_1.getParsedValueFromState)(state, 'S2') || 0);
        const s3 = BigInt((0, utils_1.getParsedValueFromState)(state, 'S3') || 0);
        return {
            currentRound: res['current-round'],
            loanToValueRatio: s1,
            liquidationThreshold: s2,
            safetyThreshold: s3,
        };
    });
}
exports.getTokenPairInfo = getTokenPairInfo;
/**
 *
 * Returns a group transaction to add escrow before borrowing.
 *
 * @param tokenPair - token pair to add escrow for
 * @param senderAddr - account address for the sender
 * @param params - suggested params for the transactions with the fees overwritten
 * @returns { txns: Transaction[], escrow: Account } object containing group transaction and escrow account
 */
function prepareAddEscrowTransactions(tokenPair, senderAddr, params) {
    const { appId, collateralPool } = tokenPair;
    const escrow = (0, algosdk_1.generateAccount)();
    const paymentTx = (0, utils_1.transferAlgoOrAsset)(0, senderAddr, escrow.addr, 0.4355e6, Object.assign(Object.assign({}, params), { fee: 0, flatFee: true }));
    const optInAppCallTx = (0, algosdk_1.makeApplicationOptInTxn)(escrow.addr, Object.assign(Object.assign({}, params), { fee: 0, flatFee: true }), appId, undefined, undefined, undefined, undefined, undefined, undefined, (0, algosdk_1.getApplicationAddress)(appId));
    const appCallTx = (0, algosdk_1.makeApplicationNoOpTxn)(senderAddr, Object.assign(Object.assign({}, params), { fee: 4000, flatFee: true }), appId, [utils_1.enc.encode("ae")], [escrow.addr], undefined, [collateralPool.fAssetId]);
    return {
        txns: (0, algosdk_1.assignGroupID)([paymentTx, optInAppCallTx, appCallTx]),
        escrow,
    };
}
exports.prepareAddEscrowTransactions = prepareAddEscrowTransactions;
/**
 *
 * Returns a group transaction to borrow.
 *
 * @param tokenPair - token pair to use for borrow
 * @param oracle - oracle price source
 * @param senderAddr - account address for the sender
 * @param escrowAddr - escrow address that will hold the collateral
 * @param collateralAmount - collateral amount to send
 * @param borrowAmount - borrow amount to receive (max amount if undefined)
 * @param params - suggested params for the transactions with the fees overwritten
 * @returns Transaction[] borrow group transaction
 */
function prepareBorrowTransactions(tokenPair, oracle, senderAddr, escrowAddr, collateralAmount, borrowAmount, params) {
    const { appId, collateralPool, borrowPool, linkAddr } = tokenPair;
    const { oracle1AppId, oracle2AppId, oracleAdapterAppId } = oracle;
    const oracleAdapterAppCall = (0, algosdk_1.makeApplicationNoOpTxn)(senderAddr, Object.assign(Object.assign({}, params), { fee: 0, flatFee: true }), oracleAdapterAppId, [(0, algosdk_1.encodeUint64)(collateralPool.assetId), (0, algosdk_1.encodeUint64)(borrowPool.assetId)], undefined, oracle2AppId ? [oracle1AppId, oracle2AppId] : [oracle1AppId]);
    const collateralDispenserAppCall = (0, algosdk_1.makeApplicationNoOpTxn)(senderAddr, Object.assign(Object.assign({}, params), { fee: 6000, flatFee: true }), collateralPool.appId, [utils_1.enc.encode("b")], [linkAddr], [appId]);
    const borrowDispenserAppCall = (0, algosdk_1.makeApplicationNoOpTxn)(senderAddr, Object.assign(Object.assign({}, params), { fee: 0, flatFee: true }), borrowPool.appId, borrowAmount ? [utils_1.enc.encode("b"), (0, algosdk_1.encodeUint64)(borrowAmount)] : [utils_1.enc.encode("b")], [linkAddr], undefined, borrowPool.assetId ? [borrowPool.assetId] : undefined);
    const tokenPairAppCall = (0, algosdk_1.makeApplicationNoOpTxn)(senderAddr, Object.assign(Object.assign({}, params), { fee: 0, flatFee: true }), appId, [utils_1.enc.encode("b")], [escrowAddr], [borrowPool.appId]);
    const collateralTx = (0, utils_1.transferAlgoOrAsset)(collateralPool.fAssetId, senderAddr, escrowAddr, collateralAmount, Object.assign(Object.assign({}, params), { fee: 0, flatFee: true }));
    return (0, algosdk_1.assignGroupID)([oracleAdapterAppCall, collateralDispenserAppCall, borrowDispenserAppCall, tokenPairAppCall, collateralTx]);
}
exports.prepareBorrowTransactions = prepareBorrowTransactions;
/**
 *
 * Returns a transaction to increase collateral.
 *
 * @param tokenPair - token pair to use for borrow
 * @param senderAddr - account address for the sender
 * @param escrowAddr - escrow address that will hold the collateral
 * @param collateralAmount - collateral amount to send
 * @param params - suggested params for the transactions with the fees overwritten
 * @returns Transaction increase collateral transaction
 */
function prepareIncreaseCollateralTransaction(tokenPair, senderAddr, escrowAddr, collateralAmount, params) {
    const { fAssetId } = tokenPair.collateralPool;
    return (0, utils_1.transferAlgoOrAsset)(fAssetId, senderAddr, escrowAddr, collateralAmount, Object.assign(Object.assign({}, params), { fee: 1000, flatFee: true }));
}
exports.prepareIncreaseCollateralTransaction = prepareIncreaseCollateralTransaction;
/**
 *
 * Returns a group transaction to reduce collateral.
 *
 * @param tokenPair - token pair to use for borrow
 * @param oracle - oracle price source
 * @param sender - account address for the sender
 * @param escrow - escrow address that will hold the collateral
 * @param reduceAmount - collateral amount to reduce by (max amount if undefined)
 * @param params - suggested params for the transactions with the fees overwritten
 * @returns Transaction[] reduce collateral group transaction
 */
function prepareReduceCollateralTransactions(tokenPair, oracle, sender, escrow, reduceAmount, params) {
    const { appId, collateralPool, borrowPool, linkAddr } = tokenPair;
    const { oracle1AppId, oracle2AppId, oracleAdapterAppId } = oracle;
    const oracleAdapterAppCall = (0, algosdk_1.makeApplicationNoOpTxn)(sender, Object.assign(Object.assign({}, params), { fee: 0, flatFee: true }), oracleAdapterAppId, [(0, algosdk_1.encodeUint64)(collateralPool.assetId), (0, algosdk_1.encodeUint64)(borrowPool.assetId)], undefined, oracle2AppId ? [oracle1AppId, oracle2AppId] : [oracle1AppId]);
    const collateralDispenserAppCall = (0, algosdk_1.makeApplicationNoOpTxn)(sender, Object.assign(Object.assign({}, params), { fee: 5000, flatFee: true }), collateralPool.appId, [utils_1.enc.encode("rc")], [linkAddr, escrow], [appId], [collateralPool.fAssetId]);
    const borrowDispenserAppCall = (0, algosdk_1.makeApplicationNoOpTxn)(sender, Object.assign(Object.assign({}, params), { fee: 0, flatFee: true }), borrowPool.appId, reduceAmount ? [utils_1.enc.encode("rc"), (0, algosdk_1.encodeUint64)(reduceAmount)] : [utils_1.enc.encode("rc")], [linkAddr, escrow], [appId], borrowPool.assetId ? [borrowPool.assetId] : undefined);
    const tokenPairAppCall = (0, algosdk_1.makeApplicationNoOpTxn)(sender, Object.assign(Object.assign({}, params), { fee: 0, flatFee: true }), appId, [utils_1.enc.encode("rc")], [escrow], [borrowPool.appId], [collateralPool.fAssetId]);
    return (0, algosdk_1.assignGroupID)([oracleAdapterAppCall, collateralDispenserAppCall, borrowDispenserAppCall, tokenPairAppCall]);
}
exports.prepareReduceCollateralTransactions = prepareReduceCollateralTransactions;
/**
 *
 * Returns a group transaction to increase borrow.
 *
 * @param tokenPair - token pair to use for borrow
 * @param oracle - oracle price source
 * @param senderAddr - account address for the sender
 * @param escrow - escrow address that will hold the collateral
 * @param increaseAmount - borrow amount to increase by (max amount if undefined)
 * @param params - suggested params for the transactions with the fees overwritten
 * @returns Transaction[] increase borrow group transaction
 */
function prepareIncreaseBorrowTransactions(tokenPair, oracle, senderAddr, escrow, increaseAmount, params) {
    const { appId, collateralPool, borrowPool, linkAddr } = tokenPair;
    const { oracle1AppId, oracle2AppId, oracleAdapterAppId } = oracle;
    const oracleAdapterAppCall = (0, algosdk_1.makeApplicationNoOpTxn)(senderAddr, Object.assign(Object.assign({}, params), { fee: 0, flatFee: true }), oracleAdapterAppId, [(0, algosdk_1.encodeUint64)(collateralPool.assetId), (0, algosdk_1.encodeUint64)(borrowPool.assetId)], undefined, oracle2AppId ? [oracle1AppId, oracle2AppId] : [oracle1AppId]);
    const collateralDispenserAppCall = (0, algosdk_1.makeApplicationNoOpTxn)(senderAddr, Object.assign(Object.assign({}, params), { fee: 5000, flatFee: true }), collateralPool.appId, [utils_1.enc.encode("ib")], [linkAddr, escrow], [appId], [collateralPool.fAssetId]);
    const borrowDispenserAppCall = (0, algosdk_1.makeApplicationNoOpTxn)(senderAddr, Object.assign(Object.assign({}, params), { fee: 0, flatFee: true }), borrowPool.appId, increaseAmount ? [utils_1.enc.encode("ib"), (0, algosdk_1.encodeUint64)(increaseAmount)] : [utils_1.enc.encode("ib")], [linkAddr, escrow], [appId], borrowPool.assetId ? [borrowPool.assetId] : undefined);
    const tokenPairAppCall = (0, algosdk_1.makeApplicationNoOpTxn)(senderAddr, Object.assign(Object.assign({}, params), { fee: 0, flatFee: true }), appId, [utils_1.enc.encode("ib")], [escrow], [borrowPool.appId]);
    return (0, algosdk_1.assignGroupID)([oracleAdapterAppCall, collateralDispenserAppCall, borrowDispenserAppCall, tokenPairAppCall]);
}
exports.prepareIncreaseBorrowTransactions = prepareIncreaseBorrowTransactions;
/**
 *
 * Returns a group transaction to increase borrow.
 *
 * @param tokenPair - token pair to use for borrow
 * @param senderAddr - account address for the sender
 * @param escrowAddr - escrow address that will hold the collateral
 * @param reserveAddr - reserve address that will earn percentage of interest paid
 * @param repayAmount - amount to repay (will send back any over-payment if any)
 * @param params - suggested params for the transactions with the fees overwritten
 * @returns Transaction[] increase borrow group transaction
 */
function prepareRepayTransactions(tokenPair, senderAddr, escrowAddr, reserveAddr, repayAmount, params) {
    const { appId, collateralPool, borrowPool, linkAddr } = tokenPair;
    const collateralDispenserAppCall = (0, algosdk_1.makeApplicationNoOpTxn)(senderAddr, Object.assign(Object.assign({}, params), { fee: 8000, flatFee: true }), collateralPool.appId, [utils_1.enc.encode("rb")], [linkAddr]);
    const borrowDispenserAppCall = (0, algosdk_1.makeApplicationNoOpTxn)(senderAddr, Object.assign(Object.assign({}, params), { fee: 0, flatFee: true }), borrowPool.appId, [utils_1.enc.encode("rb")], [linkAddr, escrowAddr, reserveAddr], [appId], borrowPool.assetId ? [borrowPool.assetId, borrowPool.frAssetId] : [borrowPool.frAssetId]);
    const tokenPairAppCall = (0, algosdk_1.makeApplicationNoOpTxn)(senderAddr, Object.assign(Object.assign({}, params), { fee: 0, flatFee: true }), appId, [utils_1.enc.encode("rb")], [escrowAddr], [borrowPool.appId], [collateralPool.fAssetId]);
    const repayTx = (0, utils_1.transferAlgoOrAsset)(borrowPool.assetId, senderAddr, (0, algosdk_1.getApplicationAddress)(borrowPool.appId), repayAmount, Object.assign(Object.assign({}, params), { fee: 0, flatFee: true }));
    return (0, algosdk_1.assignGroupID)([collateralDispenserAppCall, borrowDispenserAppCall, tokenPairAppCall, repayTx]);
}
exports.prepareRepayTransactions = prepareRepayTransactions;
