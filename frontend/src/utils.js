import algosdk, { waitForConfirmation } from "algosdk";
import { useEffect } from "react";
import WalletConnect from "@walletconnect/client";
import MyAlgoConnect from "@randlabs/myalgo-connect";
import WalletConnectQRCodeModal from "algorand-walletconnect-qrcode-modal";
import { encode, decode } from "@msgpack/msgpack";
import axios from "axios";

// Functions
const constrictAddr = (address) =>
  address.substring(0, 5) + "..." + address.substring(51, 58);

const constrictAddrLong = (address) =>
  address.substring(0, 20) + "..." + address.substring(50, 58);

const NumberWithCommas = (x, dp = 6) => {
  if (x.toString().includes(".")) {
    const y = x.toString().split(".");
    return (
      y[0]?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
      "." +
      y[1]?.toString().substring(0, dp)
    );
  } else {
    return x?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
};

function useOutsideAlerter(ref, ref2, callback) {
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        ref.current &&
        !ref.current.contains(event.target) &&
        ref2.current &&
        !ref2.current.contains(event.target)
      ) {
        callback();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);
}

const TokenPairs = [
  "ALGO-USDC",
  "ALGO-USDt",
  "ALGO-goBTC",
  "ALGO-goETH",
  "ALGO-xUSD",
  "USDC-ALGO",
  "USDC-USDt",
  "USDC-goBTC",
  "USDC-goETH",
  "USDC-xUSD",
  "USDt-ALGO",
  "USDt-USDC",
  "USDt-goBTC",
  "USDt-goETH",
  "USDt-xUSD",
  "goBTC-ALGO",
  "goBTC-USDC",
  "goBTC-USDt",
  "goBTC-goETH",
  "goBTC-xUSD",
  "goETH-ALGO",
  "goETH-USDC",
  "goETH-USDt",
  "goETH-goBTC",
  "goETH-xUSD",
  "xUSD-ALGO",
  "xUSD-USDC",
  "xUSD-USDt",
  "xUSD-goBTC",
  "xUSD-goETH",
];

const AssetIDs = [
  { name: "USDC", assetID: 67395862 },
  { name: "USDt", assetID: 62483934 },
  { name: "goBTC", assetID: 67396528 },
  { name: "goETH", assetID: 19386452 },
  { name: "xUSD", assetID: 62281549 },
];

// Connections
const myAlgoConnect = new MyAlgoConnect();
const algodClient = new algosdk.Algodv2(
  "",
  "https://node.testnet.algoexplorerapi.io",
  ""
);
const indexerClient = new algosdk.Indexer(
  "",
  "https://algoindexer.testnet.algoexplorerapi.io",
  ""
);
const connector = new WalletConnect({
  bridge: "https://bridge.walletconnect.org",
  qrcodeModal: WalletConnectQRCodeModal,
});

const createTransaction = (amount, recipientAddr, senderAddr, currency) => {
  const returnData = algodClient
    .getTransactionParams()
    .do()
    .then((suggestedParams) => {
      if (currency === "ALGO") {
        const transaction = algosdk.makePaymentTxnWithSuggestedParamsFromObject(
          {
            from: senderAddr,
            to: recipientAddr,
            amount: amount * 1000000,
            suggestedParams,
          }
        );
        return transaction;
      } else if (currency === "CHOICE") {
        const transaction =
          algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
            from: senderAddr,
            to: recipientAddr,
            amount: amount,
            assetIndex: 71501663,
            suggestedParams,
          });
        return transaction;
      }
    })
    .catch((err) =>
      alert("An error occured while fetching transaction params!")
    );

  return returnData;
};

const walletAddr = localStorage.getItem("walletAddr");

const GetAssets = async () => {
  if (!!walletAddr) {
    const myAccountInfo = await indexerClient
      .lookupAccountByID(walletAddr)
      .do();

    const allAssets = (await myAccountInfo.account.assets)
      ? myAccountInfo.account.assets
      : [];

    const AlgoBalance = await myAccountInfo.account.amount;

    const assets = [];
    allAssets.map((item) => {
      const check = AssetIDs.find(
        (element) => element["assetID"] === item["asset-id"]
      );
      if (!!check) {
        assets.push({ ...check, balance: item?.amount / 1000000 });
      }
    });

    assets.push({ name: "ALGO", balance: AlgoBalance / 1000000 });

    return assets;
  }
};

// Signing Multiple Transactions
const MultiSigner = async (txns, setErrorMsg) => {
  try {
    const decodedTxns = txns.map((txn) =>
      algosdk.decodeUnsignedTransaction(new Uint8Array(txn)).toByte()
    );

    myAlgoConnect
      .signTransaction(decodedTxns)
      .then(async (signedTxns) => {
        const blobArray = signedTxns.map((item) => item.blob);

        algodClient
          .sendRawTransaction(blobArray)
          .do()
          .then((submittedTxn) => {
            setErrorMsg("success");
          })
          .catch((error) => {
            setErrorMsg(error.message);
          });
      })
      .catch((error) => {
        setErrorMsg(error.message);
      });
  } catch (error) {
    setErrorMsg(error.message);
  }
};

const SignAlertTxn = async (txn, SetLoanTxId) => {
  const decoded = algosdk
    .decodeUnsignedTransaction(new Uint8Array(txn?.data))
    .toByte();

  myAlgoConnect.signTransaction(decoded).then(async (signedTxn) => {
    algodClient
      .sendRawTransaction(signedTxn.blob)
      .do()
      .then((submittedTxn) => {
        console.log(submittedTxn);
        SetLoanTxId(submittedTxn?.txId, txn?.currentHealthRatio);
      })
      .catch((error) => {
        console.log(error.message);
      });
  });
};

const MultiSigner3 = async (txns, setErrorMsg) => {
  try {
    const decodedTxns = txns.map((txn) =>
      algosdk.decodeUnsignedTransaction(new Uint8Array(txn)).toByte()
    );

    myAlgoConnect
      .signTransaction(decodedTxns)
      .then(async (signedTxns) => {
        const blobArray = signedTxns.map((item) => item.blob);
        const txId = await algodClient.sendRawTransaction(blobArray).do();
        setErrorMsg("success");
      })
      .catch((error) => {
        setErrorMsg(error.message);
      });
  } catch (error) {
    setErrorMsg(error.message);
  }
};

// Signing Other Transactions
const MultiSigner2 = async (txns, SetError) => {
  const UnSigned = txns.unsignedUserTxn;
  const Signed = new Uint8Array(txns.signedEscrowTxn);

  try {
    const decodedTxns = UnSigned.map((txn) =>
      algosdk.decodeUnsignedTransaction(new Uint8Array(txn)).toByte()
    );

    myAlgoConnect
      .signTransaction(decodedTxns)
      .then(async (signedTxns) => {
        const blobArray = signedTxns.map((item) => item.blob);

        algodClient
          .sendRawTransaction([blobArray[0], Signed, blobArray[1]])
          .do()
          .then(async (submittedTxn) => {
            console.log(
              `https://testnet.algoexplorer.io/tx/${submittedTxn.txId}`
            );

            await waitForConfirmation(algodClient, submittedTxn.txId, 1000);

            MultiSigner3(txns?.borrowTxns, SetError);
          })
          .catch((error) => {
            console.log(error.message);
          });
      })
      .catch((error) => {
        console.log(error.message);
      });
  } catch (error) {
    console.log(error.message);
  }
};

export {
  TokenPairs,
  GetAssets,
  AssetIDs,
  MultiSigner,
  constrictAddr,
  MultiSigner2,
  SignAlertTxn,
  createTransaction,
  NumberWithCommas,
  constrictAddrLong,
  useOutsideAlerter,
  //
  myAlgoConnect,
  algodClient,
  connector,
};
