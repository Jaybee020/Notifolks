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
exports.logoutRoute = void 0;
const express_1 = __importDefault(require("express"));
const authenticate_1 = require("../middleware/authenticate");
const router = express_1.default.Router();
router.post("", authenticate_1.authenticatetoken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    (_a = req.user) === null || _a === void 0 ? void 0 : _a.deletetoken((err, user) => {
        if (err) {
            res.status(400).send({
                message: "Error deleting token, cannot log you out"
            });
        }
        res.status(200).send({ message: "Logging out user" });
    });
}));
exports.logoutRoute = router;
