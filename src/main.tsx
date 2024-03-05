import React from "react";
import ReactDOM from "react-dom";
import { HashRouter, Routes, Route } from "react-router-dom";

import BasicLayout from "@/layout/basic";
import HomePage from "@/pages/home";

import { storage } from "./store/storage";

import "virtual:windi.css";
import "./global.css";

ReactDOM.render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<BasicLayout />}>
          <Route path="/" element={<HomePage storage={storage} />} />
        </Route>
      </Routes>
    </HashRouter>
  </React.StrictMode>,
  document.getElementById("root")
);
