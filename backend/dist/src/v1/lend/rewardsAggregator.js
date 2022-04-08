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
exports.prepareClaimRewardsTransaction = exports.getStakedRewardsInfo = exports.prepareRewardStakedExchangeTransactions = exports.prepareRewardImmediateExchangeTransactions = exports.getRewardsAggregatorInfo = void 0;
const algosdk_1 = require("algosdk");
const utils_1 = require("../utils");
function parseUint64s(base64Value) {
    const value = Buffer.from(base64Value, 'base64').toString('hex');
    // uint64s are 8 bytes each
    const uint64s = [];
    for (let i = 0; i < value.length; i += 16) {
        uint64s.push(BigInt("0x" + value.slice(i, i + 16)));
    }
    return uint64s;
}
/**
 *
 * Returns information regarding the given rewards aggregator application.
 *
 * @param indexerClient - Algorand indexer client to query
 * @param appId - rewards aggregator app id
 * @returns RewardsAggregatorInfo rewards aggregator info
 */
function getRewardsAggregatorInfo(indexerClient, appId) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield indexerClient.lookupApplications(appId).do();
        const state = res['application']['params']['global-state'];
        const vestingPeriodLengths = parseUint64s(String((0, utils_1.getParsedValueFromState)(state, "periods")));
        const assetIds = parseUint64s(String((0, utils_1.getParsedValueFromState)(state, "assets")));
        const assetsRewards = assetIds.map(assetId => {
            const asset = parseUint64s(String((0, utils_1.getParsedValueFromState)(state, (0, utils_1.fromIntToBytes8Hex)(assetId), 'hex')));
            const periodRewards = [];
            for (let i = 0; i < asset.length; i += 3) {
                periodRewards.push({
                    limit: asset[i],
                    claimed: asset[i + 1],
                    conversionRate: asset[i + 2],
                });
            }
            return { assetId: Number(assetId), periodRewards };
        });
        return {
            currentRound: res['current-round'],
            vestingPeriodLengths,
            assetsRewards,
        };
    });
}
exports.getRewardsAggregatorInfo = getRewardsAggregatorInfo;
/**
 *
 * Returns a group transaction to immediately exchange frAsset for rewards.
 *
 * @param rewardsAggregator - rewards aggregator to exchange rewards using
 * @param senderAddr - account address for the sender
 * @param rewardAssetIds - asset ids for the rewards given to the user
 * @param frAssetAmount - amount of frAsset to send
 * @param params - suggested params for the transactions with the fees overwritten
 * @returns Transaction[] exchange group transaction
 */
function prepareRewardImmediateExchangeTransactions(rewardsAggregator, senderAddr, rewardAssetIds, frAssetAmount, params) {
    const { appId, pool } = rewardsAggregator;
    const fee = 2000 + rewardAssetIds.length * 1000;
    const appCall = (0, algosdk_1.makeApplicationNoOpTxn)(senderAddr, Object.assign(Object.assign({}, params), { fee, flatFee: true }), appId, [utils_1.enc.encode("ie"), (0, algosdk_1.encodeUint64)(0)], undefined, undefined, rewardAssetIds);
    const assetTransfer = (0, utils_1.transferAlgoOrAsset)(pool.frAssetId, senderAddr, (0, algosdk_1.getApplicationAddress)(pool.appId), frAssetAmount, Object.assign(Object.assign({}, params), { fee: 0, flatFee: true }));
    return (0, algosdk_1.assignGroupID)([appCall, assetTransfer]);
}
exports.prepareRewardImmediateExchangeTransactions = prepareRewardImmediateExchangeTransactions;
/**
 *
 * Returns a group transaction to exchange frAsset for rewards staked.
 *
 * @param rewardsAggregator - rewards aggregator to exchange rewards using
 * @param senderAddr - account address for the sender
 * @param period - number from 1-4 indicate staking period
 * @param frAssetAmount - amount of frAsset to send
 * @param params - suggested params for the transactions with the fees overwritten
 * @returns { txns: Transaction[], escrow: Account } object containing group transaction and escrow account
 */
function prepareRewardStakedExchangeTransactions(rewardsAggregator, senderAddr, period, frAssetAmount, params) {
    const { appId, pool } = rewardsAggregator;
    if (period < 1 || 4 < period)
        throw new Error("Invalid period specified.");
    const escrow = (0, algosdk_1.generateAccount)();
    const algoTransfer = (0, utils_1.transferAlgoOrAsset)(0, senderAddr, escrow.addr, 0.5e6, Object.assign(Object.assign({}, params), { fee: 0, flatFee: true }));
    const optInCall = (0, algosdk_1.makeApplicationOptInTxn)(escrow.addr, Object.assign(Object.assign({}, params), { fee: 0, flatFee: true }), appId, [utils_1.enc.encode("e"), (0, algosdk_1.encodeUint64)(period)], undefined, undefined, undefined, undefined, undefined, (0, algosdk_1.getApplicationAddress)(appId));
    const appCall = (0, algosdk_1.makeApplicationNoOpTxn)(senderAddr, Object.assign(Object.assign({}, params), { fee: 0, flatFee: true }), appId, [utils_1.enc.encode("e")], [escrow.addr]);
    const assetTransfer = (0, utils_1.transferAlgoOrAsset)(pool.frAssetId, senderAddr, (0, algosdk_1.getApplicationAddress)(pool.appId), frAssetAmount, Object.assign(Object.assign({}, params), { fee: 4000, flatFee: true }));
    return {
        txns: (0, algosdk_1.assignGroupID)([algoTransfer, optInCall, appCall, assetTransfer]),
        escrow,
    };
}
exports.prepareRewardStakedExchangeTransactions = prepareRewardStakedExchangeTransactions;
/**
 *
 * Returns information regarding the staked rewards.
 *
 * @param indexerClient - Algorand indexer client to query
 * @param rewardsAggregator - rewards aggregator
 * @param escrowAddr - escrow address to query about
 * @param round - results for specified round
 * @returns Promise<StakedRewardsInfo> staked rewards info
 */
function getStakedRewardsInfo(indexerClient, rewardsAggregator, escrowAddr, round) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const { appId } = rewardsAggregator;
        // get escrow account
        const req = indexerClient.lookupAccountByID(escrowAddr);
        if (round)
            req.round(round);
        const res = yield req.do();
        // escrow local state
        const state = (_b = (_a = res['account']['apps-local-state']) === null || _a === void 0 ? void 0 : _a.find((app) => app.id === appId)) === null || _b === void 0 ? void 0 : _b['key-value'];
        if (state === undefined)
            throw new Error("Unable to find escrow: " + escrowAddr + " for rewards aggregator " + appId + ".");
        const ua = String((0, utils_1.getParsedValueFromState)(state, 'user_address'));
        const times = parseUint64s(String((0, utils_1.getParsedValueFromState)(state, 'time')));
        const assetIds = parseUint64s(String((0, utils_1.getParsedValueFromState)(state, "reward_assets")));
        const rewards = assetIds.map(assetId => {
            const asset = parseUint64s(String((0, utils_1.getParsedValueFromState)(state, (0, utils_1.fromIntToBytes8Hex)(assetId), 'hex')));
            return {
                assetId: Number(assetId),
                claimed: asset[0],
                total: asset[1],
            };
        });
        return {
            currentRound: res['current-round'],
            escrowAddress: escrowAddr,
            userAddress: (0, algosdk_1.encodeAddress)(Buffer.from(ua, "base64")),
            start: times[0],
            latest: times[1],
            end: times[2],
            rewards,
        };
    });
}
exports.getStakedRewardsInfo = getStakedRewardsInfo;
/**
 *
 * Returns a transaction to claim staked rewards.
 *
 * @param rewardsAggregator - rewards aggregator to exchange rewards using
 * @param senderAddr - account address for the sender
 * @param escrowAddr - escrow address that holds the staked rewards parameters
 * @param rewardAssetIds - asset ids for the rewards given to the user
 * @param params - suggested params for the transactions with the fees overwritten
 * @returns Transaction claim stake rewards transaction
 */
function prepareClaimRewardsTransaction(rewardsAggregator, senderAddr, escrowAddr, rewardAssetIds, params) {
    const { appId } = rewardsAggregator;
    const fee = 1000 + rewardAssetIds.length * 1000;
    return (0, algosdk_1.makeApplicationNoOpTxn)(senderAddr, Object.assign(Object.assign({}, params), { fee, flatFee: true }), appId, [utils_1.enc.encode("c")], [escrowAddr], undefined, rewardAssetIds);
}
exports.prepareClaimRewardsTransaction = prepareClaimRewardsTransaction;
