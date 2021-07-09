// weight is in grams per milliliter
const initState = {
  editAccount: false,
  restaurant: {},
  ingredients: [],
  recipes: [],
  ingredientToEdit: {
    _id: "",
    name: "",
    quantity: 0,
    displayUnit: "gram",
    density: 1,
    remarks: "",
    totalCost: 0,
    category: "",
    location: "",
  },
  ingredientIsEdit: false,
  recipeToEdit: {
    _id: "",
    name: "",
    details: "",
    recipeIngredients: [],
    category: "",
    imageUrl: "",
  },
  recipeIsEdit: false,
  weightUnits: [
    { name: "gram", conversion: 1 },
    { name: "kilogram", conversion: 1000 },
    { name: "milligram", conversion: 1 / 1000 },
    { name: "ounce", conversion: 28.35 },
    { name: "pound", conversion: 453.59 },
  ],
  volumeUnits: [
    { name: "milliliter", conversion: 1 },
    { name: "liter", conversion: 1000 },
    { name: "fluid ounce", conversion: 29.57 },
    { name: "pint", conversion: 473.18 },
    { name: "quart", conversion: 946.35 },
    { name: "gallon", conversion: 3785.41 },
    { name: "teaspoon", conversion: 4.93 },
    { name: "tablespoon", conversion: 14.79 },
    { name: "cup", conversion: 236.59 },
  ],
  basket: [],
};

const reducer = (state = initState, action) => {
  let newIngredientsArray;
  let newRecipesArray;
  let newBasket;
  let newBasketItem;
  let recipeIngredients;
  let newIngredients;

  switch (action.type) {
    case "EDIT_ACCOUNT":
      return {
        ...state,
        editAccount: action.payload,
      };

    case "UPDATE_RESTAURANT":
      return {
        ...state,
        restaurant: { ...action.payload },
      };

    case "UPDATE_INGREDIENTS":
      return {
        ...state,
        ingredients: [...action.payload],
      };

    case "UPDATE_RECIPES":
      return {
        ...state,
        recipes: [...action.payload],
      };

    case "EDIT_INGREDIENT":
      return {
        ...state,
        ingredientToEdit: { ...action.payload },
        ingredientIsEdit: true,
      };

    case "CLEAR_INGREDIENT_EDIT":
      return {
        ...state,
        ingredientIsEdit: false,
        ingredientToEdit: {
          _id: "",
          name: "",
          quantity: 0,
          displayUnit: "gram",
          density: 1,
          remarks: "",
          totalCost: 0,
          category: "",
          location: "",
        },
      };

    case "CONFIRM_EDIT_INGREDIENT":
      newIngredientsArray = state.ingredients.map((ingredient) =>
        ingredient._id === action.payload._id ? action.payload : ingredient
      );
      return {
        ...state,
        ingredients: [...newIngredientsArray],
        ingredientIsEdit: false,
        ingredientToEdit: {
          _id: "",
          name: "",
          quantity: 0,
          displayUnit: "gram",
          density: 1,
          remarks: "",
          totalCost: 0,
          category: "",
          location: "",
        },
      };

    case "EDIT_RECIPE":
      return {
        ...state,
        recipeToEdit: { ...action.payload },
        recipeIsEdit: true,
      };

    case "CLEAR_RECIPE_EDIT":
      return {
        ...state,
        recipeIsEdit: false,
        recipeToEdit: {
          _id: "",
          name: "",
          details: "",
          recipeIngredients: [],
          category: "",
          imageUrl: "",
        },
      };

    case "CONFIRM_EDIT_RECIPE":
      newRecipesArray = state.recipes.map((recipe) =>
        recipe._id === action.payload._id ? action.payload : recipe
      );
      return {
        ...state,
        recipes: [...newRecipesArray],
        recipeIsEdit: false,
        recipeToEdit: {
          _id: "",
          name: "",
          details: "",
          recipeIngredients: [],
          category: "",
          imageUrl: "",
        },
      };

    case "INCREASE_INVENTORY":
      return {
        ...state,
        ingredients: [
          ...state.ingredients.map((ingredient) =>
            ingredient._id === action.payload._id
              ? {
                  ...ingredient,
                  quantity: ingredient.quantity + action.payload.quantity,
                  totalCost: ingredient.totalCost + action.payload.totalCost,
                }
              : ingredient
          ),
        ],
      };

    case "REDUCE_INVENTORY":
      let ingredientToReduce = state.ingredients.find(
        (ingredient) => ingredient._id === action.payload._id
      );
      let newQuantity = ingredientToReduce.quantity - action.payload.quantity;
      let newTotalCost =
        ingredientToReduce.totalCost -
        (action.payload.quantity * ingredientToReduce.totalCost) /
          ingredientToReduce.quantity;

      if (newQuantity < 0) {
        newQuantity = 0;
      }
      if (newTotalCost < 0) {
        newTotalCost = 0;
      }
      return {
        ...state,
        ingredients: [
          ...state.ingredients.map((ingredient) =>
            ingredient.name === action.payload.ingredientName
              ? {
                  ...ingredient,
                  quantity: newQuantity,
                  totalCost: newTotalCost,
                }
              : ingredient
          ),
        ],
      };

    case "ADD_TO_BASKET":
      // for changing ingredients state
      recipeIngredients = action.payload.recipeIngredients;
      newIngredients = [...state.ingredients];

      recipeIngredients.forEach((recipeIngredient) => {
        newIngredients.map((newIngredient) =>
          recipeIngredient.ingredient._id === newIngredient._id
            ? (newIngredient.quantity -= recipeIngredient.quantity)
            : newIngredient
        );
      });

      // for changing basket state
      newBasket = [];
      if (
        state.basket.find((item) => item._id === action.payload._id) ===
        undefined
      ) {
        newBasket = [...state.basket, { ...action.payload, itemQuantity: 1 }];
      } else {
        newBasket = state.basket.map((item) =>
          item._id === action.payload._id
            ? { ...item, itemQuantity: item.itemQuantity + 1 }
            : item
        );
      }

      return {
        ...state,
        ingredients: newIngredients,
        basket: newBasket,
      };

    case "SUBTRACT_TO_BASKET":
      recipeIngredients = action.payload.recipeIngredients;
      newIngredients = [...state.ingredients];
      newBasket = [...state.basket];

      newBasketItem = state.basket.find(
        (item) => item._id === action.payload._id
      );

      if (newBasketItem === undefined) {
        return { ...state };
      } else {
        // for changing ingredients state
        recipeIngredients.forEach((recipeIngredient) => {
          newIngredients.map((newIngredient) =>
            recipeIngredient.ingredient._id === newIngredient._id
              ? (newIngredient.quantity += recipeIngredient.quantity)
              : newIngredient
          );
        });

        // for changing basket state
        if (newBasketItem.itemQuantity <= 1) {
          newBasket = newBasket.filter(
            (item) => item._id !== action.payload._id
          );
        } else {
          newBasket = state.basket.map((item) =>
            item._id === action.payload._id
              ? { ...item, itemQuantity: item.itemQuantity - 1 }
              : item
          );
        }
      }

      return {
        ...state,
        ingredients: newIngredients,
        basket: newBasket,
      };

    case "DELETE_FROM_BASKET":
      // for updating ingredients state
      recipeIngredients = action.payload.recipeIngredients;
      newIngredients = [...state.ingredients];

      recipeIngredients.forEach((recipeIngredient) => {
        newIngredients.map((newIngredient) =>
          recipeIngredient.ingredient._id === newIngredient._id
            ? (newIngredient.quantity +=
                recipeIngredient.quantity * action.payload.itemQuantity)
            : newIngredient
        );
      });

      // update quantity of ingredients inventory
      return {
        ...state,
        ingredients: newIngredients,
        basket: [
          ...state.basket.filter((item) => item._id !== action.payload._id),
        ],
      };

    case "EMPTY_BASKET":
      if (action.payload === "confirm") {
        return {
          ...state,
          basket: [],
        };
      } else {
        // iterate through basket array and update ingredients inventory in each iteration
        state.basket.forEach((basketItem) => {
          recipeIngredients = basketItem.recipeIngredients;
          newIngredients = [...state.ingredients];

          recipeIngredients.forEach((recipeIngredient) => {
            newIngredients.map((newIngredient) =>
              recipeIngredient.ingredient._id === newIngredient._id
                ? (newIngredient.quantity +=
                    recipeIngredient.quantity * basketItem.itemQuantity)
                : newIngredient
            );
          });
        });

        return {
          ...state,
          ingredients: newIngredients,
          basket: [],
        };
      }

    default:
      return state;
  }
};

export default reducer;
