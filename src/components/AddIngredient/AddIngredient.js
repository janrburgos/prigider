import "./AddIngredient.css";

import axios from "axios";
import ReactLoading from "react-loading";
import React, { useState, useEffect } from "react";
import { connect, useDispatch, useSelector } from "react-redux";

const AddIngredient = ({
  ingredients,
  ingredientToEdit,
  ingredientIsEdit,
  weightUnits,
  volumeUnits,
}) => {
  const restaurant = useSelector((state) => state.restaurant);
  const [name, setName] = useState("");
  const [density, setDensity] = useState(1);
  const [remarks, setRemarks] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  const [ingredientId, setIngredientId] = useState("");
  const [displayUnit, setDisplayUnit] = useState("gram");

  const dispatch = useDispatch();

  let ingredientCategories = ingredients.map(
    (ingredient) => ingredient.category
  );
  ingredientCategories = [...new Set(ingredientCategories)];
  let ingredientLocations = ingredients.map(
    (ingredient) => ingredient.location
  );
  ingredientLocations = [...new Set(ingredientLocations)];

  const saveBtnHandler = () => {
    setErrorMsg("");

    // input validation
    if (name.trim() === "") {
      setErrorMsg("Name must not be empty");
    } else if (
      ingredients.some(
        (ingredient) =>
          ingredient.name === name.trim().toLowerCase() &&
          ingredientIsEdit === false
      )
    ) {
      setErrorMsg("The ingredient already exists");
    } else if (quantity < 0) {
      setErrorMsg("Quantity must not be zero or less");
    } else if (quantity % 1 !== 0 && displayUnit === "piece") {
      setErrorMsg("Quantity must be a whole number when unit is PIECE");
    } else if (density < 0.001 && displayUnit !== "piece") {
      setErrorMsg("Density must not be less than 0.001");
    } else {
      setLoading(true);
      let convertedQuantity;
      // conversions
      if (displayUnit !== "piece") {
        // convert quantity to grams, if unit is weight
        if (weightUnits.some((weight) => weight.name === displayUnit)) {
          convertedQuantity =
            quantity *
            weightUnits.find((weight) => weight.name === displayUnit)
              .conversion;
        } else {
          // if unit is volume and not weight
          convertedQuantity =
            density *
            (quantity *
              volumeUnits.find((volume) => volume.name === displayUnit)
                .conversion);
        }
      }
      // check if this is a new ingredient or edited ingredient
      if (ingredientIsEdit === false) {
        axios
          .post("https://prigider-be.herokuapp.com/api/ingredients", {
            name: name.trim().toLowerCase(),
            quantity: convertedQuantity,
            displayUnit,
            density: displayUnit === "piece" ? null : density,
            remarks,
            totalCost,
            category: category.trim().toLowerCase(),
            location: location.trim().toLowerCase(),
          })
          .then(async (res) => {
            let ingredientIds = await ingredients.map(
              (ingredient) => ingredient._id
            );
            axios
              .put(
                `https://prigider-be.herokuapp.com/api/restaurant/${restaurant._id}`,
                {
                  ingredients: [...ingredientIds, res.data._id],
                }
              )
              .then((res) => {
                dispatch({ type: "UPDATE_RESTAURANT", payload: res.data });
                dispatch({
                  type: "UPDATE_INGREDIENTS",
                  payload: res.data.ingredients,
                });

                localStorage.setItem("restaurant", JSON.stringify(res.data));
                localStorage.setItem(
                  "ingredients",
                  JSON.stringify(res.data.ingredients)
                );

                setLoading(false);
                alert(
                  `Ingredient ${name
                    .trim()
                    .toUpperCase()} has been added to the inventory`
                );
              });
          })
          .catch(() => {
            setLoading(false);
            alert("communication error");
          });
      } else {
        axios
          .put(
            `https://prigider-be.herokuapp.com/api/ingredients/${ingredientId}`,
            {
              name: name.trim().toLowerCase(),
              quantity: convertedQuantity,
              displayUnit,
              density: displayUnit === "piece" ? null : density,
              remarks,
              totalCost,
              category: category.trim().toLowerCase(),
              location: location.trim().toLowerCase(),
            }
          )
          .then((res) => {
            dispatch({ type: "CONFIRM_EDIT_INGREDIENT", payload: res.data });
            setLoading(false);
            alert(
              `Ingredient ${name
                .trim()
                .toUpperCase()} has been added to the inventory`
            );
          })
          .catch(() => {
            setLoading(false);
            alert("communication error");
          });
      }

      setName("");
      setQuantity(0);
      setDisplayUnit("gram");
      setDensity(1);
      setRemarks("");
      setTotalCost(0);
      setCategory("");
      setLocation("");
      setIngredientId("");
      setErrorMsg("");
    }
  };

  useEffect(() => {
    setName(ingredientToEdit.name);
    setQuantity(ingredientToEdit.quantity);
    setDisplayUnit(ingredientToEdit.displayUnit);
    setDensity(ingredientToEdit.density);
    setRemarks(ingredientToEdit.remarks);
    setTotalCost(ingredientToEdit.totalCost);
    setCategory(ingredientToEdit.category);
    setLocation(ingredientToEdit.location);
    setIngredientId(ingredientToEdit._id);
  }, [ingredientToEdit]);

  useEffect(() => {
    if (displayUnit === "piece") {
      document.querySelector("#density").disabled = true;
    } else {
      document.querySelector("#density").disabled = false;
    }
  }, [displayUnit]);

  return (
    <div className="AddIngredient">
      {loading && (
        <div className="loading-container">
          <ReactLoading
            type={"spokes"}
            color={"rgb(72, 133, 184)"}
            width={50}
          />
        </div>
      )}
      <h2 className="title">{ingredientIsEdit ? "Edit" : "Add"} Ingredient</h2>
      <div className="form-container">
        <div className="form-row">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="form-row">
          <label htmlFor="quantity">Quantity:</label>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
        </div>
        <div className="form-row">
          <label htmlFor="unit">Unit:</label>
          <select
            name="unit"
            id="unit"
            value={displayUnit}
            onChange={(e) => setDisplayUnit(e.target.value)}
          >
            <optgroup label="Piece">
              <option value="piece">piece</option>
            </optgroup>
            <optgroup label="Weight">
              {weightUnits.map((unit) => (
                <option
                  key={`addIngredient-weight-${unit.name}`}
                  value={unit.name}
                >
                  {unit.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="Volume">
              {volumeUnits.map((unit) => (
                <option
                  key={`addIngredient-volume-${unit.name}`}
                  value={unit.name}
                >
                  {unit.name}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
        <div className="form-row">
          <label htmlFor="density">Density:</label>
          <input
            type="number"
            id="density"
            step="0.001"
            value={density}
            onChange={(e) => setDensity(Number(e.target.value))}
          />
        </div>
        <div className="form-row">
          <label htmlFor="total-cost">Total Cost:</label>
          <input
            type="number"
            id="total-cost"
            value={totalCost}
            onChange={(e) => setTotalCost(Number(e.target.value))}
          />
        </div>
        <div className="form-row">
          <label htmlFor="category">Category:</label>
          <input
            type="text"
            list="categories"
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <datalist id="categories">
            {ingredientCategories.map((category) => (
              <option
                key={`ingredient-category-${category}`}
                value={category}
              />
            ))}
          </datalist>
        </div>
        <div className="form-row">
          <label htmlFor="location">Location:</label>
          <input
            type="text"
            list="locations"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <datalist id="locations">
            {ingredientLocations.map((location) => (
              <option
                key={`ingredient-location-${location}`}
                value={location}
              />
            ))}
          </datalist>
        </div>
        <div className="form-row">
          <label htmlFor="remarks">Remarks:</label>
          <textarea
            name="remarks"
            id="remarks"
            cols="30"
            rows="10"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          ></textarea>
        </div>
        <p className="error-msg">{errorMsg}</p>
        <div className="form-row">
          <div></div>
          <button className="btn btn-primary" onClick={saveBtnHandler}>
            submit
          </button>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = ({
  ingredients,
  ingredientToEdit,
  ingredientIsEdit,
  weightUnits,
  volumeUnits,
}) => ({
  ingredients,
  ingredientToEdit,
  ingredientIsEdit,
  weightUnits,
  volumeUnits,
});

export default connect(mapStateToProps)(AddIngredient);
