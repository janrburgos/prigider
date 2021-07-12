import "./RecipesList.css";
import RecipeBox from "../RecipeBox/RecipeBox";

import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import React, { useState, useEffect } from "react";

const RecipesList = () => {
  const basket = useSelector((state) => state.basket);
  const recipesSelector = useSelector((state) => state.recipes);
  const ingredientsSelector = useSelector((state) => state.ingredients);

  const [recipes, setRecipes] = useState(recipesSelector);
  const [displayRecipes, setDisplayRecipes] = useState(recipes);
  const [filterRecipeDisplay, setFilterRecipeDisplay] = useState(1);
  const [ingredients, setIngredients] = useState(ingredientsSelector);
  const [displayFilteredRecipes, setDisplayFilteredRecipes] = useState([]);

  const history = useHistory();

  const addRecipeButtonClickHandler = () => {
    history.push("/add-recipe");
  };

  const searchBarChangeHandler = (value) => {
    let searchInput = value.trim().toLowerCase();
    if (searchInput === "") {
      return setDisplayRecipes(recipes);
    }
    let filteredRecipes = recipes.filter(
      (ingredient) => ingredient._id.indexOf(searchInput) !== -1
    );
    setDisplayRecipes(filteredRecipes);
  };

  useEffect(() => {
    if (recipesSelector) {
      setRecipes(recipesSelector);
    }
  }, [recipesSelector]);

  useEffect(() => {
    setDisplayRecipes(recipes);
  }, [recipes]);

  useEffect(() => {
    if (ingredientsSelector) {
      setIngredients(ingredientsSelector);
    }
  }, [ingredientsSelector]);

  useEffect(() => {
    // filter out all recipes with not enough ingredients
    let hideAllRecipes = displayRecipes.map((recipe) => {
      let notEnough = false;

      recipe.recipeIngredients.forEach((recipeIngredient) => {
        const ingredientToCompare = ingredients.find(
          (ingredient) => ingredient._id === recipeIngredient.ingredient._id
        );
        if (
          ingredientToCompare === undefined ||
          ingredientToCompare.quantity < recipeIngredient.quantity
        ) {
          notEnough = true;
        }
      });

      return notEnough ? null : recipe;
    });
    hideAllRecipes = hideAllRecipes.filter((recipe) => recipe !== null);

    // filter out only recipes with not enough ingredients and not in the basket
    let hideSomeRecipes = displayRecipes.map((recipe) => {
      let notEnough = false;
      let notInBasket = true;

      recipe.recipeIngredients.forEach((recipeIngredient) => {
        const ingredientToCompare = ingredients.find(
          (ingredient) => ingredient._id === recipeIngredient.ingredient._id
        );
        if (
          ingredientToCompare === undefined ||
          ingredientToCompare.quantity < recipeIngredient.quantity
        ) {
          notEnough = true;
        }
      });
      basket.forEach((item) => {
        if (recipe._id === item._id) {
          return (notInBasket = false);
        }
      });

      return notEnough && notInBasket ? null : recipe;
    });
    hideSomeRecipes = hideSomeRecipes.filter((recipe) => recipe !== null);

    switch (filterRecipeDisplay) {
      case 1:
        return setDisplayFilteredRecipes([...displayRecipes]);
      case 2:
        return setDisplayFilteredRecipes([...hideSomeRecipes]);
      case 3:
        return setDisplayFilteredRecipes([...hideAllRecipes]);
      default:
        return setDisplayFilteredRecipes([...displayRecipes]);
    }
  }, [filterRecipeDisplay, recipes, ingredients, basket, displayRecipes]);

  return (
    <div className="RecipesList">
      <button onClick={addRecipeButtonClickHandler}>add recipe</button>
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
      <div className="recipes-main-container">
        <div className="recipes-filter">
          <input
            type="radio"
            name="filter-recipe-display"
            id="show-all"
            onClick={() => setFilterRecipeDisplay(1)}
            defaultChecked
          />
          <label htmlFor="show-all">show all</label>
          <br />
          <input
            type="radio"
            name="filter-recipe-display"
            id="hide-some"
            onClick={() => setFilterRecipeDisplay(2)}
          />
          <label htmlFor="hide-some">hide some</label>
          <br />
          <input
            type="radio"
            name="filter-recipe-display"
            id="hide-all"
            onClick={() => setFilterRecipeDisplay(3)}
          />
          <label htmlFor="hide-all">hide all</label>
        </div>
        <div className="recipes-container">
          {displayFilteredRecipes.map((recipe) => {
            let notEnough = false;
            let notInBasket = true;

            // check if ingredients are not enough
            recipe.recipeIngredients.forEach((recipeIngredient) => {
              if (recipeIngredient.ingredient === null) {
                return (notEnough = true);
              }
              const ingredientToCompare = ingredients.find(
                (ingredient) =>
                  ingredient._id === recipeIngredient.ingredient._id
              );
              if (
                ingredientToCompare === undefined ||
                ingredientToCompare.quantity < recipeIngredient.quantity
              ) {
                notEnough = true;
              }
            });

            // check if recipe is not in basket
            basket.forEach((item) => {
              if (recipe._id === item._id) {
                return (notInBasket = false);
              }
            });

            // check how many recipe already in the basket
            let basketCounter = basket.find(
              (item) => item.name === recipe.name
            );
            basketCounter =
              basketCounter === undefined ? 0 : basketCounter.itemQuantity;

            return (
              <RecipeBox
                key={`recipe-list-${recipe.name}`}
                recipe={recipe}
                notEnough={notEnough}
                notInBasket={notInBasket}
                basketCounter={basketCounter}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RecipesList;
