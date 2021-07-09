import "./Header.css";
import "bootstrap/dist/css/bootstrap.min.css";
import AccountMenu from "../AccountMenu/AccountMenu";

import { useLocation, useHistory } from "react-router-dom";

const Header = ({ showAccountMenu, setShowAccountMenu }) => {
  const history = useHistory();
  const location = useLocation();

  const brandClickHandler = () => {
    if (localStorage.getItem("restaurant")) {
      history.push("/");
    } else {
      history.push("/login");
    }
  };

  return (
    <nav className="Header">
      <div className="prigider">
        <div className="prigider-brand" onClick={brandClickHandler}>
          <img
            className="fridge"
            src="https://image.flaticon.com/icons/png/512/3134/3134828.png"
            alt="prigider logo"
          />
          <h1>
            Prigi<span>der</span>
          </h1>
        </div>
        {location.pathname !== "/login" &&
          location.pathname !== "/register" && (
            <AccountMenu
              showAccountMenu={showAccountMenu}
              setShowAccountMenu={setShowAccountMenu}
            />
          )}
      </div>
    </nav>
  );
};

export default Header;
