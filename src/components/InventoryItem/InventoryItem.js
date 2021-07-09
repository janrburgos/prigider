import "./InventoryItem.css";

import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import axios from "axios";

const InventoryItem = ({ ingredient }) => {
  const restaurant = useSelector((state) => state.restaurant);
  const weightUnits = useSelector((state) => state.weightUnits);
  const volumeUnits = useSelector((state) => state.volumeUnits);
  const ingredients = useSelector((state) => state.ingredients);
  const [expand, setExpand] = useState("closed");
  const [updateType, setUpdateType] = useState("");
  const [unit, setUnit] = useState(ingredient.displayUnit);
  const [bottomDivContentHeight, setBottomDivContentHeight] = useState(0);
  const [bottomButtonText, setBottomButtonText] = useState("view details");

  const [updateQuantity, setUpdateQuantity] = useState("");
  const [updateUnit, setUpdateUnit] = useState(ingredient.displayUnit);
  const [updateTotalCost, setUpdateTotalCost] = useState("");

  const updateInventoryRef = useRef(null);
  const inventoryDetailsRef = useRef(null);

  const dispatch = useDispatch();
  const history = useHistory();

  const deleteButtonClickHandler = (name) => {
    if (
      window.confirm(`Are you sure you want to delete ${name.toUpperCase()}?`)
    ) {
      axios
        .delete(
          `https://prigider-be.herokuapp.com/api/ingredients/${ingredient._id}`
        )
        .then(async (res) => {
          let ingredientIds = await ingredients.map(
            (ingredient) => ingredient._id
          );
          ingredientIds = await ingredientIds.filter(
            (id) => id !== res.data._id
          );
          axios
            .put(
              `https://prigider-be.herokuapp.com/api/restaurant/${restaurant._id}`,
              {
                ingredients: [...ingredientIds],
              }
            )
            .then(async (res) => {
              let restaurantData = await res.data;
              dispatch({ type: "UPDATE_RESTAURANT", payload: restaurantData });
              dispatch({
                type: "UPDATE_INGREDIENTS",
                payload: restaurantData.ingredients,
              });
              dispatch({
                type: "UPDATE_RECIPES",
                payload: restaurantData.recipes,
              });
              localStorage.setItem(
                "restaurant",
                JSON.stringify(restaurantData)
              );
              localStorage.setItem(
                "ingredients",
                JSON.stringify(restaurantData.ingredients)
              );
              localStorage.setItem(
                "recipes",
                JSON.stringify(restaurantData.recipes)
              );
            });
        });

      dispatch({ type: "EMPTY_BASKET", payload: "empty" });
      alert(`${name.toUpperCase()} has been deleted`);
    }
  };

  const editButtonClickHandler = (ingredient) => {
    dispatch({ type: "EDIT_INGREDIENT", payload: ingredient });
    history.push("/add-ingredient");
  };

  const updateInventoryButtonClickHandler = async (type) => {
    await setUpdateType(type);
    setExpand("update");
    setBottomButtonText("cancel");
    setBottomDivContentHeight(updateInventoryRef.current.clientHeight);
  };

  const changeInventoryQuantityClickHandler = () => {
    dispatch({ type: "EMPTY_BASKET", payload: "empty" });

    let convertedQuantity = Number(updateQuantity);
    // conversions
    if (updateUnit !== "piece") {
      // convert quantity to grams, if unit is weight
      if (weightUnits.some((weight) => weight.name === updateUnit)) {
        convertedQuantity =
          updateQuantity *
          weightUnits.find((weight) => weight.name === updateUnit).conversion;
      } else {
        // if unit is volume and not weight
        convertedQuantity =
          ingredient.density *
          (updateQuantity *
            volumeUnits.find((volume) => volume.name === updateUnit)
              .conversion);
      }
    }

    if (updateType === "increase") {
      axios
        .put(
          `https://prigider-be.herokuapp.com/api/ingredients/${ingredient._id}`,
          {
            quantity: ingredient.quantity + convertedQuantity,
            totalCost: ingredient.totalCost + Number(updateTotalCost),
          }
        )
        .then((res) => {
          axios(
            `https://prigider-be.herokuapp.com/api/restaurant/${restaurant.username}`
          ).then((res) => {
            dispatch({
              type: "UPDATE_INGREDIENTS",
              payload: [...res.data[0].ingredients],
            });
            localStorage.setItem(
              "ingredients",
              JSON.stringify(res.data[0].ingredients)
            );
          });
        })
        .catch((err) => {
          return console.error(err);
        });
      alert(`${ingredient.name.toUpperCase()} has been successfully updated`);
    } else {
      let newQuantity = ingredient.quantity - convertedQuantity;
      if (newQuantity < 0) {
        newQuantity = 0;
      }
      let totalCostReduction =
        (ingredient.totalCost * convertedQuantity) / ingredient.quantity;
      let newTotalCost = ingredient.totalCost - totalCostReduction;
      if (newTotalCost < 0) {
        newTotalCost = 0;
      }
      axios
        .put(
          `https://prigider-be.herokuapp.com/api/ingredients/${ingredient._id}`,
          {
            quantity: newQuantity,
            totalCost: newTotalCost,
          }
        )
        .then((res) => {
          axios(
            `https://prigider-be.herokuapp.com/api/restaurant/${restaurant.username}`
          ).then((res) => {
            dispatch({
              type: "UPDATE_INGREDIENTS",
              payload: [...res.data[0].ingredients],
            });
            localStorage.setItem(
              "ingredients",
              JSON.stringify(res.data[0].ingredients)
            );
          });
        })
        .catch((err) => {
          return console.error(err);
        });
      alert(`${ingredient.name.toUpperCase()} has been successfully updated`);
    }

    bottomButtonClickHandler();
  };

  const bottomButtonClickHandler = () => {
    switch (expand) {
      case "closed":
        setExpand("details");
        setBottomDivContentHeight(inventoryDetailsRef.current.clientHeight);
        setBottomButtonText("hide details");
        break;
      case "details":
        setExpand("closed");
        setBottomButtonText("view details");
        break;
      case "update":
        setExpand("closed");
        setBottomButtonText("view details");
        setUpdateType("");
        break;

      default:
        return;
    }
  };

  useEffect(() => {
    if (Number(updateQuantity) < 0) {
      setUpdateQuantity(0);
    }
    if (Number(updateTotalCost) < 0) {
      setUpdateTotalCost(0);
    }
  }, [updateQuantity, updateTotalCost]);

  return (
    <div className="InventoryItem">
      <div className="ingredient-button-group">
        <div>
          <button
            className="increase-inventory-button"
            onClick={() => updateInventoryButtonClickHandler("increase")}
          >
            +
          </button>
          <button
            className="reduce-inventory-button"
            onClick={() => updateInventoryButtonClickHandler("reduce")}
          >
            -
          </button>
        </div>
        <div>
          <button onClick={() => editButtonClickHandler(ingredient)}>✏️</button>
          <button onClick={() => deleteButtonClickHandler(ingredient.name)}>
            ❌
          </button>
        </div>
      </div>
      <div className="top-div">
        <p className="inventory-item-name">{ingredient.name}</p>
        <div>
          <div className="inventory-item-quantity">
            {/* display the converted quantity based on ingredient's unit and density */}
            {unit === "piece"
              ? ingredient.quantity
              : weightUnits.some((weight) => weight.name === unit)
              ? (
                  ingredient.quantity /
                  weightUnits.find((weight) => weight.name === unit).conversion
                ).toFixed(3)
              : (
                  ingredient.quantity /
                  volumeUnits.find((volume) => volume.name === unit)
                    .conversion /
                  ingredient.density
                ).toFixed(3)}
          </div>
          <div className="inventory-item-unit">
            <select
              name="edit-unit"
              id="edit-unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            >
              <option hidden value={ingredient.displayUnit}>
                {ingredient.displayUnit}
              </option>
              {ingredient.displayUnit === "piece" && (
                <option value="piece">piece</option>
              )}
              {ingredient.displayUnit !== "piece" && (
                <optgroup label="Weight">
                  {weightUnits.map((unit) => (
                    <option
                      key={`inventoryItem-weight-${unit.name}`}
                      value={unit.name}
                    >
                      {unit.name}
                    </option>
                  ))}
                </optgroup>
              )}
              {ingredient.displayUnit !== "piece" && (
                <optgroup label="Volume">
                  {volumeUnits.map((unit) => (
                    <option
                      key={`inventoryItem-volume-${unit.name}`}
                      value={unit.name}
                    >
                      {unit.name}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>
        </div>
      </div>
      {/* all the bottom divs here */}
      {/* for details */}
      <div
        className="bottom-div"
        style={
          expand === "details"
            ? {
                height: `${bottomDivContentHeight}px`,
                visibility: "visible",
              }
            : {
                height: 0,
                visibility: "hidden",
              }
        }
      >
        <div className="bottom-div-content" ref={inventoryDetailsRef}>
          <p> Category: {ingredient.category} </p>
          <p> Location: {ingredient.location} </p>
          <p> Total Cost: Php {ingredient.totalCost.toFixed(2)} </p>
          <p> Remarks: {ingredient.remarks} </p>
        </div>
      </div>
      {/* for updating inventory */}
      <div
        className="bottom-div update-inventory-div"
        style={
          expand === "update"
            ? {
                height: `${bottomDivContentHeight + 10}px`,
                visibility: "visible",
              }
            : {
                height: 0,
                visibility: "hidden",
              }
        }
      >
        <div
          className="bottom-div-content update-inventory"
          ref={updateInventoryRef}
        >
          <div className="input-row">
            <label htmlFor="update-quantity">quantity:</label>
            <input
              type="number"
              id="update-quantity"
              value={updateQuantity}
              onChange={(e) => setUpdateQuantity(e.target.value)}
            ></input>
          </div>
          <div className="input-row">
            <label htmlFor="unit">unit:</label>
            <select
              name="unit"
              id="unit"
              value={updateUnit}
              onChange={(e) => setUpdateUnit(e.target.value)}
            >
              {ingredient.displayUnit === "piece" ? (
                <optgroup label="Piece">
                  <option value="piece">piece</option>
                </optgroup>
              ) : (
                <>
                  <optgroup label="Weight">
                    {weightUnits.map((unit) => (
                      <option
                        key={`update-ingredient-inv-item-weight-${unit.name}`}
                        value={unit.name}
                      >
                        {unit.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Volume">
                    {volumeUnits.map((unit) => (
                      <option
                        key={`update-ingredient-inv-item-volume-${unit.name}`}
                        value={unit.name}
                      >
                        {unit.name}
                      </option>
                    ))}
                  </optgroup>
                </>
              )}
            </select>
          </div>
          {updateType === "increase" && (
            <div className="input-row">
              <label htmlFor="update-total-cost">cost:</label>
              <input
                type="number"
                id="update-total-cost"
                value={updateTotalCost}
                onChange={(e) => setUpdateTotalCost(e.target.value)}
              ></input>
            </div>
          )}
        </div>
      </div>

      {/* end of bottom divs here */}
      <div className="bottom-button-group">
        {updateType !== "" && (
          <button
            className="proceed-button"
            style={
              (updateType === "reduce" && updateQuantity !== "") ||
              (updateType === "increase" &&
                updateQuantity !== "" &&
                updateTotalCost !== "")
                ? { backgroundColor: "green", color: "white" }
                : null
            }
            disabled={
              updateQuantity === "" ||
              (updateTotalCost === "" && updateType === "increase")
                ? true
                : false
            }
            onClick={changeInventoryQuantityClickHandler}
          >
            proceed
          </button>
        )}
        <button
          className="cancel-button"
          onClick={bottomButtonClickHandler}
          style={
            updateType !== ""
              ? { backgroundColor: "red", color: "white" }
              : null
          }
        >
          {bottomButtonText}
        </button>
      </div>
    </div>
  );
};

export default InventoryItem;
