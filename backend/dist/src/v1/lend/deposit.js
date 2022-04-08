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
exports.prepareWithdrawTransactions = exports.prepareDepositTransactions = exports.getPoolInfo = void 0;
const algosdk_1 = require("algosdk");
const utils_1 = require("../utils");
const math_1 = require("./math");
/**
 *
 * Returns information regarding the given pool.
 *
 * @param indexerClient - Algorand indexer client to query
 * @param pool - pool to query about
 * @returns PoolInfo[] pool info
 */
function getPoolInfo(indexerClient, pool) {
    return __awaiter(this, void 0, void 0, function* () {
        const { appId } = pool;
        const res = yield indexerClient.lookupApplications(appId).do();
        const state = res['application']['params']['global-state'];
        const dir = BigInt((0, utils_1.getParsedValueFromState)(state, 'deposit_interest_rate') || 0);
        const dii = BigInt((0, utils_1.getParsedValueFromState)(state, 'deposit_interest_index') || 0);
        const bir = BigInt((0, utils_1.getParsedValueFromState)(state, 'borrow_interest_rate') || 0);
        const bii = BigInt((0, utils_1.getParsedValueFromState)(state, 'borrow_interest_index') || 0);
        const lu = BigInt((0, utils_1.getParsedValueFromState)(state, 'latest_update') || 0);
        const r0 = BigInt((0, utils_1.getParsedValueFromState)(state, 'R0') || 0);
        const r1 = BigInt((0, utils_1.getParsedValueFromState)(state, 'R1') || 0);
        const r2 = BigInt((0, utils_1.getParsedValueFromState)(state, 'R2') || 0);
        const eps = BigInt((0, utils_1.getParsedValueFromState)(state, 'EPS') || 0);
        const rf = BigInt((0, utils_1.getParsedValueFromState)(state, 'RF') || 0);
        const srr = BigInt((0, utils_1.getParsedValueFromState)(state, 'SRR') || 0);
        const td = BigInt((0, utils_1.getParsedValueFromState)(state, 'total_deposits') || 0);
        const tb = BigInt((0, utils_1.getParsedValueFromState)(state, 'total_borrows') || 0);
        const uopt = BigInt((0, utils_1.getParsedValueFromState)(state, 'U_OPT') || 0);
        const isPaused = Boolean((0, utils_1.getParsedValueFromState)(state, 'is_paused') || 0);
        const isRewardsPaused = Boolean((0, utils_1.getParsedValueFromState)(state, 'is_rewards_paused') || 0);
        return {
            currentRound: res['current-round'],
            depositInterestRate: dir,
            depositInterestIndex: (0, math_1.calcInterestIndex)(dii, dir, lu),
            borrowInterestRate: bir,
            borrowInterestIndex: (0, math_1.calcInterestIndex)(bii, bir, lu, eps),
            baseRate: r0,
            slope1Rate: r1,
            slope2Rate: r2,
            retentionRate: rf + srr,
            totalDeposits: td,
            totalBorrows: tb,
            utilizationRatio: (0, math_1.calcUtilizationRatio)(tb, td),
            optimalUtilizationRatio: uopt,
            epsilon: eps,
            latestUpdate: lu,
            isPaused,
            isRewardsPaused,
        };
    });
}
exports.getPoolInfo = getPoolInfo;
/**
 *
 * Returns a group transaction to deposit into the specified pool.
 *
 * @param pool - pool to deposit into
 * @param senderAddr - account address for the sender
 * @param depositAmount - integer amount of algo / asset to deposit
 * @param params - suggested params for the transactions with the fees overwritten
 * @returns Transaction[] deposit group transaction
 */
function prepareDepositTransactions(pool, senderAddr, depositAmount, params) {
    const { appId, assetId, fAssetId } = pool;
    const appCallTx = (0, algosdk_1.makeApplicationNoOpTxn)(senderAddr, Object.assign(Object.assign({}, params), { fee: 3000, flatFee: true }), appId, [utils_1.enc.encode("d")], undefined, undefined, [fAssetId]);
    const depositTx = (0, utils_1.transferAlgoOrAsset)(assetId, senderAddr, (0, algosdk_1.getApplicationAddress)(appId), depositAmount, Object.assign(Object.assign({}, params), { fee: 0, flatFee: true }));
    return (0, algosdk_1.assignGroupID)([appCallTx, depositTx]);
}
exports.prepareDepositTransactions = prepareDepositTransactions;
/**
 *
 * Returns a group transaction to withdraw from the specified pool.
 *
 * @param pool - pool to deposit into
 * @param senderAddr - account address for the sender
 * @param withdrawAmount - integer amount of the fAsset to withdraw
 * @param params - suggested params for the transactions with the fees overwritten
 * @returns Transaction[] deposit group transaction
 */
function prepareWithdrawTransactions(pool, senderAddr, withdrawAmount, params) {
    const { appId, assetId, fAssetId } = pool;
    const appCallTx = (0, algosdk_1.makeApplicationNoOpTxn)(senderAddr, Object.assign(Object.assign({}, params), { fee: 3000, flatFee: true }), appId, [utils_1.enc.encode("r")], undefined, undefined, assetId ? [assetId] : undefined);
    const redeemTx = (0, utils_1.transferAlgoOrAsset)(fAssetId, senderAddr, (0, algosdk_1.getApplicationAddress)(appId), withdrawAmount, Object.assign(Object.assign({}, params), { fee: 0, flatFee: true }));
    return (0, algosdk_1.assignGroupID)([appCallTx, redeemTx]);
}
exports.prepareWithdrawTransactions = prepareWithdrawTransactions;
