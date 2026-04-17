//DOM
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const resultsContainer = document.getElementById("results-container");
const favouritesContainer = document.getElementById("favourites-container");
const clearBtn = document.getElementById("clear-btn");

//search function
function search() {
    const query = searchInput.value.trim();
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
    clearBtn.style.display = searchInput.value.trim() ?"block" :"none";
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

// display search results
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
        const phonetic = definition.phonetics?.[0]?.text || "N/A";
        const audio = definition.phonetics?.find(p => p.audio)?.audio || "";
        const speech = definition.meanings?.[0]?.partOfSpeech || "N/A";
        const meaning = definition.meanings?.[0]?.definitions?.[0]?.definition || "";
        const example = definition.meanings?.[0]?.definitions?.[0]?.example || "No available example";
        

        detailsCard.innerHTML = `
            <h3>${word} (${phonetic})</h3>
            ${audio ? `<button class="audio-btn">Play</button>` : ""}
            <p><strong>Part of Speech:</strong> ${speech}</p>
            <p><strong>Definition:</strong> ${meaning}</p>
            <p>Example: <em>${example}</em></p>
        `;

        if (definition.audio) {
            const audioBtn = card.querySelector(".audio-btn");
            audioBtn.addEventListener("click", () => {
                const sound = new Audio(definition.audio);
                sound.play();
        });
    }

        //Add to Favourites
        const addBtn = document.createElement("button");
        addBtn.textContent = "Add to Favourites";
        
        addBtn.addEventListener("click", () => {
            addToFavourites(definition);
            addBtn.textContent = "Added";
            addBtn.disabled = true;
        });

        detailsCard.appendChild(addBtn);
        resultsContainer.appendChild(detailsCard);
    });
}

//saving to favourites
async function addToFavourites(definition) {
    
    const word = definition.word;
    const phonetic = definition.phonetics?.[0]?.text || "N/A";
    const audio = definition.phonetics?.find(p => p.audio)?.audio || "";
    const speech = definition.meanings?.[0]?.partOfSpeech || "N/A";
    const meaning = definition.meanings?.[0]?.definitions?.[0]?.definition || "";
    const example = definition.meanings?.[0]?.definitions?.[0]?.example || "No available example";

    await fetch("http://localhost:3000/favourites", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            word,
            phonetic,
            audio,
            speech,
            meaning,
            example,
        })
    });

    loadFavourites();
}

// Loading Favourites
async function loadFavourites() {
    try {
        const response = await fetch("http://localhost:3000/favourites");
        const definitions = await response.json();

        displayFavourites(definitions);

    } catch (error) {
        console.error("Error loading saved words:", error);
    }
}

// displaying favourites
function displayFavourites(definitions) {
    favouritesContainer.innerHTML = "";

    if (definitions.length === 0) {
        favouritesContainer.innerHTML = "<p>You currently have no favourites</p>";
        return;
    }

    definitions.forEach((definition) => {
        const card = document.createElement("div");
        card.classList.add("definition-card");

        renderViewMode(card, definition);

        favouritesContainer.appendChild(card);
    });
}

//rendering favourites
function renderViewMode(card, definition) {
    card.innerHTML = `
        <h3>${definition.word} (${definition.phonetic})</h3>
        ${definition.audio ? `<button class="audio-btn">Play</button>` : ""}
        <p><strong>Part of Speech:</strong> ${definition.speech}</p>
        <p><strong>Definition:</strong> ${definition.meaning}</p>
        <p>Example: <em>${definition.example}</em></p>
    `;

    if (definition.audio) {
            const audioBtn = card.querySelector(".audio-btn");
            audioBtn.addEventListener("click", () => {
                const sound = new Audio(definition.audio);
                sound.play();
        });
    }

    // delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';

    deleteBtn.addEventListener("click", () => {
        deleteDefinition(definition.id);
    });

    card.appendChild(deleteBtn);
}

// deleting from favourites
async function deleteDefinition(id) {
    await fetch(`http://localhost:3000/favourites/${id}`, {
        method: "DELETE"
    });

    loadFavourites();
}

//initial load
loadFavourites();