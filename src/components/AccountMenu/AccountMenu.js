import "./AccountMenu.css";

import axios from "axios";
import ReactLoading from "react-loading";
import { useHistory } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import React, { useRef, useState, useEffect } from "react";

const AccountMenu = ({ showAccountMenu, setShowAccountMenu }) => {
  const restaurant = useSelector((state) => state.restaurant);
  const [loading, setLoading] = useState(false);
  const [menuHeight, setMenuHeight] = useState(0);
  const uploadAvatarRef = useRef(null);
  const accountMenuRef = useRef(null);

  const history = useHistory();
  const dispatch = useDispatch();

  const restaurantImageButtonClickButton = () => {
    if (!showAccountMenu) {
      setShowAccountMenu(true);
    } else {
      setShowAccountMenu(false);
    }
  };

  const uploadAvatarClickHandler = () => {
    uploadAvatarRef.current.click();
  };

  const avatarInputChangeHandler = (file) => {
    setLoading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = (e) => {
      let data = e.currentTarget.result;
      axios
        .post("https://prigider-be.herokuapp.com/api/upload/avatar", {
          data,
          username: restaurant.username,
        })
        .then((res) => {
          axios
            .put(
              `https://prigider-be.herokuapp.com/api/restaurant/${restaurant._id}`,
              {
                avatarUrl: res.data,
              }
            )
            .then((res) => {
              dispatch({
                type: "UPDATE_RESTAURANT",
                payload: { ...res.data },
              });
              localStorage.setItem("restaurant", JSON.stringify(res.data));
              setLoading(false);
            });
        })
        .catch((err) => {
          setLoading(false);
          if (err) {
            console.error("avatar upload error");
          }
        });
    };
  };

  const logOutBtn = () => {
    localStorage.clear();
    history.push("/login");
  };

  const editAccountButtonClickHandler = () => {
    dispatch({ type: "EDIT_ACCOUNT", payload: true });
    history.push("/register");
  };

  useEffect(() => {
    setMenuHeight(accountMenuRef.current.clientHeight);
  }, []);

  return (
    <>
      <input
        type="file"
        name="upload-avatar-input"
        id="upload-avatar-input"
        style={{ display: "none" }}
        accept="image/*"
        ref={uploadAvatarRef}
        onChange={(e) => avatarInputChangeHandler(e.target.files[0])}
      />
      <div
        className={`RestaurantImageButton ${showAccountMenu ? "opened" : ""}`}
        onClick={restaurantImageButtonClickButton}
      >
        <img src={restaurant.avatarUrl} alt="restaurant-avatar" />
      </div>
      <div
        className={`AccountMenu ${showAccountMenu ? "opened" : ""}`}
        style={{
          "--menu-height": `-${menuHeight}px`,
          "--menu-height-10": `-${menuHeight + 10}px`,
        }}
        ref={accountMenuRef}
      >
        <div className="main-restaurant-avatar">
          <img src={restaurant.avatarUrl} alt="restaurant-avatar" />
          {loading && (
            <div className="loading-container">
              <ReactLoading
                type={"spokes"}
                color={"rgb(72, 133, 184)"}
                width={50}
              />
            </div>
          )}
          <div className="upload-back"></div>
          <div className="upload-photo" onMouseUp={uploadAvatarClickHandler}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <path d="M342.7 144H464v288H48V144h121.3l24-64h125.5l23.9 64zM324.3 32h-131c-20 0-37.9 12.4-44.9 31.1L136 96H48c-26.5 0-48 21.5-48 48v288c0 26.5 21.5 48 48 48h416c26.5 0 48-21.5 48-48V144c0-26.5-21.5-48-48-48h-88l-14.3-38c-5.8-15.7-20.7-26-37.4-26zM256 408c-66.2 0-120-53.8-120-120s53.8-120 120-120 120 53.8 120 120-53.8 120-120 120zm0-192c-39.7 0-72 32.3-72 72s32.3 72 72 72 72-32.3 72-72-32.3-72-72-72z" />
            </svg>
          </div>
        </div>
        <div className="menu-text">
          <p>{restaurant.restaurantName}</p>
          <p>{restaurant.branch === "" ? "main branch" : restaurant.branch}</p>
        </div>
        <div>
          <button onClick={editAccountButtonClickHandler}>Edit account</button>
        </div>
        <hr />
        <div>
          <button onClick={logOutBtn}>Log out</button>
        </div>
      </div>
    </>
  );
};

export default AccountMenu;
