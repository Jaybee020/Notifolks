"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcConversionRate = exports.calcHealthFactor = exports.calcInterestIndex = exports.calcUtilizationRatio = exports.calcBorrowBalance = exports.calcThreshold = exports.divVariable = void 0;
const utils_1 = require("../utils");
const DECIMALS = BigInt(1e14);
const SECONDS_IN_YEAR = 365 * 24 * 60 * 60;
function mul14(n1, n2) {
    return (n1 * n2) / BigInt(1e14);
}
function mulVariable(n1, n2, dec) {
    return (n1 * n2) / BigInt(10 ** dec);
}
function div14(n1, n2) {
    return (n1 * BigInt(1e14)) / n2;
}
function divVariable(n1, n2, dec) {
    return (n1 * BigInt(10 ** dec)) / n2;
}
exports.divVariable = divVariable;
/**
 * Calculates the utilization ratio of the pool.
 * @param totalBorrows (Xdp)
 * @param totalDeposits (Xdp)
 * @return utilizationRate (14dp)
 */
function calcUtilizationRatio(totalBorrows, totalDeposits) {
    if (totalDeposits === BigInt(0))
        return BigInt(0);
    return div14(totalBorrows, totalDeposits);
}
exports.calcUtilizationRatio = calcUtilizationRatio;
/**
 * Calculates the current interest index. If epsilon undefined then deposit interest index, else borrow interest index.
 * @param interestIndex (14dp)
 * @param interestRate (14dp)
 * @param latestUpdate (0dp)
 * @param epsilon (14dp)
 * @return interestIndex (14dp)
 */
function calcInterestIndex(interestIndex, interestRate, latestUpdate, epsilon) {
    const dt = BigInt((0, utils_1.unixTime)()) - latestUpdate;
    const interest = (interestRate / BigInt(SECONDS_IN_YEAR)) * dt;
    return mul14(interestIndex, DECIMALS + (epsilon !== undefined ? mul14(epsilon, interest) : interest));
}
exports.calcInterestIndex = calcInterestIndex;
/**
 * Calculates the threshold of under-collaterization of the loan
 * @param collateralAmount (Xdp)
 * @param depositInterestIndex (14dp)
 * @param s2 (14dp)
 * @param conversionRate (<r_dec>dp)
 * @param conversionRateDec (0dp)
 * @return threshold (Xdp)
 */
function calcThreshold(collateralAmount, depositInterestIndex, s2, conversionRate, conversionRateDec) {
    return mulVariable(mul14(mul14(collateralAmount, depositInterestIndex), s2), conversionRate, conversionRateDec);
}
exports.calcThreshold = calcThreshold;
/**
 * Calculates the borrow balance of the loan at time t
 * @param borrowBalanceAtLastOperation (Xdp)
 * @param borrowInterestIndex (14dp)
 * @param borrowInterestIndexAtLastOperation (14dp)
 * @return borrowBalance (Xdp)
 */
function calcBorrowBalance(borrowBalanceAtLastOperation, borrowInterestIndex, borrowInterestIndexAtLastOperation) {
    return mul14(borrowBalanceAtLastOperation, div14(borrowInterestIndex, borrowInterestIndexAtLastOperation)) + BigInt(1);
}
exports.calcBorrowBalance = calcBorrowBalance;
/**
 * Calculates the health factor of the loan at time t
 * @param threshold (Xdp)
 * @param borrowBalance (Xdp)
 * @return healthFactor (14dp)
 */
function calcHealthFactor(threshold, borrowBalance) {
    return div14(threshold, borrowBalance);
}
exports.calcHealthFactor = calcHealthFactor;
/**
 * Calculate the conversion rate between two assets
 * @param collateralPrice (Xdp)
 * @param borrowPrice (Xdp)
 * @return { rate: bigint, decimals: number } (14dp)
 */
function calcConversionRate(collateralPrice, borrowPrice) {
    let decimals = 18;
    if (collateralPrice >= borrowPrice) {
        let borrowExpPrice = borrowPrice;
        for (; borrowExpPrice < collateralPrice && decimals > 0; decimals--) {
            borrowExpPrice *= BigInt(10);
        }
    }
    const rate = divVariable(collateralPrice, borrowPrice, decimals);
    return { rate, decimals };
}
exports.calcConversionRate = calcConversionRate;
