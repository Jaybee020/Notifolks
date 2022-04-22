import algosdk from "algosdk";
import { useDispatch, useSelector } from "react-redux";
import { myAlgoConnect } from "../utils";
import React, { useState } from "react";

import WalletConnectQRCodeModal from "algorand-walletconnect-qrcode-modal";
import WalletConnect from "@walletconnect/client";

const ConnectWalletModal = () => {
  const dispatch = useDispatch();
  const { openModal } = useSelector((state) => state.status.connectWalletModal);

  const [walletAddr, setWalletAddr] = useState(
    localStorage.getItem("walletAddr")
  );

  const onSelectMyAlgoWallet = async () => {
    if (!walletAddr) {
      const accounts = await myAlgoConnect.connect({
        shouldSelectOneAccount: true,
      });

      localStorage.setItem("walletAddr", accounts[0].address);
      localStorage.setItem("walletProvider", "myalgo");

      setWalletAddr(accounts[0].address);

      dispatch({
        type: "close_connect_wallet_modal",
      });
      window.location.reload();
    }
  };

  const onSelectPeraWallet = () => {
    const connector = new WalletConnect({
      bridge: "https://bridge.walletconnect.org",
      qrcodeModal: WalletConnectQRCodeModal,
    });

    if (!connector.connected) {
      console.log("Another one");
      connector.createSession();
    }

    connector.on("connect", (error, payload) => {
      if (error) {
        throw error;
      }

      console.log("Connected...");
      const { accounts } = payload.params[0];

      localStorage.setItem("walletAddr", accounts[0]);
      localStorage.setItem("walletProvider", "pera");

      dispatch({
        type: "close_connect_wallet_modal",
      });
      window.location.reload();
    });

    connector.on("session_update", (error, payload) => {
      if (error) {
        throw error;
      }

      console.log("Session updated...");
      const { accounts } = payload.params[0];

      localStorage.setItem("walletAddr", accounts[0]);
      localStorage.setItem("walletProvider", "pera");
    });

    connector.on("disconnect", (error, payload) => {
      if (error) {
        throw error;
      }

      console.log("Disconnected...");

      localStorage.removeItem("walletAddr");
      localStorage.removeItem("walletProvider");

      window.location.reload();
    });
  };

  return (
    <div
      className="app_modal"
      style={{ display: `${!!openModal ? "flex" : "none"}` }}
    >
      <div className="app_modal_inn">
        <div className="modal_header">
          <p className="main">Wallet Options</p>
          <p className="sub">
            Select one of the options below to connect your wallet address and
            continue
          </p>
        </div>

        <div className="app_modal_main">
          <button className="wallet_option" onClick={onSelectMyAlgoWallet}>
            My Algo Wallet
          </button>
          {/* <button className="wallet_option" onClick={onSelectPeraWallet}>
            Pera Wallet
          </button> */}
        </div>

        <button
          onClick={() => dispatch({ type: "close_connect_wallet_modal" })}
          className="close_modal"
        >
          Close Modal
        </button>
      </div>
    </div>
  );
};

export default ConnectWalletModal;
