import React, { useEffect, useState } from "react";
import Loans from "./Loans";
import NewLoan from "./NewLoan";
import Navbar from "../components/Navbar";
import Topbar from "../components/Topbar";
import { Route, Routes } from "react-router-dom";

import Splash from "./Splash";
import AppModal from "../components/AppModal";
import axios from "axios";
import LoanModal from "../components/LoanModal";
import { GetAssets } from "../utils";
import PageNotFound from "./PageNotFound";

const MainApp = () => {
  const [walletAddr, setWalletAddr] = useState(
    localStorage.getItem("walletAddr")
  );

  const [loans, setLoans] = useState([]);

  const [assets, setAssets] = useState([]);

  const [loading, setLoading] = useState(false);

  const [pairIndex, setPairIndex] = useState(0);

  const SetPairIndex = (index) => setPairIndex(index);

  const GetLoans = async () => {
    await axios
      .get(`/folks/getloan/${walletAddr}/${pairIndex}`)
      .then((res) => {
        // console.log(res?.data?.message);
        setLoans(res?.data?.message);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!!walletAddr) {
      setLoading(true);
      GetLoans();

      GetAssets().then((assets) => setAssets(assets));
    }
  }, [pairIndex]);

  return (
    <>
      <AppModal />
      <LoanModal currentPair={pairIndex} assets={assets} />

      <Navbar />
      {!!walletAddr ? (
        <>
          <div className="pages_container">
            <Routes>
              <Route
                path="/"
                element={
                  <>
                    <Topbar
                      loading={loading}
                      currentPair={pairIndex}
                      total={loans?.length}
                      SetPairIndex={SetPairIndex}
                    />
                    <Loans
                      loans={loans}
                      loading={loading}
                      currentPair={pairIndex}
                    />
                  </>
                }
              />
              <Route
                path="/borrow"
                element={
                  <>
                    <NewLoan assets={assets} walletAddr={walletAddr} />
                  </>
                }
              />

              <Route path="/*" element={<PageNotFound />} />
            </Routes>
          </div>
        </>
      ) : (
        <>
          <div className="pages_container">
            <Routes>
              <Route path="/*" element={<Splash />} />
            </Routes>
          </div>
        </>
      )}
    </>
  );
};

export default MainApp;
