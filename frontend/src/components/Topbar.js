import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import DropDownMenu from "./DropDownMenu";
import { TokenPairs } from "../utils";

const Topbar = ({ total, loading, currentPair, SetPairIndex }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ToggleDropDown = () => setIsOpen((prev) => !prev);

  const [walletAddr, setWalletAddr] = useState(
    localStorage.getItem("walletAddr")
  );

  const SetPairIndexFirst = (num) => {
    SetPairIndex(num);
    setIsOpen(false);
  };

  const dropDownRef = useRef();

  return (
    <nav className="top_nav top_nav_second">
      <div className="top_nav_second_header">
        <div className="account_details">
          <div className="acct_dets_cover">
            <div className="acct_dets_icon">
              <i className="ph-coins" />
            </div>

            <div className="acct_dets_value_title">
              <p className="acct_dets_value">{loading ? 0 : total}</p>
              <p className="acct_dets_title">{TokenPairs[currentPair]} Loans</p>
            </div>
          </div>
        </div>

        <Link to={"/borrow"} className="action_button">
          Get new loan
        </Link>
      </div>

      <div className="select_token_text">
        {/* Select the token pair you want to check loans from */}
      </div>

      <div className="top_nav_second_inn">
        <div className="currency_pair_list">
          <div className="currency_pair">
            <p>{TokenPairs[currentPair]?.split("-")[0]}</p>
            <p>{TokenPairs[currentPair]?.split("-")[1]}</p>
          </div>
          <div
            className="pair_list_drop_down"
            ref={dropDownRef}
            onClick={ToggleDropDown}
          >
            <i className="ph-caret-down"></i>
          </div>
          <DropDownMenu
            isOpen={isOpen}
            pairs={TokenPairs}
            setIsOpen={setIsOpen}
            currentPair={currentPair}
            dropDownRef={dropDownRef}
            SetCurrPair={SetPairIndexFirst}
            ToggleDropDown={ToggleDropDown}
          />
        </div>
      </div>
    </nav>
  );
};

export default Topbar;
