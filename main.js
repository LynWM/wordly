//DOM
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const resultsContainer = document.getElementById("results-container");
const favouritesContainer = document.getElementById("favourites-container");
const clearBtn = document.getElementById("clear-btn");

//search function
function search() {
    const query = searchInput.value.trim(); //*Research
    if (query !== "") {
        searchWords(query);
    }
}

//Event Listener for search button
searchBtn.addEventListener("click", search);

//Event Listener for Enter button
searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        search()
    }
});

function clearInput() {
    if (searchInput.value.trim() !== "") {
        clearBtn.style.display = "block";
    } else {
        clearBtn.style.display = "none"
    }
}

//Clear button
searchInput.addEventListener("input", clearInput);

clearBtn.addEventListener("click", () => {
    searchInput.value="";
    resultsContainer.innerHTML="";
    clearBtn.style.display="none";
});

//Hide clear button on page reload
clearInput();

//fetch details
async function searchWords(query) {
    resultsContainer.innerHTML = "<p> Loading... </p>"

    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${query}`);
        const data = await response.json();

        displayResults(data);

    } catch (error) {
        console.error("Error fetching data", error);
        resultsContainer.innerHTML = "<p> An error occured. Please try again. </p>"
    }
}

function displayResults(definitions) {
    resultsContainer.innerHTML = ""

    if (!definitions || definitions.title === "No Definitions Found") {
        resultsContainer.innerHTML = "<p> Definition not found. Please try again. </p>"
        return;
    }

    definitions.forEach((definition) => {
        const detailsCard = document.createElement("div");
        detailsCard.classList.add("details-card");

        const word = definition.word;
        const phonetic = definition.phonetics[0]?.text || "N/A";
        const meaning = definition.meanings[0]?.definitions[0]?.definition || "No definition available";
        
        //Issues found...returning the error message and not the value
        const example = definition.meanings[0]?.definitions[0]?.example || "No example found";
        const origin = definition.origin || "Unknown";

        detailsCard.innerHTML = `
            <h3>${word} (${phonetic})</h3>
            <p><strong>Definition:</strong> ${meaning}</p>
            <p><strong>Origin:</strong> ${origin}</p>
            <p>Example: <em>${example}</em></p>
        `;

        resultsContainer.appendChild(detailsCard);
    });
}