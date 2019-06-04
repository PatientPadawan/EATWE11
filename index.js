'use strict';

const appID = '970294f3';
const appKey = '48eb586b09ce231c601672ea32d2256a';
let query = 'oatmeal, yogurt'

function shopifyExample(responseJson) {
    whisk.queue.push(function() {
        whisk.listeners.addClickListener('whisk-button', 'shoppingList.addRecipeToList', {
            recipeUrl: `${responseJson.hits[0].recipe.url}`,
        });
    });
    console.log('whisk ran');
}

function shopify(responseJson) {
    for (let i = 0; i < 3; i++) {
        whisk.queue.push(function() {
            whisk.listeners.addClickListener(`whisk-button${[i]}`, 'shoppingList.addRecipeToList', {
                recipeUrl: `${responseJson.hits[i].recipe.url}`,
            });
        });
        console.log(`whisk ran on recipe ${[i]}`);
        console.log(responseJson.hits[i].recipe.url);
    }
}

function renderResults(responseJson) {
    for (let i = 0; i < 3; i++) {
        let recipeYield = responseJson.hits[i].recipe.yield;
        let fat = Math.round(responseJson.hits[i].recipe.totalNutrients.FAT['quantity'] / recipeYield);
        let pro = Math.round(responseJson.hits[i].recipe.totalNutrients.PROCNT['quantity'] / recipeYield);
        let cho = Math.round(responseJson.hits[i].recipe.totalNutrients.CHOCDF['quantity'] / recipeYield);
        let cal = Math.round(responseJson.hits[i].recipe.totalNutrients.ENERC_KCAL['quantity'] / recipeYield);

        $('#results').append(
            `<h2>${responseJson.hits[i].recipe.label}</h2>
            <img src="${responseJson.hits[i].recipe.image}" class="resultsImage" alt="picture of ${responseJson.hits[i].recipe.label}">
            <h3 class="headers">Ingredients</h3>
            <ul id="ingredientsList${[i]}"></ul>
            <h3 class="headers">Nutrition Facts</h3>
            <ul id="NutritionFacts">
            <li>Serves: ${recipeYield}</li>
            <li>Calories: ${cal} kCal</li>
            <li>Carbohydrates: ${cho}g</li>
            <li>Protein: ${pro}g</li>
            <li>Fats: ${fat}g</li>
            </ul>
            <h3 class="headers"><a href="${responseJson.hits[i].recipe.url}" target="_blank">Directions</a><h3>
            <button type="button" class="shopRecipe" id="whisk-button${[i]}">Shop recipe!</button>
            `
        )
        
        console.log(responseJson.hits[i].recipe.url);
        for (let c = 0; c < responseJson.hits[i].recipe.ingredientLines.length; c++) {
            $(`#ingredientsList${[i]}`).append(`<li>${responseJson.hits[i].recipe.ingredientLines[c]}<li>`);   
        }
    }
    
    $('#results').removeClass('hidden');
    shopify(responseJson);
    const scrollToForm = document.getElementById("results");
    scrollToForm.scrollIntoView({behavior: 'smooth'});
}


function getRecipe(recipeQuery) {
    fetch(recipeQuery)
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error('broken');
    })
    // .then(responseJson => console.log(responseJson))
    .then(responseJson => renderResults(responseJson))
    .catch(err => {
        $('#js-error-message').text(`That didn't work!`)
        $('#js-error-message').removeClass('hidden');
    });
}

function generateUserRecipeQuery(queryItem, userTDEE) {
    let calPerMealMin = Math.round(userTDEE / 3 - 50)
    let calPerMealMax = Math.round(userTDEE / 3 + 50)
    let recipeQuery = `https://api.edamam.com/search?q=${queryItem}&app_id=${appID}&app_key=${appKey}&calories=${calPerMealMin}-${calPerMealMax}`;

    console.log('generating user recipe query!');
    console.log(userTDEE, calPerMealMin, calPerMealMax);

    getRecipe(recipeQuery);
}

function generateRecipeKeyword(userTDEE) {
    const recipeKeywords = [
        "chicken",
        "egg",
        "bean",
        "beef",
        "rice",
        "orange",
        "pasta",
        "taco",
        "salmon"
    ];

    let queryItem = recipeKeywords[Math.floor(Math.random()*recipeKeywords.length)];
    generateUserRecipeQuery(queryItem, userTDEE)
}

function userTDEECalc(userHeight, userWeight, userAge, userActivityLevel, userSex) {
    let height = userHeight * 2.54;
    let weight = userWeight / 2.205;
    let userTDEE = 0;
    if (userSex === 'male') {
        userTDEE = ((10 * weight) + (6.25 * height) - (5 * userAge) + 5) * userActivityLevel
    } else {
        userTDEE = ((10 * weight) + (6.25 * height) - (5 * userAge) -161) * userActivityLevel
    }

    console.log(userTDEE);
    console.log('userTDEECalc ran');

    generateRecipeKeyword(userTDEE);
}

function watchUserInput() {
    $('#userDataInput').submit(event => {
        event.preventDefault();
        const userHeight = $('#height').val();
        const userWeight = $('#weight').val();
        const userAge = $('#age').val();
        const userActivityLevel = $('input[name=activityLevel]:checked').val()
        const userSex = $("input[name=sex]:checked").val();

        $('#exampleRecipe').addClass('hidden');
        $('#results').empty();

        console.log(userHeight, userWeight, userAge, userActivityLevel, userSex);
        userTDEECalc(userHeight, userWeight, userAge, userActivityLevel, userSex);
    });

    console.log('watchUserInput ran');
}

function renderInputForm() {
    $('#userDataInput').empty();
    $('#userDataInput').append(`
    <div class="form-container-1" id="js-scroll">
      <label>Anthropometric Data:</label><br>
      <label>Height (in):</label>
      <input type="number" id="height" value="74"><br>

      <label>Weight (lbs):</label>
      <input type="number" id="weight" value="195"><br>

      <label>Age in years:</label>
      <input type="number" id="age" value="45"><br>
    </div>

    <div class="form-container-2">
      <label>Activity Level:</label><br>
      <input type="radio" id="sedentary" name="activityLevel"  value="1.2" checked>
      <label for="sedentary">Sedentary</label><br>

      <input type="radio" id="light" name="activityLevel" value="1.375">
      <label for="light">Lightly Active</label><br>

      <input type="radio" id="moderate" name="activityLevel" value="1.55">
      <label for="moderate">Moderately Active</label><br>

      <input type="radio" id="very" name="activityLevel" value="1.725">
      <label for="very">Very Active</label><br>

      <input type="radio" id="extra" name="activityLevel" value="1.9">
      <label for="extra">Extra Active</label><br>
    </div>

    <div class="form-container-3">
      <label>Sex:</label><br>
      <input type="radio" id="female" name="sex" value="female" checked>
      <label for="female">Female</label><br>

      <input type="radio" id="male" name="sex" value="male">
      <label for="male">Male</label><br>

      <input type="submit">
    </div>
    `)

    $('#userDataInput').removeClass('hidden');
    console.log('renderUserInputForm ran');

    watchUserInput();
}

function watchStartButton() {
    $('.js-start-button').click(event => {
        renderInputForm();
        const scrollToForm = document.getElementById("js-scroll");
        scrollToForm.scrollIntoView({behavior: 'smooth'});
    });
    
    console.log('watchStartButton ran');
}

function renderExample(responseJson) {
    const exampleYield = responseJson.hits[0].recipe.yield;
    const exampleFat = Math.round(responseJson.hits[0].recipe.totalNutrients.FAT['quantity'] / exampleYield);
    const examplePro = Math.round(responseJson.hits[0].recipe.totalNutrients.PROCNT['quantity'] / exampleYield);
    const exampleCho = Math.round(responseJson.hits[0].recipe.totalNutrients.CHOCDF['quantity'] / exampleYield);
    const exampleCal = Math.round(responseJson.hits[0].recipe.totalNutrients.ENERC_KCAL['quantity'] / exampleYield);

    $('#exampleRecipe').prepend(
        `<h2>${responseJson.hits[0].recipe.label}</h2>
        <img src="${responseJson.hits[0].recipe.image}" class="resultsImage" alt="picture of ${responseJson.hits[0].recipe.label}">
        <h3 class="headers">Ingredients</h3>
        <ul id="exampleIngredientsList"></ul>
        <h3 class="headers">Nutrition Facts</h3>
        <ul id="exampleNutritionFacts">
        <li>Serves: ${exampleYield}</li>
        <li>Calories: ${exampleCal} kCal</li>
        <li>Carbohydrates: ${exampleCho}g</li>
        <li>Protein: ${examplePro}g</li>
        <li>Fats: ${exampleFat}g</li>
        </ul>
        <h3 class="headers"><a href="${responseJson.hits[0].recipe.url}" target="_blank">Directions</a><h3>
        `
    )
    
    console.log(responseJson.hits[0].recipe.url);
    for (let i = 0; i < responseJson.hits[0].recipe.ingredientLines.length; i++) {
        $('#exampleIngredientsList').append(`<li>${responseJson.hits[0].recipe.ingredientLines[i]}<li>`);   
    }

    $('#exampleRecipe').removeClass('hidden');
    shopifyExample(responseJson);
}

function getExampleRecipe() {
    const url = `https://api.edamam.com/search?q=${query}&app_id=${appID}&app_key=${appKey}`;

    fetch(url)
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error('broken');
    })
    // .then(responseJson => console.log(responseJson))
    .then(responseJson => renderExample(responseJson))
    .catch(err => {
        $('#js-error-message').text(`That didn't work!`)
        $('#js-error-message').removeClass('hidden');
    });
}

$(function() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    console.log('EATWE11 ready');
    getExampleRecipe();
    console.log('Getting example recipe');
    watchStartButton();
    console.log('Watching start button')
});