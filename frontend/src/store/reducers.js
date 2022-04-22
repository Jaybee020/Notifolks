import { combineReducers } from "redux";

const status = (
  state = {
    modalMenu: { openModal: false, modalType: "menu" },
    loanModal: { openModal: false, modalData: null },
    connectWalletModal: { openModal: false },
  },
  action
) => {
  switch (action.type) {
    // Use Modal
    case "use_modal":
      return {
        ...state,
        loanModal: { openModal: true, modalData: action.modalData },
      };
    case "close_modal":
      return { ...state, loanModal: { openModal: false, modalData: null } };

    case "open_connect_wallet_modal":
      return {
        ...state,
        connectWalletModal: { openModal: true },
      };

    case "close_connect_wallet_modal":
      return {
        ...state,
        connectWalletModal: { openModal: false },
      };

    default:
      return state;
  }
};

export default combineReducers({ status });
