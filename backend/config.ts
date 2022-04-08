import { Algodv2, generateAccount, Indexer, mnemonicToSecretKey } from "algosdk";


export const Address="4PFBQOUG4AQPAIYEYOIVOOFCQXYUPVVW3UECD5MS3SEOM64LOWB5GFWDZM"

export const algodClient = new Algodv2(String(process.env.API_KEY), "https://testnet-api.algonode.cloud/", 443);
export const indexerClient = new Indexer(String(process.env.API_KEY), "https://testnet-idx.algonode.cloud/", 443);