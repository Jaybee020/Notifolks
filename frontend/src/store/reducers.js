import { combineReducers } from "redux";

const status = (
  state = {
    darkTheme: localStorage.getItem("mode") === "light" ? false : true,
    modalMenu: { openModal: false, modalType: "menu" },
    modalStatus: { openModal: false, modalData: null },
    connectWalletModal: { openModal: false },
  },
  action
) => {
  switch (action.type) {
    //   Set Dark mode / Light mode
    case "light_mode":
      localStorage.setItem("mode", "light");
      return { ...state, darkTheme: false };
    case "dark_mode":
      localStorage.setItem("mode", "dark");
      return { ...state, darkTheme: true };

    // Use Modal
    case "use_modal":
      return {
        ...state,
        modalStatus: { openModal: true, modalData: action.modalData },
      };
    case "close_modal":
      return { ...state, modalStatus: { openModal: false, modalData: null } };

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
