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
exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = require("jsonwebtoken");
const crypto_js_1 = require("crypto-js");
const UserSchema = new mongoose_1.Schema({
    accountAddr: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
    },
    date_created: {
        type: Date,
        default: Date.now
    },
    token: {
        type: String
    },
    mnemonic_phrase: {
        type: String,
        required: true
    }
});
//hash password before saving it to db and using it to encrypt mnemonic phrase
UserSchema.pre("save", function (next) {
    const user = this;
    if (user.isModified("password")) {
        bcrypt_1.default.genSalt(10, (err, salt) => {
            if (err) {
                return next(err);
            }
            bcrypt_1.default.hash(user.password, salt, (err, hash) => {
                if (err) {
                    return next(err);
                }
                user.mnemonic_phrase = crypto_js_1.AES.encrypt(user.mnemonic_phrase, user.password).toString(); //encrypting with password string
                user.password = hash;
                next();
            });
        });
    }
});
//compare passwords
UserSchema.methods.checkPassword = function (password, cb) {
    var user = this;
    bcrypt_1.default.compare(password, user.password, function (err, isMatch) {
        if (err) {
            return cb(err);
        }
        console.log(isMatch);
        cb(null, isMatch);
    });
};
UserSchema.methods.generatetoken = function (cb) {
    const user = this;
    console.log(process.env.LOGIN_SECRET);
    var token = (0, jsonwebtoken_1.sign)(user._id.toString(), String(process.env.LOGIN_SECRET));
    console.log(token);
    cb(null, token);
};
UserSchema.statics.findByToken = function (token, cb) {
    var user = this;
    try {
        const decode = (0, jsonwebtoken_1.verify)(token, String(process.env.LOGIN_SECRET));
        user.findOne({ _id: decode, token: token }, function (err, user) {
            if (err) {
                console.error(err);
            }
            cb(null, user);
        });
    }
    catch (err) {
        cb(err, null);
    }
};
UserSchema.methods.deletetoken = function (cb) {
    return __awaiter(this, void 0, void 0, function* () {
        var user = this;
        user.updateOne({ $unset: { token: "1" } }, function (err, user) {
            if (err)
                return cb(err);
            cb(null, user);
        });
    });
};
exports.UserModel = (0, mongoose_1.model)('User', UserSchema);
