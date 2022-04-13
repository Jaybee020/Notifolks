import React from "react";
import { Link } from "react-router-dom";

const SideBar = () => {
  return (
    <div className="side_nav_container">
      <div className="side_nav">
        <div className="side_top_sect">
          N<i className="ph-bell-simple-bold" />
          tif
          {/* <i className="ph-bell-simple-bold" /> */}olks
        </div>

        {/*  */}
        <ul className="side_menu">
          {[
            "Dashboard",
            "Take new loan",
            "Add alerts to loans",
            "Repay loan",
          ].map((item, index) => {
            return (
              <Link
                to={"/"}
                className={
                  index === 0
                    ? "side_menu_item  side_menu_item_active"
                    : "side_menu_item"
                }
                key={index}
              >
                <div className="radio_button">
                  <div className="radio_active"></div>
                </div>
                <p>{item}</p>
              </Link>
            );
          })}
        </ul>

        {/*  */}
        <div className="side_configs">
          <div className="connect_wallet">Disconnect Wallet</div>
        </div>
      </div>
    </div>
  );
};

export default SideBar;

// ============================

 <div class="theme_butt">
 <div class="theme_active"></div>
 <div class="theme_icons">
   <div class="theme_icon_cover theme_icon_cover_active">
     <i class="ph-sun"></i>
   </div>
   <div class="theme_icon_cover">
     <i class="ph-moon"></i>
   </div>
 </div>
</div>

.theme_butt {
   width: 55px;
   height: 23px;
   padding: 3px;
   font-size: 13px;
   margin-right: 18px;
   border-radius: 20px;
   position: relative;
   color: $fade_color;
   background: rgba(0, 0, 0, $alpha: 0.07);
   .theme_icons {
     left: 3px;
     align-items: center;
     position: absolute;
     width: calc(100% - 6px);
     height: calc(100% - 6px);
     justify-content: space-around;
   }
   .theme_icon_cover {
     width: 50%;
     cursor: pointer;
     justify-content: center;
   }
   .theme_active {
     width: 50%;
     height: 100%;
     border-radius: 18px;
     background: #fff;
   }
   .theme_icon_cover_active {
     color: $default_color;
   }
 }


.side_nav_container {
    width: $sidenav_width;
    display: flex;
    overflow: hidden;
    padding: $pad_default 0px;
    flex-direction: column;
    div {
      display: flex;
    }
    .side_nav {
      width: 100%;
      height: 100%;
      border-right: $border;
      padding: 0px $pad_hor;
      flex-direction: column;
  
      .side_top_sect {
        width: 100%;
        height: $nav_height;
        align-items: center;
        flex-direction: row;
        font-size: 16px;
        padding-bottom: 10px;
        text-transform: uppercase;
        border-bottom: $border;
        padding-left: 10px;
        i {
          font-size: 14px;
          margin-top: 1px;
        }
      }
  
      .side_menu {
        flex: 1;
        width: 100%;
        display: flex;
        padding-top: 20px;
        flex-direction: column;
        .side_menu_item {
          width: 100%;
          display: flex;
          cursor: pointer;
          overflow: hidden;
          margin-bottom: 5px;
          border-radius: 8px;
          padding: 5px 10px;
          flex-direction: row;
          align-items: center;
          @include font_bold;
  
          .radio_button {
            width: 15px;
            height: 15px;
            align-items: center;
            border-radius: 100%;
            justify-content: center;
            border: 2px solid $fade_color;
            .radio_active {
              border-radius: 100%;
              width: calc(100% - 2px);
              height: calc(100% - 2px);
              background: transparent;
            }
          }
  
          p {
            font-size: 14px;
            margin-top: 1px;
            margin-left: 10px;
            color: $fade_color;
            text-transform: uppercase;
          }
        }
        .side_menu_item_active {
          p {
            color: $default_color;
          }
          .radio_button {
            border-color: $default_color;
            .radio_active {
              background: $default_color;
            }
          }
        }
      }
  
      .side_configs {
        width: 100%;
        padding-top: 20px;
        align-items: center;
        flex-direction: column;
        .connect_wallet {
          @include font_bold;
          width: 100%;
          cursor: pointer;
          border-radius: 8px;
          padding: 12px 20px 10px;
          border: $border;
        }
      }
    }
  }