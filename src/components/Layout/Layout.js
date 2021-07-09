import "./Layout.css";
import Header from "../Header/Header";
import SideNav from "../SideNav/SideNav";

import React, { useState } from "react";

const Layout = (props) => {
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const closeAccountMenu = () => {
    setShowAccountMenu(false);
  };

  return (
    <>
      <header>
        <Header
          showAccountMenu={showAccountMenu}
          setShowAccountMenu={setShowAccountMenu}
        />
      </header>
      <div className="Layout" onClick={closeAccountMenu}>
        <button
          className="hamburger"
          onClick={(e) => {
            e.target.classList.toggle("open");
            e.target.parentElement
              .querySelector(".SideNav")
              .classList.toggle("open");
          }}
        >
          ☰
        </button>
        <SideNav />
        {props.children}
      </div>
    </>
  );
};

export default Layout;
