import React, { useEffect, useRef } from "react";
import { useOutsideAlerter } from "../utils";

const DropDownMenu = ({
  pairs,
  isOpen,
  setIsOpen,
  currentPair,
  SetCurrPair,
  dropDownRef,
}) => {
  const wrapperRef = useRef(null);
  const HideDropDown = () => setIsOpen(false);
  useOutsideAlerter(wrapperRef, dropDownRef, HideDropDown);
  return (
    <div
      ref={wrapperRef}
      className="drop_down_list"
      style={{ display: isOpen ? "flex" : "none" }}
    >
      {pairs?.map((item, index) => {
        return (
          <div
            key={index}
            className={`currency_pair ${
              currentPair === index ? "active_pair" : ""
            }`}
            onClick={() => SetCurrPair(index)}
          >
            <p>{item?.split("-")[0]}</p>
            <p>{item?.split("-")[1]}</p>
          </div>
        );
      })}
    </div>
  );
};

export default DropDownMenu;
