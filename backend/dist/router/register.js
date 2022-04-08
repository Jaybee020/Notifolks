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
exports.registerRoute = exports.EMAIL_SENT_FROM = void 0;
const express_1 = __importDefault(require("express"));
const User_1 = require("../models/User");
const algosdk_1 = require("algosdk");
const router = express_1.default.Router();
exports.EMAIL_SENT_FROM = "olayinkaganiyu1@gmail.com";
router.get("/", function (req, res) {
    res.status(200).send("Welcome to register page");
});
router.post("/", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const accountAddr = req.body.accountAddr;
        const email = req.body.email.toLowerCase();
        const password = req.body.password;
        const mnemonic = req.body.mnemonic;
        if (!(0, algosdk_1.isValidAddress)(accountAddr)) {
            res.status(400).send({
                message: "The address is not a valid address"
            });
        }
        const existingUser = yield User_1.UserModel.findOne({ accountAddr: accountAddr });
        if ((existingUser === null || existingUser === void 0 ? void 0 : existingUser.accountAddr) == accountAddr) {
            return res.status(400).send({
                message: "This account already exists"
            });
        }
        else {
            User_1.UserModel.create({
                accountAddr: accountAddr,
                email: email,
                password: password,
                mnemonic_phrase: mnemonic
            }, function (err, newUser) {
                if (err) {
                    return res.status(400).json({
                        message: "Could not create new user"
                    });
                }
                res.status(200).send({
                    message: "Your account was succesfully created"
                });
            });
        }
    });
});
exports.registerRoute = router;
