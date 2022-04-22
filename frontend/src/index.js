import "./axios";
import "./index.scss";
import App from "./App";
import * as ReactDOMClient from "react-dom/client";

const container = document.getElementById("root");

const root = ReactDOMClient.createRoot(container);

root.render(<App tab="home" />);
