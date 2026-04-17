// DOM
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const resultsContainer = document.getElementById("results-container");
const favouritesContainer = document.getElementById("favourites-container");
const clearBtn = document.getElementById("clear-btn");

// search function
function search() {
    const query = searchInput.value.trim();
    if (query !== "") {
        searchWords(query);
    }
}

searchBtn.addEventListener("click", search);

searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        search();
    }
});

// clear button
function clearInput() {
    clearBtn.style.display = searchInput.value.trim() ? "block" : "none";
}

searchInput.addEventListener("input", clearInput);

clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    resultsContainer.innerHTML = "";
    clearBtn.style.display = "none";
});

clearInput();

// fetching words from API
async function searchWords(query) {
    resultsContainer.innerHTML = "<p> Loading... </p>";

    try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${query}`);
        const data = await response.json();

        displayResults(data);

    } catch (error) {
        console.error("Error fetching data", error);
        resultsContainer.innerHTML = "<p> An error occurred. Please try again. </p>";
    }
}

// displaying search results
function displayResults(definitions) {
    resultsContainer.innerHTML = "";

    if (!definitions || definitions.title === "No Definitions Found") {
        resultsContainer.innerHTML = "<p> Definition not found. Please try again. </p>";
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
        const example = definition.meanings?.[0]?.definitions?.[0]?.example || "No example available";

        detailsCard.innerHTML = `
            <h3>${word}</h3>
            <span> (${phonetic}) ${audio ? `<button class="audio-btn"><i class="fa-solid fa-play"></i></button>` : ""} </span>
            <p><strong>Part of Speech:</strong> ${speech}</p>
            <p><strong>Definition:</strong> ${meaning}</p>
            <p>Example: <em>${example}</em></p>
        `;

        //audio button
        if (audio) {
            const audioBtn = detailsCard.querySelector(".audio-btn");
            audioBtn.addEventListener("click", () => {
                const sound = new Audio(audio);
                sound.play();
            });
        }

        // add to favourites button
        const addBtn = document.createElement("button");
        addBtn.textContent = "Add to Favourites";

        addBtn.addEventListener("click", async () => {
            const added = await addToFavourites(definition);

            if (added) {
                addBtn.textContent = "Added";
                addBtn.disabled = true;
            }
        });

        detailsCard.appendChild(addBtn);
        resultsContainer.appendChild(detailsCard);
    });
}

// add to favourites function
async function addToFavourites(definition) {

    const word = definition.word.toLowerCase();

    try {

        const response = await fetch("http://localhost:3000/favourites");
        const favourites = await response.json();

        const exists = favourites.some(item => item.word.toLowerCase() === word);

        if (exists) {
            alert("This word is already in your favourites!");
            return false;
        }

        const phonetic = definition.phonetics?.[0]?.text || "N/A";
        const audio = definition.phonetics?.find(p => p.audio)?.audio || "";
        const speech = definition.meanings?.[0]?.partOfSpeech || "N/A";
        const meaning = definition.meanings?.[0]?.definitions?.[0]?.definition || "";
        const example = definition.meanings?.[0]?.definitions?.[0]?.example || "No example available";

        // saving to db.json
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
        return true;

    } catch (error) {
        console.error("Error adding to favourites:", error);
        return false;
    }
}

// loading favourites
async function loadFavourites() {
    try {
        const response = await fetch("http://localhost:3000/favourites");
        const definitions = await response.json();

        displayFavourites(definitions);

    } catch (error) {
        console.error("Error loading saved words:", error);
    }
}

// display favourites
function displayFavourites(definitions) {
    favouritesContainer.innerHTML = "";

    if (definitions.length === 0) {
        favouritesContainer.innerHTML = "<p>You currently have no favourites</p>";
        return;
    }

    definitions.forEach((definition) => {
        const card = document.createElement("div");
        card.classList.add("details-card");

        renderViewMode(card, definition);
        favouritesContainer.appendChild(card);
    });
}

// rendering card
function renderViewMode(card, definition) {
    card.innerHTML = `
        <h3>${definition.word}</h3>
        <span> (${definition.phonetic}) ${definition.audio ? `<button class="audio-btn"><i class="fa-solid fa-play"></i></button>` : ""}</span>
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

// delete function
async function deleteDefinition(id) {
    await fetch(`http://localhost:3000/favourites/${id}`, {
        method: "DELETE"
    });

    loadFavourites();
}

// initial load
loadFavourites();