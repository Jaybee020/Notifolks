"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticatetoken = void 0;
const User_1 = require("../models/User");
const authenticatetoken = function (req, res, next) {
    //auth header should take the form "JWT TOKEN_VALUE"
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(" ")[1];
        User_1.UserModel.findByToken(token, (err, user) => {
            if (err) {
                console.error(err);
            }
            if (!user) {
                res.status(400).send({ auth: false, message: "Wrong Header!" });
            }
            else {
                req.token = token;
                req.user = user;
                next();
            }
        });
    }
    else {
        res.status(400).send({ auth: false, message: "Wrong Header!" });
    }
};
exports.authenticatetoken = authenticatetoken;
