import React, { useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

const BasicLayout = () => {
  // const navigate = useNavigate();
  // const location = useLocation();
  // const ref = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Outlet />
    </div>
  );
};

export default BasicLayout;
