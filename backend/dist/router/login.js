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
exports.loginRoute = void 0;
const express_1 = __importDefault(require("express"));
const User_1 = require("../models/User");
const router = express_1.default.Router();
router.post("/", function (req, res) {
    const accountAddr = req.body.accountAddr;
    const password = req.body.password;
    User_1.UserModel.findOne({ accountAddr: accountAddr }, function (err, user) {
        if (!user) {
            res.status(401).json({
                message: "Auth failed,could not find email"
            });
        }
        else {
            user.checkPassword(password, (err, ismatch) => {
                if (!ismatch) {
                    res.status(401).json({
                        message: "account address and password do not match"
                    });
                }
                else {
                    user.generatetoken((err, token) => __awaiter(this, void 0, void 0, function* () {
                        yield User_1.UserModel.updateOne({ _id: user._id }, { $set: { token: token } });
                        res.status(201)
                            .send({
                            message: "Successful Login",
                            token: token
                        });
                    }));
                }
            });
        }
    });
});
exports.loginRoute = router;
