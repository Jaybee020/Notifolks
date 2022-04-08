"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.indexerClient = exports.algodClient = exports.Address = void 0;
const algosdk_1 = require("algosdk");
exports.Address = "4PFBQOUG4AQPAIYEYOIVOOFCQXYUPVVW3UECD5MS3SEOM64LOWB5GFWDZM";
exports.algodClient = new algosdk_1.Algodv2(String(process.env.API_KEY), "https://testnet-api.algonode.cloud/", 443);
exports.indexerClient = new algosdk_1.Indexer(String(process.env.API_KEY), "https://testnet-idx.algonode.cloud/", 443);
