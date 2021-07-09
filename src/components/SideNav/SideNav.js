import "./SideNav.css";

import { useHistory, useLocation } from "react-router-dom";

const SideNav = () => {
  const history = useHistory();
  const location = useLocation();

  return (
    <div className="SideNav">
      <p
        className={
          location.pathname === "/"
            ? "selected"
            : location.pathname === "/inventory"
            ? "selected"
            : null
        }
        onClick={() => history.push("/inventory")}
      >
        inventory
      </p>
      <p
        className={location.pathname === "/recipes" ? "selected" : null}
        onClick={() => history.push("/recipes")}
      >
        recipes
      </p>
      <p
        className={location.pathname === "/basket" ? "selected" : null}
        onClick={() => history.push("/basket")}
      >
        basket
      </p>
    </div>
  );
};

export default SideNav;
