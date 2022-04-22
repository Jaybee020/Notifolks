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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.folksFinanceRouter = void 0;
const express_1 = __importDefault(require("express"));
const getCurrentLoanInfo_1 = require("../helpers/getCurrentLoanInfo");
const UserAlert_1 = require("../models/UserAlert");
const app_1 = require("../app");
const algosdk_1 = require("algosdk");
const takeLoan_1 = require("../helpers/takeLoan");
const config_1 = require("../config");
const repay_1 = require("../helpers/repay");
const getAllLoanInfo_1 = require("../helpers/getAllLoanInfo");
const utils_1 = require("../src/v1/utils");
const config_2 = require("../config");
const findtxn_1 = require("../helpers/findtxn");
const encodeTxn_1 = require("../helpers/encodeTxn");
const router = express_1.default.Router();
router.get("", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send("Reached Here");
}));
//gets Loan of Specified User
router.get("/getloan/:accountAddr/:tokenPairIndex", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const accountAddr = req.params.accountAddr;
            if (!(0, algosdk_1.isValidAddress)(accountAddr)) {
                return res.status(400).send({
                    status: false,
                    message: "Address is not valid"
                });
            }
            const tokenPairIndex = parseInt(req.params.tokenPairIndex);
            const AllLoanInfo = yield (0, getAllLoanInfo_1.getAllLoanInfo)(accountAddr, app_1.tokenPairKeys[tokenPairIndex]);
            const foundUserLoanAlert = yield UserAlert_1.UserAlertModel.find({ accountAddr: accountAddr, tokenPairIndex: tokenPairIndex });
            const data = AllLoanInfo.map((info) => {
                var _a, _b, _c;
                return Object.assign(Object.assign({}, info), { alertStatus: foundUserLoanAlert.map((info) => info.escrowAddr).includes(info.loanEscrow), executed: (_a = (foundUserLoanAlert.find((loanalert) => loanalert.escrowAddr == info.loanEscrow))) === null || _a === void 0 ? void 0 : _a.executed, dateCreated: (_b = (foundUserLoanAlert.find((loanalert) => loanalert.escrowAddr == info.loanEscrow))) === null || _b === void 0 ? void 0 : _b.dateCreated, dateExecuted: (_c = (foundUserLoanAlert.find((loanalert) => loanalert.escrowAddr == info.loanEscrow))) === null || _c === void 0 ? void 0 : _c.dateExecetued });
            });
            return res.status(200).send({
                status: true,
                message: data
            });
        }
        catch (error) {
            return res.status(400).send({
                status: false,
                message: "Could not get loanInfo of accountAddr"
            });
        }
    });
});
//get Alerts by account address
router.get("/loanAlert/accountAddr/accountAddr", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const accountAddr = req.params.accountAddr;
            const loanInfos = yield UserAlert_1.UserAlertModel.find({ accountAddr: accountAddr });
            if (loanInfos) {
                res.status(200).send({
                    status: true,
                    message: loanInfos
                });
            }
            else {
                res.status(400).send({
                    status: false,
                    message: "Alert for specified account does not exist"
                });
            }
        }
        catch (error) {
            console.error(error);
        }
    });
});
// creates a new alert document with escrow
router.post("/createloanAlertTransaction", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { escrowAddr, tokenPairIndex, accountAddr } = req.body;
            if (!escrowAddr || !tokenPairIndex || !accountAddr) {
                return res.status(400).send({
                    status: false,
                    message: "Please provide the required fields",
                });
            } //Check whether all the fields are passed
            if (!(0, algosdk_1.isValidAddress)(escrowAddr) || !(0, algosdk_1.isValidAddress)(accountAddr)) {
                return res.status(400).send({
                    status: false,
                    message: "Invalid account Address given",
                });
            }
            const loanInfo = yield (0, getCurrentLoanInfo_1.getCurrentLoanInfo)(escrowAddr, app_1.tokenPairKeys[parseInt(tokenPairIndex)]);
            console.log(Number(loanInfo.healthFactor) / (1e14));
            if (!loanInfo) {
                return res.status(400).send({
                    status: true,
                    message: "Could not find loan"
                });
            }
            //Transaction for creating loanAlert
            const params = yield config_2.algodClient.getTransactionParams().do();
            const loanCreateTxn = (0, utils_1.transferAlgoOrAsset)(79413584, accountAddr, config_1.Address, 1e5, params);
            res.status(200).send({
                status: true,
                data: (0, encodeTxn_1.encodeTxn)(loanCreateTxn),
                currentHealthRatio: Number(loanInfo.healthFactor) / (1e14)
            });
        }
        catch (error) {
            console.error(error);
            res.status(400).send({
                status: false,
                message: "Failed"
            });
        }
    });
});
router.post("/createloanAlert", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { txId, email, accountAddr, escrowAddr, reminderHealthRatio, tokenPairIndex } = req.body;
        const foundAlert = yield UserAlert_1.UserAlertModel.findOne({
            transactionId: txId
        });
        if (foundAlert) {
            return res.status(200).send({
                status: true,
                message: "Transaaction Id has been used to create alert"
            });
        }
        let txIdSender = yield (0, findtxn_1.findReceiptTxn)(accountAddr, txId);
        if (!txIdSender) {
            return res.status(400).send({
                message: "Couldn't find receipt transaction"
            });
        }
        if (txIdSender != accountAddr) {
            return res.status(400).send({
                message: "Sender address and transaction Id do not match"
            });
        }
        yield UserAlert_1.UserAlertModel.create({
            accountAddr: accountAddr,
            email: email,
            escrowAddr: escrowAddr,
            reminderHealthRatio: reminderHealthRatio,
            transactionId: txId,
            tokenPairIndex: parseInt(tokenPairIndex)
        });
        return res.status(200).send({
            status: true,
            message: "Successful Creation of Alert"
        });
    });
});
router.post('/newLoanTxn', function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { collateralAmount, borrowAmount, tokenPairIndex, accountAddr } = req.body;
            if (!collateralAmount || !borrowAmount || !tokenPairIndex || !accountAddr) {
                return res.status(400).send({
                    status: false,
                    message: "Please provide the required fields",
                });
            }
            const key = app_1.tokenPairKeys[parseInt(tokenPairIndex)];
            const data = yield (0, takeLoan_1.takeLoan)(String(accountAddr), parseInt(collateralAmount), parseInt(borrowAmount), key);
            return res.status(200).send({
                status: true,
                data: data
            });
        }
        catch (error) {
            console.error(error);
            return res.status(400).send({
                status: false,
                message: "Couldn't take a new Loan"
            });
        }
    });
});
//Get loan info of specified escrowAddress and tokenPair
router.get("/currentLoanInfo/:escrowAddr/:tokenPairIndex", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const escrowAddr = req.params.escrowAddr;
        let tokenPairIndex = parseInt(req.params.tokenPairIndex);
        if (!escrowAddr || !String(tokenPairIndex)) {
            return res.status(400).send({
                status: false,
                message: "Please provide the required fields",
            });
        }
        if (!(0, algosdk_1.isValidAddress)(escrowAddr)) {
            return res.status(400).send({
                status: false,
                message: "Invalid account Address given",
            });
        }
        let tokenPairKey = app_1.tokenPairKeys[tokenPairIndex];
        try {
            const loanInfo = yield (0, getCurrentLoanInfo_1.getCurrentLoanInfo)(escrowAddr, tokenPairKey);
            return res.status(200).send({
                status: true,
                message: {
                    escrowAddress: escrowAddr,
                    userAddress: loanInfo.userAddress,
                    borrowed: Number(loanInfo.borrowed),
                    collateralBalance: Number(loanInfo.collateralBalance),
                    borrowBalance: Number(loanInfo.borrowBalance),
                    borrowBalanceLiquidationThreshold: Number(loanInfo.borrowBalanceLiquidationThreshold),
                    healthFactor: Number(loanInfo.healthFactor)
                }
            });
        }
        catch (error) {
            return res.status(400).send({
                status: false,
                message: "Could not fetch loan of specified properties "
            });
        }
    });
});
router.post("/repayLoanTxn", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let { escrowAddr, repayAmount, tokenPairIndex, accountAddr } = req.body;
        tokenPairIndex = parseInt(tokenPairIndex);
        if (!escrowAddr || !String(tokenPairIndex)) {
            return res.status(400).send({
                status: false,
                message: "Please provide the required fields",
            });
        }
        if (!(0, algosdk_1.isValidAddress)(escrowAddr)) {
            return res.status(400).send({
                status: false,
                message: "Invalid account Address given",
            });
        }
        try {
            // repay loan
            const key = app_1.tokenPairKeys[tokenPairIndex];
            console.log(key);
            const repaytxn = yield (0, repay_1.repayLoan)(escrowAddr, Number(repayAmount), key, accountAddr);
            if (repaytxn) {
                return res.status(200).send({
                    status: true,
                    data: repaytxn,
                });
            }
        }
        catch (error) {
            return res.status(400).send({
                status: false,
                message: "Could not repay loan "
            });
        }
    });
});
exports.folksFinanceRouter = router;
