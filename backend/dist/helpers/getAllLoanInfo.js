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
exports.getAllLoanInfo = void 0;
const config_1 = require("../config");
const src_1 = require("../src");
function getAllLoanInfo(accountAddr, tokenPairKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const oracle = src_1.TestnetOracle;
        const AllUserLoan = [];
        const tokenPair = src_1.TestnetTokenPairs[tokenPairKey];
        const { collateralPool, borrowPool } = tokenPair;
        // get conversion rate
        const { prices } = yield (0, src_1.getOraclePrices)(config_1.indexerClient, oracle, [collateralPool.assetId, borrowPool.assetId]);
        const conversionRate = (0, src_1.getConversionRate)(prices[collateralPool.assetId].price, prices[borrowPool.assetId].price);
        // get collateral pool and token pair info
        const collateralPoolInfo = yield (0, src_1.getPoolInfo)(config_1.indexerClient, collateralPool);
        const borrowPoolInfo = yield (0, src_1.getPoolInfo)(config_1.indexerClient, borrowPool);
        const tokenPairInfo = yield (0, src_1.getTokenPairInfo)(config_1.indexerClient, tokenPair);
        // loop through escrows
        let loansInfo = yield (0, src_1.getLoansInfo)(config_1.indexerClient, tokenPair, tokenPairInfo, collateralPoolInfo, borrowPoolInfo, conversionRate);
        let loans = loansInfo.loans;
        let nextToken = loansInfo.nextToken;
        //get Loans specified to User
        loans.forEach((loan) => {
            if (loan.userAddress == accountAddr) {
                AllUserLoan.push({
                    loanEscrow: loan.escrowAddress,
                    borrowedAmount: Number(loan.borrowed),
                    collateralBalance: Number(loan.collateralBalance),
                    borrowedBalance: Number(loan.borrowBalance)
                });
            }
        });
        while (nextToken !== undefined) {
            // next loop of escrows
            loansInfo = yield (0, src_1.getLoansInfo)(config_1.indexerClient, tokenPair, tokenPairInfo, collateralPoolInfo, borrowPoolInfo, conversionRate, nextToken);
            loans = loansInfo.loans;
            nextToken = loansInfo.nextToken;
            loans.forEach((loan) => {
                if (loan.userAddress == accountAddr) {
                    AllUserLoan.push({
                        loanEscrow: loan.escrowAddress,
                        borrowedAmount: Number(loan.borrowed),
                        collateralBalance: Number(loan.collateralBalance),
                        borrowedBalance: Number(loan.borrowBalance)
                    });
                }
            });
        }
        return AllUserLoan;
    });
}
exports.getAllLoanInfo = getAllLoanInfo;
