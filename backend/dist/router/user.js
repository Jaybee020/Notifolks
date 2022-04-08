"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authenticate_1 = require("../middleware/authenticate");
const router = express_1.default.Router();
//check if request user is authenticated
router.get("/auth", authenticate_1.authenticatetoken, (req, res) => {
    var _a, _b, _c;
    res.status(200).json({
        userData: {
            username: (_a = req.user) === null || _a === void 0 ? void 0 : _a.accountAddr,
            email: (_b = req.user) === null || _b === void 0 ? void 0 : _b.email,
            date_created: (_c = req.user) === null || _c === void 0 ? void 0 : _c.date_created.toDateString()
        },
    });
});
