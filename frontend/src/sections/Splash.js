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

  const onDisconnectWallet = () => {
    if (walletProvider === "pera") {
      // connector.killSession();
      console.log("provider");
    }

    localStorage.removeItem("walletAddr");
    localStorage.removeItem("walletProvider");

    setWalletAddr("");
    setWalletProvider("");

    window.location.reload();
  };

  return (
    <div className="pages_cover">
      <div className="loans_inn_2">
        <div className="splash_container">
          <p className="hd">Notifications made easier</p>
          <p className="sub">
            Add alerts to your loans from the Folks Finance platform.
          </p>
          <button onClick={onConnectWallet}>Get Started with Notifolks</button>
        </div>

        <div className="side_illustration">
          <img src="/assets/PaymentIllustration.svg" alt="" />
        </div>
      </div>
    </div>
  );
};

export default Splash;
