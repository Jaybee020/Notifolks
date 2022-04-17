"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAlertModel = void 0;
const mongoose_1 = require("mongoose");
const UserAlertSchema = new mongoose_1.Schema({
    accountAddr: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    escrowAddr: {
        type: String,
        required: true
    },
    tokenPairIndex: {
        type: Number,
        required: true
    },
    executed: {
        type: Boolean,
        required: true,
        default: false
    },
    reminderHealthRatio: {
        type: String,
        required: true,
    },
    dateCreated: {
        type: Date,
        default: Date.now
    },
    dateExecetued: {
        type: Date,
        required: false
    },
    transactionId: {
        type: String,
        required: true
    },
});
exports.UserAlertModel = (0, mongoose_1.model)('UserAlertModel', UserAlertSchema);
