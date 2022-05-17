import React, { useState } from "react";
import { Link } from "react-router-dom";
import { constrictAddr } from "../utils";
import { useDispatch, useSelector } from "react-redux";

const Splash = () => {
  const dispatch = useDispatch();
  const [walletAddr, setWalletAddr] = useState(
    localStorage.getItem("walletAddr")
  );
  const [walletProvider, setWalletProvider] = useState(
    localStorage.getItem("walletProvider")
  );

  const onConnectWallet = async () => {
    if (!walletAddr || !walletProvider) {
      dispatch({
        type: "open_connect_wallet_modal",
        connectWalletModal: { openModal: true },
      });
    }
  };

  return (
    <div className="pages_cover">
      <div className="loans_inn_splash">
        <div className="splash_cover">
          <div className="splash_container">
            <p className="hd">
              Loan Management <br /> Notification System
            </p>
            <p className="sub">
              Notifolks is a platform to manage loans from the top Capital
              Markets Protocol for borrowing and lending; Folks Finance.
              <br />
              <br />
              Get new loans, repay old ones and add notifications to your loans
              for effective management.
            </p>
            <button onClick={onConnectWallet}>
              Connect wallet to get started{" "}
            </button>
          </div>

          <div className="splash_illustration">
            <img src="/assets/2-light.svg" alt="" />
          </div>
        </div>

        <footer>
          <ul className="sponsors_list">
            <div className="powered_item">
              <img src="/assets/algorand_full_logo_black.svg" alt="" />
            </div>
            <div className="powered_item folks">
              <img src="/assets/folks_finance.svg" alt="" />
            </div>
            <div className="powered_item jump">
              <img src="/assets/jump_logo.svg" alt="" />
            </div>
          </ul>
        </footer>
      </div>
    </div>
  );
};

export default Splash;
