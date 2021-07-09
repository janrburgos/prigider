import "./RegistrationPage.css";
import Filter from "../../components/Header/Header";

import axios from "axios";
import ReactLoading from "react-loading";
import { useHistory } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

const RegistrationPage = () => {
  const restaurant = useSelector((state) => state.restaurant);
  const editAccount = useSelector((state) => state.editAccount);
  const [branch, setBranch] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [restaurantName, setRestaurantName] = useState("");
  const [registrationError, setRegistrationError] = useState("");

  const history = useHistory();
  const dispatch = useDispatch();

  let registerButtonClickHandler = () => {
    setLoading(true);
    setRegistrationError("");

    if (
      username.trim() === "" ||
      password.trim() === "" ||
      restaurantName.trim() === ""
    ) {
      setLoading(false);
      return setRegistrationError("Do not leave any items blank");
    } else if (password.length < 4) {
      setLoading(false);
      return setRegistrationError("Password should have at least 4 characters");
    }

    if (editAccount === false) {
      let registerBody = {
        username: username.trim(),
        password,
        restaurantName: restaurantName.trim().toLowerCase(),
        branch: branch.trim().toLowerCase(),
      };

      // check if username is available
      axios
        .post("https://prigider-be.herokuapp.com/api/restaurant", registerBody)
        .then((res) => {
          setLoading(false);
          if (res.data.error) {
            setRegistrationError(res.data.error);
          } else {
            alert(
              `Account ${username.trim()} has been registered successfully!`
            );
            history.push("/login");
          }
        });
    } else {
      axios
        .put(
          `https://prigider-be.herokuapp.com/api/restaurant/${restaurant._id}`,
          {
            password,
            restaurantName: restaurantName.trim().toLowerCase(),
            branch: branch.trim().toLowerCase(),
          }
        )
        .then((res) => {
          dispatch({ type: "UPDATE_RESTAURANT", payload: res.data });
          localStorage.setItem("restaurant", JSON.stringify(res.data));
          setLoading(false);
          alert(`Account ${username} has been edited successfully!`);
          history.push("/");
        });
    }
  };

  useEffect(() => {
    if (editAccount) {
      setUsername(restaurant.username);
      setPassword(restaurant.password);
      setRestaurantName(restaurant.restaurantName);
      setBranch(restaurant.branch);
    }
  }, [restaurant, editAccount]);

  return (
    <div className="RegistrationPage">
      {loading && (
        <div className="loading-container">
          <ReactLoading
            type={"spokes"}
            color={"rgb(72, 133, 184)"}
            width={50}
          />
        </div>
      )}
      <Filter />
      <div className="registration-page-container">
        <div className="form-container">
          <div className="form-row">
            <label htmlFor="reg-username">username</label>
            <input
              type="username"
              id="reg-username"
              onChange={(e) => {
                setUsername(e.target.value);
              }}
              value={username}
              disabled={editAccount}
            />
          </div>
          <div className="form-row">
            <label htmlFor="reg-password">password</label>
            <input
              type="password"
              id="reg-password"
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              value={password}
            />
          </div>
          <div className="form-row">
            <label htmlFor="reg-restaurant-name">restaurant name</label>
            <input
              type="restaurant-name"
              id="reg-restaurant-name"
              onChange={(e) => {
                setRestaurantName(e.target.value);
              }}
              value={restaurantName}
            />
          </div>
          <div className="form-row">
            <label htmlFor="reg-branch">branch (optional)</label>
            <input
              type="branch"
              id="reg-branch"
              onChange={(e) => {
                setBranch(e.target.value);
              }}
              value={branch}
            />
          </div>
          <div className="form-row">
            <div></div>
            <button
              onClick={() => {
                registerButtonClickHandler();
              }}
            >
              Register
            </button>
          </div>
        </div>
        <div className="registration-error">{registrationError}</div>
      </div>
    </div>
  );
};

export default RegistrationPage;
