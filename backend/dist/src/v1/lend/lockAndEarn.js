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
exports.prepareClaimLockedDepositTransactions = exports.getLockedDepositInfo = exports.prepareProvideLiquidityTransactions = exports.getLockAndEarnInfo = exports.getLockAndEarns = void 0;
const utils_1 = require("../utils");
const algosdk_1 = require("algosdk");
/**
 *
 * Returns array of lock and earns.
 *
 * @param indexerClient - Algorand indexer client to query
 * @param pool - pool to query about
 * @returns LockAndEarn[] lock and earns
 */
function getLockAndEarns(indexerClient, pool) {
    return __awaiter(this, void 0, void 0, function* () {
        const { appId } = pool;
        const res = yield indexerClient.searchAccounts().applicationID(pool.appId).do();
        // build array of lock and earns
        const lockAndEarns = [];
        res['accounts'].forEach((account) => {
            var _a, _b;
            const state = (_b = (_a = account['apps-local-state']) === null || _a === void 0 ? void 0 : _a.find((app) => app.id === appId)) === null || _b === void 0 ? void 0 : _b['key-value'];
            const liquidityAppId = (0, utils_1.getParsedValueFromState)(state, 'liquidity_app_id');
            if (liquidityAppId !== undefined)
                lockAndEarns.push({
                    appId: Number(liquidityAppId),
                    pool,
                    linkAddr: account['address'],
                });
        });
        return lockAndEarns;
    });
}
exports.getLockAndEarns = getLockAndEarns;
/**
 *
 * Returns information regarding the given lock and earn application.
 *
 * @param indexerClient - Algorand indexer client to query
 * @param appId - lock and earn app id
 * @returns LockAndEarnInfo[] lock and earn info
 */
function getLockAndEarnInfo(indexerClient, appId) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield indexerClient.lookupApplications(appId).do();
        const state = res['application']['params']['global-state'];
        const rewardsRatio = BigInt((0, utils_1.getParsedValueFromState)(state, 'rewards_ratio') || 0);
        const timeLocked = BigInt((0, utils_1.getParsedValueFromState)(state, 'time_locked') || 0);
        const deposits = BigInt((0, utils_1.getParsedValueFromState)(state, 'deposits') || 0);
        const limit = BigInt((0, utils_1.getParsedValueFromState)(state, 'limit') || 0);
        return {
            currentRound: res['current-round'],
            rewardsRatio,
            timeLocked,
            deposits,
            limit,
        };
    });
}
exports.getLockAndEarnInfo = getLockAndEarnInfo;
/**
 *
 * Returns a group transaction to provide liquidity in lock and earn.
 *
 * @param lockAndEarn - lock and earn
 * @param senderAddr - account address for the sender
 * @param depositAmount - amount to deposit (will be locked)
 * @param params - suggested params for the transactions with the fees overwritten
 * @returns { txns: Transaction[], escrow: Account } object containing group transaction and escrow account
 */
function prepareProvideLiquidityTransactions(lockAndEarn, senderAddr, depositAmount, params) {
    const { linkAddr, pool } = lockAndEarn;
    const { assetId, fAssetId, frAssetId } = pool;
    const escrow = (0, algosdk_1.generateAccount)();
    const fundEscrow = (0, utils_1.transferAlgoOrAsset)(0, senderAddr, escrow.addr, 0.407e6, Object.assign(Object.assign({}, params), { flatFee: true, fee: 8000 }));
    const optInCall = (0, algosdk_1.makeApplicationOptInTxn)(escrow.addr, Object.assign(Object.assign({}, params), { flatFee: true, fee: 0 }), lockAndEarn.appId, undefined, undefined, undefined, undefined, undefined, undefined, (0, algosdk_1.getApplicationAddress)(lockAndEarn.appId));
    const liquidityCall = (0, algosdk_1.makeApplicationNoOpTxn)(senderAddr, Object.assign(Object.assign({}, params), { flatFee: true, fee: 0 }), lockAndEarn.appId, [utils_1.enc.encode("pl")], [escrow.addr], undefined, [fAssetId]);
    const dispenserCall = (0, algosdk_1.makeApplicationNoOpTxn)(senderAddr, Object.assign(Object.assign({}, params), { flatFee: true, fee: 0 }), pool.appId, [utils_1.enc.encode("pl")], [linkAddr, escrow.addr], [lockAndEarn.appId], [fAssetId, frAssetId]);
    const depositTx = (0, utils_1.transferAlgoOrAsset)(assetId, senderAddr, (0, algosdk_1.getApplicationAddress)(pool.appId), depositAmount, Object.assign(Object.assign({}, params), { fee: 0, flatFee: true }));
    return {
        txns: (0, algosdk_1.assignGroupID)([fundEscrow, optInCall, liquidityCall, dispenserCall, depositTx]),
        escrow,
    };
}
exports.prepareProvideLiquidityTransactions = prepareProvideLiquidityTransactions;
/**
 *
 * Returns information regarding the locked deposit.
 *
 * @param indexerClient - Algorand indexer client to query
 * @param lockAndEarn - lock and earn of the deposit
 * @param escrowAddr - escrow address to query about
 * @param round - results for specified round
 * @returns Promise<LoanInfo> loan info
 */
function getLockedDepositInfo(indexerClient, lockAndEarn, escrowAddr, round) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function* () {
        const { appId, pool } = lockAndEarn;
        // get escrow account
        const req = indexerClient.lookupAccountByID(escrowAddr);
        if (round)
            req.round(round);
        const res = yield req.do();
        const account = res['account'];
        // escrow balance
        const lockedBalance = (_b = (_a = account['assets']) === null || _a === void 0 ? void 0 : _a.find((asset) => asset['asset-id'] === pool.fAssetId)) === null || _b === void 0 ? void 0 : _b['amount'];
        if (lockedBalance === undefined)
            throw new Error("Unable to get escrow: " + escrowAddr + " locked balance.");
        // escrow local state
        const state = (_d = (_c = account['apps-local-state']) === null || _c === void 0 ? void 0 : _c.find((app) => app.id === appId)) === null || _d === void 0 ? void 0 : _d['key-value'];
        if (state === undefined)
            throw new Error("Unable to find escrow: " + escrowAddr + " for lock and earn " + appId + ".");
        const ua = String((0, utils_1.getParsedValueFromState)(state, 'user_address'));
        const release = BigInt((0, utils_1.getParsedValueFromState)(state, 'release') || 0);
        return {
            currentRound: res['current-round'],
            escrowAddress: escrowAddr,
            userAddress: (0, algosdk_1.encodeAddress)(Buffer.from(ua, "base64")),
            lockedBalance: BigInt(lockedBalance),
            release,
        };
    });
}
exports.getLockedDepositInfo = getLockedDepositInfo;
/**
 *
 * Returns a transaction to claim locked deposit.
 *
 * @param lockAndEarn - lock and earn
 * @param senderAddr - account address for the sender
 * @param escrowAddr - escrow address that will hold the collateral
 * @param params - suggested params for the transactions with the fees overwritten
 * @returns Transaction claim locked deposit transaction
 */
function prepareClaimLockedDepositTransactions(lockAndEarn, senderAddr, escrowAddr, params) {
    const { appId, pool } = lockAndEarn;
    return (0, algosdk_1.makeApplicationNoOpTxn)(senderAddr, Object.assign(Object.assign({}, params), { flatFee: true, fee: 2000 }), appId, [utils_1.enc.encode("c")], [escrowAddr], undefined, [pool.fAssetId]);
}
exports.prepareClaimLockedDepositTransactions = prepareClaimLockedDepositTransactions;
