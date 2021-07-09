import "./Basket.css";
import BasketItem from "../BasketItem/BasketItem";

import axios from "axios";
import { useSelector, useDispatch } from "react-redux";

const Basket = () => {
  const basket = useSelector((state) => state.basket);
  const restaurant = useSelector((state) => state.restaurant);
  const ingredients = useSelector((state) => state.ingredients);

  const dispatch = useDispatch();

  const confirmBasketClickHandler = () => {
    if (
      window.confirm("Do you want to update your inventory with these recipes?")
    ) {
      // group all ingredients from recipes from the basket into one array
      let ingredientsForReduction = [];
      basket.forEach((item) => {
        item.recipeIngredients.forEach((recipeIngredient) => {
          if (
            ingredientsForReduction.find(
              (ingredient) => ingredient._id === recipeIngredient.ingredient._id
            ) === undefined
          ) {
            ingredientsForReduction.push({
              _id: recipeIngredient.ingredient._id,
              quantity: item.itemQuantity * recipeIngredient.quantity,
              name: recipeIngredient.ingredient.name,
            });
          } else {
            ingredientsForReduction = ingredientsForReduction.map(
              (ingredient) =>
                ingredient._id === recipeIngredient.ingredient._id
                  ? {
                      ...ingredient,
                      quantity:
                        ingredient.quantity +
                        item.itemQuantity * recipeIngredient.quantity,
                    }
                  : ingredient
            );
          }
        });
      });

      // get final result after inventory reduction
      let reducedIngredients = ingredientsForReduction.map((ingredientFR) => {
        let remainingQuantity = ingredients.find(
          (ingredient) => ingredient._id === ingredientFR._id
        ).quantity;
        let initialTotalCost = ingredients.find(
          (ingredient) => ingredient._id === ingredientFR._id
        ).totalCost;
        let initialQuantity = ingredientFR.quantity + remainingQuantity;
        let remainingTotalCost =
          (remainingQuantity * initialTotalCost) / initialQuantity;
        return {
          ...ingredientFR,
          quantity: remainingQuantity,
          totalCost: remainingTotalCost,
        };
      });

      // put request on every reduced ingredients and update all redux
      const ingredientPutRequests = async () => {
        reducedIngredients.forEach((ingredient) => {
          axios.put(
            `https://prigider-be.herokuapp.com/api/ingredients/${ingredient._id}`,
            {
              quantity: ingredient.quantity,
              totalCost: ingredient.totalCost,
            }
          );
        });
      };

      ingredientPutRequests()
        .then(() => {
          axios(
            `https://prigider-be.herokuapp.com/api/restaurant/${restaurant.username}`
          ).then((res) => {
            dispatch({
              type: "UPDATE_INGREDIENTS",
              payload: res.data[0].ingredients,
            });
            localStorage.setItem(
              "ingredients",
              JSON.stringify(res.data[0].ingredients)
            );
          });
        })
        .then(() => {
          dispatch({ type: "EMPTY_BASKET", payload: "confirm" });
          alert("Inventory updated");
        });
    }
  };

  const emptyBasketClickHandler = () => {
    if (window.confirm("Are you sure you want to empty the basket?")) {
      dispatch({ type: "EMPTY_BASKET", payload: "empty" });
      alert("Basket emptied");
    }
  };

  return (
    <div className="Basket">
      <button
        className="btn btn-success confirm-button"
        onClick={confirmBasketClickHandler}
        disabled={basket.length === 0 && true}
      >
        confirm
      </button>
      <button
        className="btn btn-danger empty-button"
        onClick={emptyBasketClickHandler}
        disabled={basket.length === 0 && true}
      >
        empty
      </button>
      <div className="basket-item-container">
        {basket.map((item) => {
          let notEnough = false;

          item.recipeIngredients.forEach((itemIngredient) => {
            const ingredientToCompare = ingredients.find(
              (ingredient) => ingredient.name === itemIngredient.ingredient.name
            );
            if (
              ingredientToCompare === undefined ||
              ingredientToCompare.quantity < itemIngredient.quantity
            ) {
              notEnough = true;
            }
          });

          return (
            <BasketItem
              item={item}
              key={`basket-item-${item._id}`}
              notEnough={notEnough}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Basket;
