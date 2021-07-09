import "./AddRecipe.css";

import axios from "axios";
import React, { useState, useEffect } from "react";
import { connect, useSelector, useDispatch } from "react-redux";

const AddRecipe = ({
  recipeToEdit,
  recipeIsEdit,
  weightUnits,
  volumeUnits,
}) => {
  const restaurant = useSelector((state) => state.restaurant);
  const recipesSelector = useSelector((state) => state.recipes);
  const ingredientsSelector = useSelector((state) => state.ingredients);
  const [name, setName] = useState("");
  const [details, setDetails] = useState("");
  const [category, setCategory] = useState("");
  const [recipeId, setRecipeId] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [recipes, setRecipes] = useState(recipesSelector);
  const [recipeIngredients, setRecipeIngredients] = useState([]);
  // state for new ingredient
  const [addedIngredient, setAddedIngredient] = useState();
  const [ingredientQuantity, setIngredientQuantity] = useState("");
  const [ingredientDisplayUnit, setIngredientDisplayUnit] = useState("");
  // other states
  const [errorMsg, setErrorMsg] = useState("");
  const [ingredientErrorMsg, setIngredientErrorMsg] = useState("");

  let recipeCategories = recipes.map((recipe) => recipe.category);
  recipeCategories = [...new Set(recipeCategories)];

  const dispatch = useDispatch();

  const ingredientSelectChangeHandler = (_id) => {
    setAddedIngredient(
      ingredients.find((ingredient) => ingredient._id === _id)
    );
  };

  const addIngredientHandler = () => {
    setErrorMsg("");
    setIngredientErrorMsg("");

    // ingredient input validation
    if (addedIngredient === undefined) {
      setIngredientErrorMsg("Please select an ingredient");
    } else if (
      recipeIngredients.some(
        (ingredient) => ingredient.ingredient._id === addedIngredient._id
      )
    ) {
      setIngredientErrorMsg("The ingredient already exists");
    } else if (ingredientQuantity < 0.001) {
      setIngredientErrorMsg("Quantity must not be zero or a negative number");
    } else if (
      ingredientQuantity % 1 !== 0 &&
      ingredientDisplayUnit === "piece"
    ) {
      setIngredientErrorMsg(
        "Quantity must be a whole number when unit is PIECE"
      );
    } else {
      setRecipeIngredients([
        ...recipeIngredients,
        {
          ingredient: addedIngredient,
          quantity: Number(ingredientQuantity),
          displayUnit: ingredientDisplayUnit.trim().toLowerCase(),
        },
      ]);

      setIngredientErrorMsg("");
    }
  };

  const saveBtnHandler = () => {
    setErrorMsg("");
    setIngredientErrorMsg("");

    // input validation
    if (name.trim() === "") {
      setErrorMsg("Name must not be empty");
    } else if (
      recipes.some((recipe) => recipe.name === name.trim().toLowerCase()) &&
      recipeIsEdit === false
    ) {
      setErrorMsg("The recipe already exists");
    } else if (recipeIngredients.length === 0) {
      setErrorMsg("There should be at least one ingredient");
    } else {
      // get recipeIngredients array and convert to ingredient ids only
      let newRecipeIngredients = recipeIngredients.map((ingredient) => {
        return { ...ingredient, ingredient: ingredient.ingredient._id };
      });

      if (recipeIsEdit === false) {
        axios
          .post("https://prigider-be.herokuapp.com/api/recipe", {
            name: name.trim().toLowerCase(),
            details,
            category: category.trim().toLowerCase(),
            recipeIngredients: newRecipeIngredients,
          })
          .then(async (res) => {
            let recipeIds = await recipes.map((recipe) => recipe._id);
            axios
              .put(
                `https://prigider-be.herokuapp.com/api/restaurant/${restaurant._id}`,
                {
                  recipes: [...recipeIds, res.data._id],
                }
              )
              .then((res) => {
                dispatch({
                  type: "UPDATE_RESTAURANT",
                  payload: { ...res.data },
                });
                dispatch({
                  type: "UPDATE_RECIPES",
                  payload: [...res.data.recipes],
                });

                localStorage.setItem("restaurant", JSON.stringify(res.data));
                localStorage.setItem(
                  "recipes",
                  JSON.stringify(res.data.recipes)
                );
              });
          });
      } else {
        axios
          .put(`https://prigider-be.herokuapp.com/api/recipe/${recipeId}`, {
            name: name.trim().toLowerCase(),
            details,
            category: category.trim().toLowerCase(),
            recipeIngredients: newRecipeIngredients,
          })
          .then((res) => {
            dispatch({ type: "CONFIRM_EDIT_RECIPE", payload: res.data });
            let oldRecipes = JSON.parse(localStorage.getItem("recipes"));
            oldRecipes = oldRecipes.map((recipe) =>
              recipe._id === res.data._id ? res.data : recipe
            );
            localStorage.setItem("recipes", JSON.stringify(oldRecipes));
          });
      }

      // clear all input when addition of new ingredient is successful
      setName("");
      setDetails("");
      setCategory("");
      setRecipeIngredients([]);
      setAddedIngredient();
      setIngredientQuantity("");
      setIngredientDisplayUnit("");
      setErrorMsg("");
      setIngredientErrorMsg("");

      alert(
        `Recipe ${name.trim().toUpperCase()} has been added to the recipe list`
      );
    }
  };

  useEffect(() => {
    setName(recipeToEdit.name);
    setDetails(recipeToEdit.details);
    setCategory(recipeToEdit.category);
    setRecipeIngredients(recipeToEdit.recipeIngredients);
    setRecipeId(recipeToEdit._id);
  }, [recipeToEdit, recipeIsEdit]);

  // useEffect for when an ingredient with a "piece" unit is selected
  useEffect(() => {
    // get all ingredients with "piece as displayUnit"
    let ingredientsWithPiece = ingredients.filter(
      (ingredient) => ingredient.displayUnit === "piece"
    );
    // if ingredient to be added is found inside the array of ingredients with "piece" as displayUnit, change value of selector for unit to piece and disable it. Else, enable the selector for unit.
    if (addedIngredient) {
      if (
        ingredientsWithPiece.some(
          (ingredient) => ingredient._id === addedIngredient._id
        )
      ) {
        setIngredientDisplayUnit("piece");
        document.querySelector("#ingredient-unit").disabled = true;
      } else {
        setIngredientDisplayUnit("gram");
        document.querySelector("#ingredient-unit").disabled = false;
      }
    }
  }, [addedIngredient, ingredients]);

  useEffect(() => {
    if (recipesSelector) {
      setRecipes(recipesSelector);
    }
  }, [recipesSelector]);

  useEffect(() => {
    if (ingredientsSelector) {
      setIngredients(ingredientsSelector);
    }
  }, [ingredientsSelector]);

  return (
    <div className="AddRecipe">
      <h2 className="title">{recipeIsEdit ? "Edit" : "Add"} Recipe</h2>
      <div className="form-container">
        <div className="form-row">
          <label htmlFor="name">Name:</label>
          <input
            className="input-padding"
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="form-row">
          <label htmlFor="category">Category:</label>
          <input
            className="input-padding"
            type="text"
            list="recipe-categories"
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <datalist id="recipe-categories">
            {recipeCategories.map((category) => (
              <option key={`recipe-category-${category}`} value={category} />
            ))}
          </datalist>
        </div>
        <div className="form-row">
          <label htmlFor="details">Details:</label>
          <textarea
            className="input-padding"
            name="details"
            id="details"
            cols="30"
            rows="10"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          ></textarea>
        </div>
        {/* added ingredients display */}
        <div className="ingredient-display-container">
          <div className="ingredients-title">Ingredients:</div>
          {recipeIngredients.length === 0 && (
            <div className="no-ingredients">No ingredients added yet</div>
          )}
          {recipeIngredients.map((ingredient) => (
            <p
              key={`${ingredient.ingredient.name}-to-add-ingredient`}
              className="ingredient-added"
            >
              <span>{ingredient.ingredient.name}</span>
              <span>
                - {ingredient.quantity} {ingredient.displayUnit}
                {ingredient.quantity > 1 && "s"}
              </span>
              <button
                className="btn btn-danger"
                onClick={(e) => {
                  // put all elements with class "list-of-ingredients" into an array, target the parent element of this button and find its index from the created array, and use that index to remove an ingredient from the recipeIngredients state
                  let ingredientsArray = [
                    ...document.querySelectorAll(".ingredient-added"),
                  ];
                  let ingredientIndex = ingredientsArray.findIndex(
                    (ingredient) => ingredient === e.target.parentElement
                  );
                  setRecipeIngredients(
                    recipeIngredients.filter(
                      (ingredient, i) => i !== ingredientIndex
                    )
                  );
                }}
              >
                x
              </button>
            </p>
          ))}
        </div>
        {/* add ingredients input */}
        <div className="ingredients-input">
          <div className="form-row">
            <label htmlFor="ingredient-name">Ingredient Name:</label>
            <select
              name="ingredient-name"
              id="ingredient-name"
              onChange={(e) => ingredientSelectChangeHandler(e.target.value)}
            >
              <option value="" hidden>
                select ingredient
              </option>
              {ingredients.map((ingredient) => (
                <option
                  key={`ingredient-option-${ingredient._id}`}
                  value={ingredient._id}
                >
                  {ingredient.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label htmlFor="ingredient-quantity">Quantity:</label>
            <div>
              <input
                type="number"
                id="ingredient-quantity"
                value={ingredientQuantity}
                onChange={(e) => setIngredientQuantity(e.target.value)}
              />
              <select
                name="ingredient-unit"
                id="ingredient-unit"
                value={ingredientDisplayUnit}
                onChange={(e) => setIngredientDisplayUnit(e.target.value)}
              >
                <option value="piece" hidden>
                  piece
                </option>
                <optgroup label="Weight">
                  {weightUnits.map((unit) => (
                    <option
                      key={`addRecipe-weight-${unit.name}`}
                      value={unit.name}
                    >
                      {unit.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Volume">
                  {volumeUnits.map((unit) => (
                    <option
                      key={`addRecipe-volume-${unit.name}`}
                      value={unit.name}
                    >
                      {unit.name}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>
          <p
            className="error-msg"
            style={ingredientErrorMsg === "" ? { display: "none" } : null}
          >
            {ingredientErrorMsg}
          </p>
          <button className={"btn btn-success"} onClick={addIngredientHandler}>
            add ingredient
          </button>
        </div>
        <p className="error-msg">{errorMsg}</p>
        <div className="form-row">
          <div></div>
          <button
            className="btn btn-primary submit-button"
            onClick={saveBtnHandler}
          >
            submit
          </button>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = ({
  recipeToEdit,
  recipeIsEdit,
  weightUnits,
  volumeUnits,
}) => ({
  recipeToEdit,
  recipeIsEdit,
  weightUnits,
  volumeUnits,
});

export default connect(mapStateToProps)(AddRecipe);
