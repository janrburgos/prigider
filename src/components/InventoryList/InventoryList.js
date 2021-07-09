import "./InventoryList.css";
import InventoryItem from "../InventoryItem/InventoryItem";

import { useHistory } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

const InventoryList = () => {
  const ingredientsSelector = useSelector((state) => state.ingredients);
  const [ingredients, setIngredients] = useState(ingredientsSelector);
  const [displayIngredients, setDisplayIngredients] = useState(ingredients);

  const history = useHistory();
  const dispatch = useDispatch();

  const addInventoryButtonClickHandler = () => {
    dispatch({ type: "CLEAR_INGREDIENT_EDIT" });
    history.push("/add-ingredient");
  };

  const searchBarChangeHandler = (value) => {
    let searchInput = value.trim().toLowerCase();
    if (searchInput === "") {
      return setDisplayIngredients(ingredients);
    }
    let filteredIngredients = ingredients.filter(
      (ingredient) => ingredient.name.indexOf(searchInput) !== -1
    );
    setDisplayIngredients(filteredIngredients);
  };

  useEffect(() => {
    if (ingredientsSelector) {
      setIngredients(ingredientsSelector);
    }
  }, [ingredientsSelector]);

  useEffect(() => {
    setDisplayIngredients(ingredients);
  }, [ingredients]);

  return (
    <div className="InventoryList">
      <button onClick={addInventoryButtonClickHandler}>add ingredient</button>
      <div className="search-bar">
        <div className="search-input-container">
          <input
            type="text"
            onChange={(e) => searchBarChangeHandler(e.target.value)}
          />
        </div>
        <div className="search-icon">
          <svg focusable="false" viewBox="0 0 24 24">
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
          </svg>
        </div>
      </div>
      <div className="inventory-list-container">
        {displayIngredients
          ? displayIngredients.map((ingredient) => (
              <InventoryItem
                key={`inventory-item-${ingredient._id}`}
                ingredient={ingredient}
              />
            ))
          : null}
      </div>
    </div>
  );
};

export default InventoryList;
