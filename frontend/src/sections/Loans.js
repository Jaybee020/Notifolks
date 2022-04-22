import axios from "axios";
import React from "react";
import { useDispatch } from "react-redux";
import { HashLoader } from "react-spinners";
import { constrictAddr, NumberWithCommas, TokenPairs } from "../utils";

const Loans = ({ loans, loading, currentPair }) => {
  const dispatch = useDispatch();

  return (
    <div className="pages_cover">
      <div className="loan_item_hd">
        <div className="loan_hasAlert">
          <p>
            <i className="ph-bell-simple-light"></i>
          </p>
        </div>
        <div className="loan_escrow">
          <p>Loan Escrow</p>
        </div>
        <div className="loan_tokenPair">
          <p>Token Pair</p>
        </div>
        <div className="loan_borrowed">
          <p>Borrowed Amount</p>
        </div>
        <div className="loan_borrowBalance">
          <p>Borrowed Balance</p>
        </div>
        <div className="loan_collateral">
          <p>Collateral Balance</p>
        </div>
      </div>

      {loading || loans.length === 0 ? (
        <div className="loading_component">
          <p className="status_txt">
            {loans.length === 0 && !loading ? (
              <>
                No <span>{TokenPairs[currentPair]}</span> loans in the wallet
              </>
            ) : (
              <>
                Fetching <span>{TokenPairs[currentPair]}</span> loans
              </>
            )}
          </p>
          {loading && <HashLoader color="#5353e6" size={30} />}
        </div>
      ) : (
        <>
          {loans?.map((item, index) => {
            return (
              <div
                className="loan_item"
                key={index}
                onClick={() => {
                  dispatch({
                    type: "use_modal",
                    modalData: { ...item, type: "repayLoan" },
                  });
                }}
              >
                <div className="loan_hasAlert">
                  <p>
                    {!!item?.alertStatus ? (
                      <i
                        className="ph-bell-fill alertedLoan"
                        style={{
                          color: !item?.executed
                            ? "#A24101"
                            : "rgba(0, 255, 100, 0.5)",
                        }}
                      ></i>
                    ) : (
                      <i className="ph-bell-slash-light"></i>
                    )}
                  </p>
                </div>
                <div className="loan_escrow">
                  <p>{constrictAddr(item?.loanEscrow)}</p>
                </div>
                <div className="loan_tokenPair">
                  <p>{TokenPairs[currentPair]}</p>
                </div>
                <div className="loan_borrowed">
                  <p>
                    {NumberWithCommas(item?.borrowedAmount / Math.pow(10, 6))}
                    <span>{TokenPairs[currentPair]?.split("-")[1]}</span>
                  </p>
                </div>
                <div className="loan_borrowBalance">
                  <p>
                    {NumberWithCommas(item?.borrowedBalance / Math.pow(10, 6))}
                    <span>{TokenPairs[currentPair]?.split("-")[1]}</span>
                  </p>
                </div>
                <div className="loan_collateral">
                  <p>
                    {NumberWithCommas(
                      item?.collateralBalance / Math.pow(10, 6)
                    )}
                    <span>{TokenPairs[currentPair]?.split("-")[0]}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
};

export default Loans;
