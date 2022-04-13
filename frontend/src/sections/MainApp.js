import React from "react";
import Loans from "./Loans";
import Refund from "./Refund";
import NewLoan from "./NewLoan";
import Navbar from "../components/Navbar";
import Topbar from "../components/Topbar";
import { BrowserRouter, Route, Routes } from "react-router-dom";

const MainApp = () => {
  return (
    <>
      <Navbar />
      <Topbar />

      <div className="pages_container">
        <Routes>
          <Route path="/" element={<Loans />} />
          <Route path="/borrow" element={<NewLoan />} />
          <Route path="/refund" element={<Refund />} />
        </Routes>
      </div>
    </>
  );
};

export default MainApp;
