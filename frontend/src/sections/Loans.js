import React from "react";
import { constrictAddrLong, NumberWithCommas } from "../utils";

const Loans = () => {
  return (
    <div className="pages_cover">
      <div className="loan_item_hd">
        <div className="loan_escrow">
          <p>Escrow Address</p>
        </div>
        <div className="loan_borrowed">
          <p>Borrowed Amount</p>
        </div>
        <div className="loan_collateral">
          <p>Collateral Balance</p>
        </div>
        <div className="loan_borrowBalance">
          <p>Borrowed Balance</p>
        </div>
        <div className="loan_borrowBalanceLiquidation">
          <p>Liquidation</p>
        </div>
        <div className="loan_healthFactor">
          <p>Health</p>
        </div>
      </div>

      {[1].map((item, index) => {
        return (
          <div className="loan_item" key={index}>
            <div className="loan_escrow">
              <p>
                {constrictAddrLong(
                  "IYG2CGWR36BMBDSE4BOIXD7UZZJAT5QETQONOACDQUZWWDZFMJX6QJA6II"
                )}
              </p>
            </div>
            <div className="loan_borrowed">
              <p>${NumberWithCommas(5600)}</p>
            </div>
            <div className="loan_collateral">
              <p>${NumberWithCommas(72003456.9899)}</p>
            </div>
            <div className="loan_borrowBalance">
              <p>${NumberWithCommas(4650)}</p>
            </div>
            <div className="loan_borrowBalanceLiquidation">
              <p>${NumberWithCommas(1600)}</p>
            </div>
            <div className="loan_healthFactor">
              <p>18%</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Loans;
