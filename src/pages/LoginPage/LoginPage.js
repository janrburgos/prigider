import "./LoginPage.css";
import Header from "../../components/Header/Header";

import axios from "axios";
import ReactLoading from "react-loading";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import React, { useState, useRef } from "react";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const usernameRef = useRef(null);
  const passwordRef = useRef(null);

  const history = useHistory();
  const dispatch = useDispatch();

  const loginHandler = () => {
    setLoginError("");
    if (username.trim() === "") {
      usernameRef.current.focus();
      return setLoginError("Enter an email address");
    }
    if (password.trim() === "") {
      passwordRef.current.focus();
      return setLoginError("Enter a password");
    }
    setLoading(true);
    // get restaurant's information
    axios(`https://prigider-be.herokuapp.com/api/restaurant/${username}`)
      .then((res) => {
        // validate login attempt
        if (res.data[0] === undefined) {
          setLoading(false);
          usernameRef.current.focus();
          return setLoginError("Username is not registered");
        } else if (res.data[0].password !== password) {
          setLoading(false);
          passwordRef.current.focus();
          return setLoginError("Password does not match with the username");
        } else {
          // update redux and localstorage
          dispatch({ type: "UPDATE_RESTAURANT", payload: res.data[0] });
          dispatch({
            type: "UPDATE_INGREDIENTS",
            payload: res.data[0].ingredients,
          });
          dispatch({ type: "UPDATE_RECIPES", payload: res.data[0].recipes });
          localStorage.setItem("restaurant", JSON.stringify(res.data[0]));
          localStorage.setItem(
            "ingredients",
            JSON.stringify(res.data[0].ingredients)
          );
          localStorage.setItem("recipes", JSON.stringify(res.data[0].recipes));
          setLoading(false);
          history.push("/");
        }
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const showHidePasswordClickHandler = () => {
    passwordRef.current.type === "password"
      ? (passwordRef.current.type = "text")
      : (passwordRef.current.type = "password");
    if (showPassword) {
      setShowPassword(false);
    } else {
      setShowPassword(true);
    }
  };

  const registerButtonClickHandler = () => {
    dispatch({ type: "EDIT_ACCOUNT", payload: false });
    history.push("/register");
  };

  return (
    <div className="LoginPage">
      {loading && (
        <div className="loading-container">
          <ReactLoading
            type={"spokes"}
            color={"rgb(72, 133, 184)"}
            width={50}
          />
        </div>
      )}
      <Header />
      <div className="login-page-container">
        <div className="login-box">
          <p className="login-title">Sign in to your account</p>
          <div className="login-error">
            <small>{loginError}</small>
          </div>
          <input
            type="username"
            name="username-login"
            id="username-login"
            placeholder="Username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
            }}
            ref={usernameRef}
            onKeyDown={(e) =>
              e.key === "Enter" ? passwordRef.current.focus() : null
            }
          />
          <input
            type="password"
            name="password-login"
            id="password-login"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            ref={passwordRef}
            onKeyDown={(e) => (e.key === "Enter" ? loginHandler() : null)}
          />
          <div
            className="show-hide-password"
            onClick={showHidePasswordClickHandler}
          >
            {showPassword ? "Hide" : "Show"} password
          </div>
          <button className="login-button" onClick={loginHandler}>
            Log In
          </button>
        </div>
        <p className="register-message">
          Don't have an account?&nbsp;
          <span className="link-hover" onClick={registerButtonClickHandler}>
            Register here
          </span>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
