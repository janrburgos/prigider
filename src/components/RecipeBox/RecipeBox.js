import "./RecipeBox.css";

import axios from "axios";
import ReactLoading from "react-loading";
import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

const RecipeBox = ({ recipe, notEnough, notInBasket, basketCounter }) => {
  const recipes = useSelector((state) => state.recipes);
  const restaurant = useSelector((state) => state.restaurant);
  const ingredientsSelector = useSelector((state) => state.ingredients);
  const [ingredients, setIngredients] = useState(ingredientsSelector);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const deleteButtonClickHandler = (name) => {
    if (
      window.confirm(`Are you sure you want to delete ${name.toUpperCase()}?`)
    ) {
      setLoading(true);
      axios
        .delete(`https://prigider-be.herokuapp.com/api/recipe/${recipe._id}`)
        .then(async (res) => {
          let recipeIds = await recipes.map((recipe) => recipe._id);
          recipeIds = await recipeIds.filter((id) => id !== res.data._id);
          axios
            .put(
              `https://prigider-be.herokuapp.com/api/restaurant/${restaurant._id}`,
              {
                recipes: [...recipeIds],
              }
            )
            .then((res) => {
              axios(
                `https://prigider-be.herokuapp.com/api/restaurant/${restaurant.username}`
              ).then((res) => {
                dispatch({
                  type: "UPDATE_RESTAURANT",
                  payload: res.data[0],
                });
                dispatch({
                  type: "UPDATE_RECIPES",
                  payload: res.data[0].recipes,
                });
                dispatch({
                  type: "UPDATE_INGREDIENTS",
                  payload: res.data[0].ingredients,
                });
                localStorage.setItem("restaurant", JSON.stringify(res.data[0]));
                localStorage.setItem(
                  "recipes",
                  JSON.stringify(res.data[0].recipes)
                );
                localStorage.setItem(
                  "ingredients",
                  JSON.stringify(res.data[0].ingredients)
                );

                setLoading(false);
                alert(`${name.toUpperCase()} has been deleted`);
              });
            });
        })
        .catch(() => {
          setLoading(false);
          alert("communication error");
        });

      dispatch({ type: "EMPTY_BASKET", payload: "empty" });
    }
  };

  const editBtn = (recipe) => {
    dispatch({ type: "EDIT_RECIPE", payload: recipe });
  };

  const addToBasket = (recipe) => {
    dispatch({ type: "ADD_TO_BASKET", payload: recipe });
  };

  const subtractToBasket = (recipe) => {
    dispatch({ type: "SUBTRACT_TO_BASKET", payload: recipe });
  };

  useEffect(() => {
    if (ingredientsSelector) {
      setIngredients(ingredientsSelector);
    }
  }, [ingredientsSelector]);

  return (
    <div
      className="RecipeBox"
      style={notEnough ? { backgroundColor: "silver" } : null}
    >
      {loading && (
        <div className="loading-container">
          <ReactLoading
            type={"spokes"}
            color={"rgb(72, 133, 184)"}
            width={50}
          />
        </div>
      )}
      <div>
        <div className="recipe-name">{recipe.name}</div>
        <p className="ingredient-title">Ingredients:</p>
        <ol>
          {recipe.recipeIngredients.map((ingredient) => {
            let exists = ingredients.find(
              (ingredientRedux) =>
                ingredientRedux._id === ingredient.ingredient._id
            );
            let style =
              exists === undefined
                ? { color: "red" }
                : ingredient.quantity <= exists.quantity
                ? null
                : { color: "red" };

            return (
              <li key={`${ingredient._id}-$ingredientGroup`} style={style}>
                {exists ? null : (
                  <span
                    className="warning bg-warning"
                    data-toggle="tooltip"
                    data-placement="right"
                    title="This ingredient doesn't exist on your database."
                  >
                    !
                  </span>
                )}
                <span>
                  {ingredient.ingredient && ingredient.ingredient.name}
                </span>
                <span>
                  {ingredient.quantity} {ingredient.displayUnit}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
      <div className="button-group">
        <Link to="/add-recipe">
          <button onClick={() => editBtn(recipe)}>✏️</button>
        </Link>
        <button onClick={() => deleteButtonClickHandler(recipe.name)}>
          ❌
        </button>
      </div>
      <div className="basket-button-group">
        <button onClick={() => subtractToBasket(recipe)} disabled={notInBasket}>
          -
        </button>
        <span>{basketCounter}</span>
        <button onClick={() => addToBasket(recipe)} disabled={notEnough}>
          +
        </button>
      </div>
    </div>
  );
};

export default RecipeBox;
