'use strict';

const appID = '970294f3';
const appKey = '48eb586b09ce231c601672ea32d2256a';
let query = 'chicken'

function renderResults(responseJson) {
    const exampleYield = responseJson.hits[0].recipe.yield;
    const exampleFat = Math.round(responseJson.hits[0].recipe.totalNutrients.FAT['quantity'] / exampleYield);
    const examplePro = Math.round(responseJson.hits[0].recipe.totalNutrients.PROCNT['quantity'] / exampleYield);
    const exampleCho = Math.round(responseJson.hits[0].recipe.totalNutrients.CHOCDF['quantity'] / exampleYield);
    const exampleCal = Math.round(responseJson.hits[0].recipe.totalNutrients.ENERC_KCAL['quantity'] / exampleYield);

    $('#exampleRecipe').append(
        `<h2>${responseJson.hits[0].recipe.label}</h2>
        <img src="${responseJson.hits[0].recipe.image}" alt="picture of recipe">
        <h3>Ingredients:</h3>
        <ul id="exampleIngredientsList"></ul>
        <h3>Nutrition Facts:</h3>
        <ul id="exampleNutritionFacts">
        <li>Serves: ${exampleYield}</li>
        <li>Calories: ${exampleCal} kCal</li>
        <li>Carbohydrates: ${exampleCho}g</li>
        <li>Protein: ${examplePro}g</li>
        <li>Fats: ${exampleFat}g</li>
        </ul>
        <h3><a href="${responseJson.hits[0].recipe.url}" target="_blank">Directions</a><h3>
        `
    )
    
    for (let i = 0; i < responseJson.hits[0].recipe.ingredientLines.length; i++) {
     $('#exampleIngredientsList').append(`<li>${responseJson.hits[0].recipe.ingredientLines[i]}<li>`);   
    }

    $('#exampleRecipe').removeClass('hidden');
}

function getRecipe() {
    const url = `https://api.edamam.com/search?q=${query}&app_id=${appID}&app_key=${appKey}`;

    fetch(url)
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error('broken');
    })
    // .then(responseJson => console.log(responseJson))
    .then(responseJson => renderResults(responseJson))
    .catch(err => {
        $('#js-error-message').text(`That didn't work!`);
    });
}

$(function() {
    console.log('EATWE11 ready');
    getRecipe();
    console.log('Getting example recipe');
});