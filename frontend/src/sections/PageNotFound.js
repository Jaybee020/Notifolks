import React from "react";

import Lottie from "react-lottie";
import { Link } from "react-router-dom";
import animationData from "../lotties/404-2.json";

const PageNotFound = () => {
  //
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  return (
    <div className="not_found">
      <div className="not_found_anim">
        <Lottie options={defaultOptions} />
      </div>
      <div className="not_found_text">
        <p>Page not found</p>
        <Link to={"/"}>Back to HomePage</Link>
      </div>
    </div>
  );
};

export default PageNotFound;
