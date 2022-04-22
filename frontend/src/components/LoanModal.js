import algosdk from "algosdk";
import { useDispatch, useSelector } from "react-redux";
import {
  constrictAddr,
  constrictAddrLong,
  MultiSigner,
  MultiSigner2,
  myAlgoConnect,
  NumberWithCommas,
  SignAlertTxn,
  TokenPairs,
} from "../utils";
import * as EmailValidator from "email-validator";
import React, { useEffect, useState } from "react";

import WalletConnectQRCodeModal from "algorand-walletconnect-qrcode-modal";
import WalletConnect from "@walletconnect/client";
import axios from "axios";
import { HashLoader } from "react-spinners";

const LoanModal = ({ currentPair, assets }) => {
  const dispatch = useDispatch();
  const { openModal, modalData } = useSelector(
    (state) => state.status.loanModal
  );

  const [errorMsg, setErrorMsg] = useState("");

  const [reload, setReload] = useState(false);

  const [repayAmt, setRepayAmt] = useState(0);
  const [loading, setLoading] = useState(false);

  const RepayLoan = async () => {
    if (repayAmt === 0) return;

    setLoading(true);

    const assetBalance = assets.find(
      (item) => item["name"] === TokenPairs[currentPair].split("-")[1]
    ).balance;

    if (assetBalance < repayAmt) {
      setErrorMsg(
        `You do not have sufficient ${
          TokenPairs[currentPair].split("-")[1]
        } to repay loan!`
      );
      return;
    }

    const data = {
      tokenPairIndex: currentPair.toString(),
      accountAddr: localStorage.getItem("walletAddr"),
      escrowAddr: modalData?.loanEscrow,
      repayAmount: repayAmt.toString() + "e6",
    };

    const SetError = (msg) => {
      if (msg === "success") {
        setReload(true);
        setErrorMsg(
          `${repayAmt.toString()}${
            TokenPairs[data?.tokenPairIndex].split("-")[1]
          } successfully repaid 🎈!`
        );
      } else {
        setErrorMsg(msg);
      }
    };

    await axios
      .post(`/folks/repayLoanTxn`, data)
      .then((res) => res?.data?.data)
      .then((txns) => {
        MultiSigner(txns, SetError);
      })
      .catch((err) => {
        setErrorMsg(err?.response?.data?.message);
      });
  };

  const [email, setEmail] = useState("");
  const [reminder, setReminder] = useState(1);

  const GetAlertTxn = async () => {
    setLoading(true);

    const data = {
      tokenPairIndex: currentPair.toString(),
      accountAddr: localStorage.getItem("walletAddr"),
      escrowAddr: modalData?.loanEscrow,
    };

    let txId = "";

    const SetLoanTxId = (txId, currentHealthRatio) => {
      console.log(txId, currentHealthRatio);

      setLoading(false);
      setErrorMsg("");

      dispatch({
        type: "use_modal",
        modalData: {
          ...data,
          txId,
          currentHealthRatio,
          type: "addAlert",
        },
      });
    };

    await axios
      .post(`/folks/createloanAlertTransaction`, data)
      .then((res) => res?.data)
      .then(async (txn) => {
        console.log(txn);
        await SignAlertTxn(txn, SetLoanTxId);

        console.log(txId);
      })
      .catch((err) => {
        setErrorMsg(err?.response?.data?.message);
      });
  };

  const AddAlert = async () => {
    setLoading(true);

    if (!EmailValidator.validate(email)) {
      setErrorMsg("Invalid email address supplied!");
      return;
    }

    if (reminder > modalData?.currentHealthRatio) {
      setErrorMsg("Invalid reminder health ratio! Try a lesser value");
      return;
    }

    const data = {
      tokenPairIndex: modalData?.tokenPairIndex,
      accountAddr: modalData?.accountAddr,
      escrowAddr: modalData?.escrowAddr,
      reminderHealthRatio: reminder,
      email: email,
      txId: modalData?.txId,
    };

    await axios
      .post(`/folks/createloanAlert`, data)
      .then((res) => {
        setReload(true);
        setErrorMsg("Loan alert successfully created 🎈");
      })
      .catch((err) => {
        setErrorMsg(err?.response?.data?.message);
      });
  };

  const GetNewLoan = async () => {
    setLoading(true);

    const assetBalance = assets.find(
      (item) =>
        item["name"] === TokenPairs[modalData?.tokenPairIndex].split("-")[0]
    )?.balance;

    if (
      TokenPairs[modalData?.tokenPairIndex].split("-")[0] === "ALGO" &&
      modalData?.algoBalance < modalData?.collateralAmount
    ) {
      setErrorMsg(`You do not have sufficient ALGO to take loan!`);
      return;
    } else if (!assetBalance || assetBalance < modalData?.collateralAmount) {
      setErrorMsg(
        `You do not have sufficient ${
          TokenPairs[modalData?.tokenPairIndex].split("-")[0]
        } to take loan!`
      );
      return;
    }

    const data = {
      collateralAmount: modalData?.collateralAmount.toString() + "e6",
      borrowAmount: modalData?.borrowAmount.toString() + "e6",
      tokenPairIndex: modalData?.tokenPairIndex.toString(),
      accountAddr: modalData?.accountAddr,
    };

    const SetError = (msg) => {
      if (msg === "success") {
        setReload(true);
        setErrorMsg(
          `${modalData?.borrowAmount.toString()}${
            TokenPairs[data?.tokenPairIndex].split("-")[1]
          } successfully borrowed 🎈!`
        );
      } else {
        if (
          msg.includes(
            "Network request error. Received status 400: TransactionPool"
          )
        ) {
          setErrorMsg("Collateral amount not large enough!");
        } else {
          setErrorMsg(msg);
        }
      }
    };

    await axios
      .post(`/folks/newLoanTxn`, data)
      .then((res) => res?.data?.data)
      .then((txns) => {
        MultiSigner2(txns, SetError);
      })
      .catch((err) => {
        setErrorMsg(err?.response?.data?.message);
      });
  };

  useEffect(() => {
    if (modalData?.type === "newLoan") GetNewLoan();
  }, [modalData]);

  return !!modalData ? (
    modalData?.type === "repayLoan" ? (
      <div
        className="app_modal"
        style={{ display: `${!!openModal ? "flex" : "none"}` }}
      >
        <div className="app_modal_inn">
          {/* Loading Component */}
          {!!loading && (
            <div className="modal_loading_component">
              {!errorMsg ? (
                <>
                  <p className="status_txt">Preparing Transactions</p>
                  <HashLoader color="#5353e6" size={35} />
                </>
              ) : (
                <>
                  <p className="error_txt">{errorMsg}</p>
                  <button
                    onClick={() => {
                      if (!!reload) {
                        window.location.reload();
                      } else {
                        setLoading(false);
                        setErrorMsg("");
                      }
                    }}
                    className="back_to_modal"
                  >
                    Back <i className="ph-arrow-u-up-left"></i>
                  </button>
                </>
              )}
            </div>
          )}

          {/*  */}
          <div className="modal_header_loan">
            <p className="main">Loan Details</p>
          </div>
          <div className="app_modal_main_loan">
            <div className="loan_info_row">
              <div className="loan_info">
                <p className="loan_info_hd">Alert Status</p>
                <p
                  className="loan_info_sub"
                  style={{ fontSize: modalData?.executed && "17px" }}
                >
                  {modalData?.alertStatus
                    ? modalData?.executed
                      ? `Notification sent on ${new Date(
                          modalData?.dateExecuted
                        )
                          .toISOString()
                          .substring(0, 10)} at ${new Date(
                          modalData?.dateExecuted
                        )
                          .toISOString()
                          .substring(11)
                          .slice(0, -5)}`
                      : "Has Alert"
                    : "No Alert"}
                </p>
              </div>
            </div>
            <div className="loan_info_row">
              <div className="loan_info">
                <p className="loan_info_hd">Escrow Address</p>
                <p className="loan_info_sub">
                  {constrictAddr(modalData?.loanEscrow)}
                </p>
              </div>
              <div className="loan_info">
                <p className="loan_info_hd">Borrowed Amount</p>
                <p className="loan_info_sub">
                  {NumberWithCommas(
                    modalData?.borrowedAmount / Math.pow(10, 6)
                  )}
                  <span>{TokenPairs[currentPair]?.split("-")[1]}</span>
                </p>
              </div>
            </div>
            <div className="loan_info_row">
              <div className="loan_info">
                <p className="loan_info_hd">Borrowed Balance</p>
                <p className="loan_info_sub">
                  {" "}
                  {NumberWithCommas(
                    modalData?.borrowedBalance / Math.pow(10, 6)
                  )}
                  <span>{TokenPairs[currentPair]?.split("-")[1]}</span>
                </p>
              </div>
              <div className="loan_info">
                <p className="loan_info_hd">Collateral Balance</p>
                <p className="loan_info_sub">
                  {NumberWithCommas(
                    modalData?.collateralBalance / Math.pow(10, 6)
                  )}
                  <span>{TokenPairs[currentPair]?.split("-")[0]}</span>
                </p>
              </div>
            </div>
          </div>
          <div className="repay_form_row">
            <p>
              Amount to repay
              <span>[{TokenPairs[currentPair]?.split("-")[1]}]</span>
            </p>
            <input
              type="number"
              value={repayAmt}
              onChange={(e) => setRepayAmt(Number(e.target.value))}
              placeholder="Enter amount"
            />
          </div>
          <div className="act_butt_row">
            <button onClick={RepayLoan} className="act_butt">
              Repay Loan
            </button>
            {!modalData?.alertStatus && (
              <button onClick={GetAlertTxn} className="act_butt">
                Create Loan Alert
              </button>
            )}
          </div>
          <button
            onClick={() => dispatch({ type: "close_modal" })}
            className="close_modal"
          >
            Close Modal
          </button>
        </div>
      </div>
    ) : modalData?.type === "newLoan" ? (
      <div
        className="app_modal"
        style={{ display: `${!!openModal ? "flex" : "none"}` }}
      >
        <div className="app_modal_inn">
          {/* Loading Component */}
          {!!loading && (
            <div className="modal_loading_component">
              {!errorMsg ? (
                <>
                  <p className="status_txt">Preparing Transactions</p>
                  <HashLoader color="#5353e6" size={35} />
                </>
              ) : (
                <>
                  <p className="error_txt">{errorMsg}</p>
                  <button
                    onClick={() => {
                      setLoading(false);
                      setErrorMsg("");
                      dispatch({ type: "close_modal" });
                    }}
                    className="back_to_modal"
                  >
                    Back <i className="ph-arrow-u-up-left"></i>
                  </button>
                </>
              )}
            </div>
          )}

          {/*  */}
          <div className="modal_header_loan">
            <p className="main">New Loan Details</p>
          </div>
          <div className="app_modal_main_loan">
            <div className="loan_info_row">
              <div className="loan_info">
                <p className="loan_info_hd">Wallet Address</p>
                <p className="loan_info_sub">
                  {constrictAddr(modalData?.accountAddr)}
                </p>
              </div>
              <div className="loan_info">
                <p className="loan_info_hd">Token pair</p>
                <p className="loan_info_sub">
                  {TokenPairs[modalData?.tokenPairIndex]}
                </p>
              </div>
            </div>
            <div className="loan_info_row">
              <div className="loan_info">
                <p className="loan_info_hd">Collateral Amount</p>
                <p className="loan_info_sub">
                  {modalData?.collateralAmount}
                  <span>{TokenPairs[currentPair]?.split("-")[0]}</span>
                </p>
              </div>
              <div className="loan_info">
                <p className="loan_info_hd">Borrow Amount</p>
                <p className="loan_info_sub">
                  {modalData?.borrowAmount}
                  <span>{TokenPairs[currentPair]?.split("-")[1]}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    ) : modalData?.type === "addAlert" ? (
      <>
        <div
          className="app_modal"
          style={{ display: `${!!openModal ? "flex" : "none"}` }}
        >
          <div className="app_modal_inn">
            {/* Loading Component */}
            {!!loading && (
              <div className="modal_loading_component">
                {!errorMsg ? (
                  <>
                    <p className="status_txt">Preparing Transactions</p>
                    <HashLoader color="#5353e6" size={35} />
                  </>
                ) : (
                  <>
                    <p className="error_txt">{errorMsg}</p>
                    <button
                      onClick={() => {
                        if (!!reload) {
                          window.location.reload();
                        } else {
                          setLoading(false);
                          setErrorMsg("");
                        }
                      }}
                      className="back_to_modal"
                    >
                      Back <i className="ph-arrow-u-up-left"></i>
                    </button>
                  </>
                )}
              </div>
            )}

            {/*  */}
            <div className="modal_header_loan">
              <p className="main">Notification Details</p>
            </div>
            <div className="app_modal_main_loan">
              <div className="loan_info_row">
                <div className="loan_info">
                  <p className="loan_info_hd">Escrow Address</p>
                  <p className="loan_info_sub">
                    {constrictAddr(modalData?.escrowAddr)}
                  </p>
                </div>
                <div className="loan_info">
                  <p className="loan_info_hd">Token pair</p>
                  <p className="loan_info_sub">
                    {TokenPairs[modalData?.tokenPairIndex]}
                  </p>
                </div>
              </div>
              <div className="loan_info_row">
                <div className="loan_info">
                  <p className="loan_info_hd">Current Health Ratio</p>
                  <p className="loan_info_sub">
                    {modalData?.currentHealthRatio}
                  </p>
                </div>
              </div>
            </div>
            <div className="repay_form_row">
              <p>Email Address for notification</p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
              />
            </div>

            <div className="repay_form_row">
              <p>Reminder Health Ratio</p>
              <p className="advice_txt">
                Input a value less than the current health ratio.
              </p>
              <input
                type="number"
                value={reminder}
                min={0.1}
                onChange={(e) => setReminder(Number(e.target.value))}
                placeholder="Enter amount"
              />
            </div>

            <div className="act_butt_row">
              <button onClick={AddAlert} className="act_butt">
                Create Alert
              </button>
            </div>
            <button
              onClick={() => dispatch({ type: "close_modal" })}
              className="close_modal"
            >
              Close Modal
            </button>
          </div>
        </div>
      </>
    ) : null
  ) : null;
};

export default LoanModal;
