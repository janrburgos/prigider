import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Layout from "./components/Layout/Layout";
import InventoryList from "./components/InventoryList/InventoryList";
import RecipesList from "./components/RecipesList/RecipesList";
import Basket from "./components/Basket/Basket";
import AddIngredient from "./components/AddIngredient/AddIngredient";
import AddRecipe from "./components/AddRecipe/AddRecipe";
import LoginPage from "./pages/LoginPage/LoginPage";
import RegistrationPage from "./pages/RegistrationPage/RegistrationPage";

import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Route, Switch, useHistory } from "react-router-dom";

const App = () => {
  const history = useHistory();
  const dispatch = useDispatch();

  if (localStorage.getItem("restaurant")) {
    dispatch({
      type: "UPDATE_RESTAURANT",
      payload: JSON.parse(localStorage.getItem("restaurant")),
    });
  }
  if (localStorage.getItem("ingredients")) {
    dispatch({
      type: "UPDATE_INGREDIENTS",
      payload: JSON.parse(localStorage.getItem("ingredients")),
    });
  }
  if (localStorage.getItem("recipes")) {
    dispatch({
      type: "UPDATE_RECIPES",
      payload: JSON.parse(localStorage.getItem("recipes")),
    });
  }

  useEffect(() => {
    if (localStorage.getItem("restaurant") === null) {
      history.push("/login");
    }
  }, []);

  return (
    <div className="App">
      <Switch>
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={RegistrationPage} />
        <Layout>
          <Switch>
            <Route path="/" exact component={InventoryList} />
            <Route path="/inventory" component={InventoryList} />
            <Route path="/recipes" component={RecipesList} />
            <Route path="/basket" component={Basket} />
            <Route path="/add-ingredient" component={AddIngredient} />
            <Route path="/add-recipe" component={AddRecipe} />
          </Switch>
        </Layout>
      </Switch>
    </div>
  );
};

export default App;
