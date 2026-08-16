import React from "react";
import { createRoot } from "react-dom/client";
import Home from "../app/page";
import "../app/globals.css";
import PlayPage from "./play-page";
import "./play.css";

const isPlayPage = window.location.pathname.replace(/\/+$/, "") === "/play";
const root = document.getElementById("root");

if (!root) throw new Error("Missing application root");

createRoot(root).render(
  <React.StrictMode>{isPlayPage ? <PlayPage /> : <Home />}</React.StrictMode>,
);
