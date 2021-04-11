import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import bookmarksView from './views/bookmarksView.js';
import paginationView from './views/paginationView.js';
import addRecipeView from './views/addRecipeView.js';

// console.log(icons);
import 'core-js/stable'; //polyfilling a lot
import 'regenerator-runtime/runtime'; //polyfilling async await
// import { classof } from 'core-js/core/object';

// if (module.hot) {
//   module.hot.accept();
// }
const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) {
      return;
    }
    recipeView.renderSpinner();
    //0. update results view to match selected element
    resultsView.update(model.getSearchResultsPage());
    bookmarksView.update(model.state.bookmarks);

    // 1. loading recipe
    await model.loadRecipe(id);
    // const { recipe } = model.state;

    //2. rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    console.error(err);
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    //1. Get search query
    const query = searchView.getQuery();
    if (!query) {
      return;
    }
    //2. Load search results
    await model.loadSearchResults(query);
    // console.log(model.state.search.results);
    // console.log(model.getSearchResultsPage(1));
    // 3. render result
    resultsView.render(model.getSearchResultsPage());

    // 4 Render the initial paginationa buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  // Render new results
  resultsView.render(model.getSearchResultsPage(goToPage));

  // Render new paginationa buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  //Update the recipe servings (in state)
  model.updateServings(newServings);

  //Update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // Add or remove bookmark
  if (!model.state.recipe.bookmarked) {
    model.addBookmark(model.state.recipe);
  } else {
    model.deleteBookmark(model.state.recipe.id);
  }
  console.log(model.state.recipe);
  //Update recipe view
  recipeView.update(model.state.recipe);
  //render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    //Show spinner
    addRecipeView.renderSpinner();
    // console.log(333);

    //Upload the new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    //render recipe
    recipeView.render(model.state.recipe);

    //success message
    addRecipeView.renderMessage();

    //Render bookmark view
    bookmarksView.render(model.state.bookmarks);

    //Change ID in the URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    //close form window
    setTimeout(function () {
      let x = document
        .querySelector('.add-recipe-window')
        .classList.contains('hidden');
      console.log(x);
      if (x) {
        return;
      }

      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000000);
  } catch (err) {
    console.error('🤯🤯🤯', err);
    addRecipeView.renderError(err.message);
  }
  // addRecipeView.renewFormRecipe();
};

const newFeature = function () {
  console.log('This is the branch New Feature');
  console.log('Welcome');
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  newFeature();
}; //publisher-subscriber method
init();
