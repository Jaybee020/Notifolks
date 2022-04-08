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
const mongoose_1 = require("mongoose");
const authenticate_1 = require("../middleware/authenticate");
const crypto_js_1 = require("crypto-js");
const router = express_1.default.Router();
router.get("", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send("Reached Here");
}));
//gets Loan of Specified User
router.get("/getloan/:accountAddr", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const accountAddr = req.params.accountAddr;
            const AllLoanInfo = yield (0, getAllLoanInfo_1.getAllLoanInfo)(accountAddr);
            return res.status(200).send({
                status: true,
                message: AllLoanInfo
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
router.get("/loanAlert/userId/:userId", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userId = req.params.userId;
            const loanInfos = yield UserAlert_1.UserAlertModel.find({ user: new mongoose_1.Types.ObjectId(userId) }).populate("User");
            if (loanInfos) {
                res.status(200).send({
                    status: true,
                    message: loanInfos.map((loanInfo) => {
                        return {
                            executed: loanInfo.executed,
                            user: loanInfo.user,
                            escrowAddr: loanInfo.escrowAddr,
                            reminderHealthRatio: loanInfo.reminderHealthRatio,
                            tokenPairKeys: app_1.tokenPairKeys[loanInfo.tokenPairIndex]
                        };
                    })
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
//get Alerts by token
router.get("/loanAlert/tokenPairIndex/:tokenPairIndex", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const tokenPairIndex = req.params.tokenPairIndex;
            if (!tokenPairIndex) {
                return res.status(400).send({
                    status: false,
                    message: "Invalid account Address given",
                });
            }
            const loanInfos = yield UserAlert_1.UserAlertModel.find({ tokenPairIndex: parseInt(tokenPairIndex) }).populate("User");
            if (loanInfos) {
                res.status(200).send({
                    status: true,
                    message: loanInfos.map((loanInfo) => {
                        return {
                            executed: loanInfo.executed,
                            user: loanInfo.user,
                            escrowAddr: loanInfo.escrowAddr,
                            reminderHealthRatio: loanInfo.reminderHealthRatio,
                            tokenPairKeys: app_1.tokenPairKeys[loanInfo.tokenPairIndex]
                        };
                    })
                });
            }
            else {
                res.status(400).send({
                    status: false,
                    message: "Alert for specified index does not exist"
                });
            }
        }
        catch (error) {
            console.error(error);
        }
    });
});
// creates a new alert document with escrow
router.post("/createloanAlert", authenticate_1.authenticatetoken, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { escrowAddr, tokenPairIndex, reminderHealthRatio, password } = req.body;
            if (!escrowAddr || !tokenPairIndex || !password) {
                return res.status(400).send({
                    status: false,
                    message: "Please provide the required fields",
                });
            } //Check whether all the fields are passed
            if (!(0, algosdk_1.isValidAddress)(escrowAddr)) {
                return res.status(400).send({
                    status: false,
                    message: "Invalid account Address given",
                });
            }
            const loanInfo = yield (0, getCurrentLoanInfo_1.getCurrentLoanInfo)(escrowAddr, app_1.tokenPairKeys[parseInt(tokenPairIndex)]);
            if (!loanInfo) {
                return res.status(400).send({
                    status: true,
                    message: "Could not find loan"
                });
            }
            if (req.user) {
                req.user.checkPassword(password, function (err, isMatch) {
                    var _a, _b, _c;
                    return __awaiter(this, void 0, void 0, function* () {
                        if (!isMatch) {
                            return res.status(401).json({
                                message: "Username and password do not match"
                            });
                        }
                        const accountAddr = String((_a = req.user) === null || _a === void 0 ? void 0 : _a.accountAddr);
                        const userId = new mongoose_1.Types.ObjectId((_b = req.user) === null || _b === void 0 ? void 0 : _b._id);
                        const bytes = crypto_js_1.AES.decrypt(String((_c = req.user) === null || _c === void 0 ? void 0 : _c.mnemonic_phrase), password);
                        var originalmnemonic = bytes.toString(CryptoJS.enc.Utf8);
                        const sender = (0, algosdk_1.mnemonicToSecretKey)(originalmnemonic);
                        //Transaction for creating loanAlert
                        try {
                            const params = yield config_2.algodClient.getTransactionParams().do();
                            const loanCreateTxn = (0, utils_1.transferAlgoOrAsset)(79413584, accountAddr, config_1.Address, 1e5, params);
                            const signedTxn = loanCreateTxn.signTxn(sender.sk);
                            const txId = (yield config_2.algodClient.sendRawTransaction(signedTxn).do()).txId;
                            yield (0, algosdk_1.waitForConfirmation)(config_2.algodClient, txId, 1000);
                        }
                        catch (error) {
                            return res.status(400).send({
                                status: false,
                                message: "Error in transaction occured"
                            });
                        }
                        yield UserAlert_1.UserAlertModel.create({
                            user: userId,
                            escrowAddr: escrowAddr,
                            reminderHealthRatio: reminderHealthRatio,
                            tokenPairIndex: parseInt(tokenPairIndex)
                        });
                        res.status(200).send({
                            status: true,
                            message: "Successful Creation of Alert"
                        });
                    });
                });
            }
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
router.post('/newLoan', authenticate_1.authenticatetoken, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { collateralAmount, borrowAmount, tokenPairIndex, password } = req.body;
            if (!collateralAmount || !borrowAmount || tokenPairIndex || !password) {
                return res.status(400).send({
                    status: false,
                    message: "Please provide the required fields",
                });
            }
            if (req.user) {
                req.user.checkPassword(password, function (err, isMatch) {
                    var _a, _b;
                    return __awaiter(this, void 0, void 0, function* () {
                        if (!isMatch) {
                            return res.status(401).json({
                                message: "Username and password do not match"
                            });
                        }
                        const accountAddr = (_a = req.user) === null || _a === void 0 ? void 0 : _a.accountAddr;
                        const bytes = crypto_js_1.AES.decrypt(String((_b = req.user) === null || _b === void 0 ? void 0 : _b.mnemonic_phrase), password);
                        var originalmnemonic = bytes.toString(CryptoJS.enc.Utf8);
                        const key = app_1.tokenPairKeys[parseInt(tokenPairIndex)];
                        const escrow = yield (0, takeLoan_1.takeLoan)(String(accountAddr), parseInt(collateralAmount), parseInt(borrowAmount), key, originalmnemonic);
                        return res.status(200).send({
                            status: true,
                            escrowAddr: escrow
                        });
                    });
                });
            }
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
            console.log(Date.now());
            const loanInfo = yield (0, getCurrentLoanInfo_1.getCurrentLoanInfo)(escrowAddr, tokenPairKey);
            console.log(Date.now());
            console.log("ReachedHere");
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
router.post("/repayLoan", authenticate_1.authenticatetoken, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let { escrowAddr, repayAmount, tokenPairIndex, password } = req.body;
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
        let tokenPairKey = app_1.tokenPairKeys[tokenPairIndex];
        try {
            // repay loan
            if (req.user) {
                req.user.checkPassword(password, function (err, isMatch) {
                    var _a, _b;
                    return __awaiter(this, void 0, void 0, function* () {
                        if (!isMatch) {
                            return res.status(401).json({
                                message: "Username and password do not match"
                            });
                        }
                        //decrypt to get key
                        const accountAddr = (_a = req.user) === null || _a === void 0 ? void 0 : _a.accountAddr;
                        const bytes = crypto_js_1.AES.decrypt(String((_b = req.user) === null || _b === void 0 ? void 0 : _b.mnemonic_phrase), password);
                        var originalmnemonic = bytes.toString(CryptoJS.enc.Utf8);
                        const key = app_1.tokenPairKeys[parseInt(tokenPairIndex)];
                        const repay_status = yield (0, repay_1.repayLoan)(escrowAddr, repayAmount, tokenPairKey, originalmnemonic);
                        console.log("ReachedHere2");
                        if (repay_status) {
                            return res.status(200).send({
                                status: true,
                                message: "Loan repayed"
                            });
                        }
                    });
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
