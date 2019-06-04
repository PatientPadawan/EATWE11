'use strict';

const appID = '970294f3';
const appKey = '48eb586b09ce231c601672ea32d2256a';
const query = 'oatmeal, yogurt'

let vh = window.innerHeight * 0.01;
document.documentElement.style.setProperty('--vh', `${vh}px`);

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

    const scrollToForm = document.getElementById("js-results-container");
    scrollToForm.scrollIntoView({behavior: 'smooth'});
}

function scrollToTop() {
    $('.scrollToTop').click(event => {
        const scrollToTop = document.getElementById("js-landing");
        scrollToTop.scrollIntoView({behavior: 'smooth'});
    });
}

function renderResults(responseJson) {
    for (let i = 0; i < 3; i++) {
        let recipeYield = responseJson.hits[i].recipe.yield;
        let fat = Math.round(responseJson.hits[i].recipe.totalNutrients.FAT['quantity'] / recipeYield);
        let pro = Math.round(responseJson.hits[i].recipe.totalNutrients.PROCNT['quantity'] / recipeYield);
        let cho = Math.round(responseJson.hits[i].recipe.totalNutrients.CHOCDF['quantity'] / recipeYield);
        let cal = Math.round(responseJson.hits[i].recipe.totalNutrients.ENERC_KCAL['quantity'] / recipeYield);

        $('#results').append(
            `<div class="resultsContainer" id="js-results-container">
                <h2>${responseJson.hits[i].recipe.label}</h2>
                <img src="${responseJson.hits[i].recipe.image}" class="resultsImage" alt="picture of ${responseJson.hits[i].recipe.label}">
                <button type="button" class="shopRecipe headers" id="whisk-button${[i]}">Shop</button>
                <span class="recipeDirections headers"><a href="${responseJson.hits[i].recipe.url}" target="_blank">Directions</a></span>
                <div class="factStyle">
                    <h3 class="headers">Nutrition Facts</h3>
                    <ul id="nutritionFacts">
                        <li>Serves: ${recipeYield}</li>
                        <li>Calories: ${cal} kCal</li>
                        <li>Carbohydrates: ${cho}g</li>
                        <li>Protein: ${pro}g</li>
                        <li>Fats: ${fat}g</li>
                    </ul>
                </div>
                </div>
            `
        )
        
        console.log(responseJson.hits[i].recipe.url);
    }
    
    $('#results').append(`<button class="scrollToTop headers hidden">^</button>`);
    $('#results').removeClass('hidden');
    $('.scrollToTop').removeClass('hidden');
    shopify(responseJson);
    scrollToTop();
}


function getRecipe(recipeQuery) {
    fetch(recipeQuery)
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error('broken');
    })
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
        "bean",
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
        $('#results').empty();

        console.log(userHeight, userWeight, userAge, userActivityLevel, userSex);
        userTDEECalc(userHeight, userWeight, userAge, userActivityLevel, userSex);
    });

    console.log('watchUserInput ran');
}

function renderInputForm() {
    $('#userDataInput').empty();
    $('#userDataInput').append(`
    <div class="user-input-form" id="js-scroll">
        <div class="form-container-1">
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

        <input type="radio" id="male" name="sex" value="male" checked>
        <label for="male">Male</label>

        <input type="radio" id="female" name="sex" value="female">
        <label for="female">Female</label><br>

        <input type="submit">
        </div>
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

$(function() {
    console.log('EATWE11 ready');
    watchStartButton();
});