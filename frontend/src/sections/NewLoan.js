import React, { useEffect, useState } from "react";

const NewLoan = () => {
  const [borrowedAmt, setBorrowedAmt] = useState(1);
  const [collateralAmt, setCollateralAmt] = useState(1);

  return (
    <div className="pages_cover">
      <div className="loans_inn">
        <div className="loan_form">
          <div className="page_header">Get a new loan</div>
          <div className="loan_currency_pair">
            <div className="hd_txt">
              <span>
                <i class="ph-caret-right"></i>
              </span>
              <p>Currency Pair</p>
            </div>

            <div className="currency_pair_list">
              <div className="currency_pair">
                <p>Algo</p>
                <p>goBTC</p>
              </div>
              <div className="pair_list_drop_down">
                <i class="ph-caret-down"></i>
              </div>
            </div>

            {/*  */}
          </div>
          <div className="loan_amount">
            <div className="hd_txt">
              <span>
                <i class="ph-caret-right"></i>
              </span>
              <p>Collateral Amount</p>
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
                <i class="ph-caret-right"></i>
              </span>
              <p>Borrow Amount</p>
            </div>
            <input
              type="number"
              value={borrowedAmt}
              min={1}
              onChange={(e) => setBorrowedAmt(Number(e.target.value))}
            />
          </div>

          <div className="get_loan_button">Request Loan</div>
        </div>

        <div className="side_illustration">
          <img src="/assets/PaymentIllustration.svg" alt="" />
        </div>
      </div>
    </div>
  );
};

export default NewLoan;
