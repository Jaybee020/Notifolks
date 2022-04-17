import React from "react";
import { Link } from "react-router-dom";
import { NumberWithCommas } from "../utils";

const Topbar = () => {
  return (
    <nav className="top_nav top_nav_second">
      <div className="account_details">
        {[
          { title: "Total Assets", amount: 5617 },
          { title: "Total Loan", amount: 3217 },
          { title: "Percentage Yield", amount: 18.8 },
        ].map((item, index) => {
          return (
            <div className="acct_dets_cover" key={index}>
              <div className="acct_dets_icon">
                <i
                  className={`ph-${
                    item?.title === "Total Assets"
                      ? "coins"
                      : item?.title === "Total Loan"
                      ? "receipt"
                      : item?.title === "Percentage Yield"
                      ? "percent"
                      : "coin"
                  }`}
                />
              </div>

              <div className="acct_dets_value_title">
                <p className="acct_dets_value">
                  {item?.title === "Percentage Yield"
                    ? `${"+"}${item?.amount}%`
                    : `$${NumberWithCommas(item?.amount)}`}
                </p>
                <p className="acct_dets_title">{item?.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="action_buttons">
        <Link to={"/borrow"} className="action_button">
          Get new loan
        </Link>
        <Link to={"/repay"} className="action_button">
          Repay loan
        </Link>
      </div>
    </nav>
  );
};

export default Topbar;
