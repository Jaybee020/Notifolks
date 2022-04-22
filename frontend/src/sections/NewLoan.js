import React, { useState, useRef } from "react";
import { TokenPairs } from "../utils";
import DropDownMenu from "../components/DropDownMenu";
import { useDispatch } from "react-redux";

const NewLoan = ({ assets, walletAddr }) => {
  const dispatch = useDispatch();
  const [borrowedAmt, setBorrowedAmt] = useState(1);
  const [collateralAmt, setCollateralAmt] = useState(1);

  const [isOpen, setIsOpen] = useState(false);
  const [currentPair, setCurrentPair] = useState(0);

  const dropDownRef = useRef();

  const SetCurrPair = (num) => {
    setCurrentPair(num);
    setIsOpen(false);
  };

  const ToggleDropDown = () => setIsOpen((prev) => !prev);

  const GetNewLoan = () => {
    const AlgoBalance = assets.find((item) => item.name === "ALGO")?.balance;

    dispatch({
      type: "use_modal",
      modalData: {
        collateralAmount: collateralAmt,
        borrowAmount: borrowedAmt,
        tokenPairIndex: currentPair,
        accountAddr: walletAddr,
        algoBalance: AlgoBalance,
        type: "newLoan",
      },
    });
  };

  return (
    <div className="pages_cover">
      <div className="loans_inn">
        <div className="loan_form">
          <div className="page_header">Get a new loan</div>
          <div className="loan_currency_pair">
            <div className="hd_txt">
              <span>
                <i className="ph-caret-right"></i>
              </span>
              <p>Currency Pair</p>
            </div>

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
                SetCurrPair={SetCurrPair}
                ToggleDropDown={ToggleDropDown}
              />
            </div>

            {/*  */}
          </div>
          <div className="loan_amount">
            <div className="hd_txt">
              <span>
                <i className="ph-caret-right"></i>
              </span>
              <p>
                Collateral Amount&nbsp;-&nbsp;
                <span>{TokenPairs[currentPair]?.split("-")[0]}</span>
              </p>
            </div>
            <input
              type="number"
              value={collateralAmt}
              min={1}
              onChange={(e) => setCollateralAmt(Number(e.target.value))}
            />
          </div>
          <div className="loan_amount">
            <div className="hd_txt">
              <span>
                <i className="ph-caret-right"></i>
              </span>
              <p>
                Borrow Amount&nbsp;-&nbsp;
                <span>{TokenPairs[currentPair]?.split("-")[1]}</span>
              </p>
            </div>
            <input
              type="number"
              value={borrowedAmt}
              min={1}
              onChange={(e) => setBorrowedAmt(Number(e.target.value))}
            />
          </div>

          <div className="get_loan_button" onClick={GetNewLoan}>
            Request Loan
          </div>
        </div>

        <div className="side_illustration">
          <img src="/assets/PaymentIllustration.svg" alt="" />
        </div>
      </div>
    </div>
  );
};

export default NewLoan;
