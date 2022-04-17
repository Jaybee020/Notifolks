import React from "react";
import { constrictAddr, NumberWithCommas } from "../utils";

const Navbar = () => {
  return (
    <nav className="top_nav top_nav_first">
      <div className="side_top_sect">
        Noti-f
        <i className="ph-bell-simple-fill" />
        lks
      </div>

      <div className="top_configs">
        <div className="user_details">
          <div className="user_img">
            <img
              src="https://ipfs.pixura.io/ipfs/QmYUQGQbdGE6r9LMUMvqHkTg4SHGALDp1qUATVEPzLwZLH/MeLogo.png"
              alt=""
            />
          </div>
          <div className="user_wallet_mail">
            <p className="user_mail">atakere@gmail.com</p>
            <p className="user_wallet">
              {constrictAddr(
                "IYG2CGWR36BMBDSE4BOIXD7UZZJAT5QETQONOACDQUZWWDZFMJX6QJA6II"
              )}
            </p>
          </div>
          <div className="dropdown_button">
            <i className="uil uil-angle-down"></i>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
