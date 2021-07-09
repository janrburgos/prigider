import "./BasketItem.css";

import { useDispatch } from "react-redux";
import React, { useState, useEffect, useRef } from "react";

const BasketItem = ({ item, notEnough }) => {
  const [itemCost, setItemCost] = useState(0);
  const [expand, setExpand] = useState(false);
  const [basketBottomDivContentHeight, setBasketBottomDivContentHeight] =
    useState(0);

  const basketBottomDivContentRef = useRef(null);

  const dispatch = useDispatch();

  const viewDetailsClickHandler = () => {
    if (expand) {
      setExpand(false);
      setBasketBottomDivContentHeight(0);
    } else {
      setExpand(true);
      setBasketBottomDivContentHeight(
        basketBottomDivContentRef.current.clientHeight
      );
    }
  };

  const addToBasket = (item) => {
    dispatch({ type: "ADD_TO_BASKET", payload: item });
  };

  const subtractToBasket = (item) => {
    if (item.itemQuantity === 1) {
      return;
    }
    dispatch({ type: "SUBTRACT_TO_BASKET", payload: item });
  };

  const deleteFromBasket = (item) => {
    dispatch({ type: "DELETE_FROM_BASKET", payload: item });
  };

  useEffect(() => {
    let newCost = 0;
    item.recipeIngredients.forEach(
      (ingredient) => (newCost += ingredient.ingredient.totalCost)
    );
    setItemCost(newCost);
  }, [item.recipeIngredients]);

  return (
    <div className="BasketItem">
      <div className="top-div">
        <p className="basket-item-name">{item.name}</p>
        <div className="basket-item-buttons">
          Quantity:
          <button
            className="quantity-button"
            onClick={() => subtractToBasket(item)}
            disabled={item.itemQuantity <= 1 ? true : false}
          >
            -
          </button>
          <span>{item.itemQuantity}</span>
          <button
            className="quantity-button"
            onClick={() => addToBasket(item)}
            disabled={notEnough}
          >
            +
          </button>
          <button
            className="delete-button"
            onClick={() => deleteFromBasket(item)}
          >
            ❌
          </button>
        </div>
      </div>
      <div
        className="bottom-div"
        style={{ height: `${basketBottomDivContentHeight}px` }}
      >
        <div className="bottom-div-content" ref={basketBottomDivContentRef}>
          <p>Category: {item.category}</p>
          <p>Details: {item.details}</p>
          <p>Cost Per Item: Php {itemCost.toFixed(2)}</p>
          <p>Total Cost: Php {(itemCost * item.itemQuantity).toFixed(2)}</p>
        </div>
      </div>
      <button className="view-button" onClick={viewDetailsClickHandler}>
        {expand ? "hide" : "view"} details
      </button>
    </div>
  );
};

export default BasketItem;
